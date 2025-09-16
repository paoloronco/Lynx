import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import { initializeDatabase, dbGet, dbAll, dbRun } from './database.js';
import {
  isFirstTimeSetup,
  setupInitialCredentials,
  authenticateUser,
  generateToken,
  authenticateToken,
  isPasswordStrong,
  generateSecurePassword
} from './auth.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { timingSafeEqual } from 'crypto';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function safeJsonParse(jsonString, defaultValue = {}) {
  try {
    if (typeof jsonString !== 'string') {
      return defaultValue;
    }
    const parsed = JSON.parse(jsonString);
    // Ensure the parsed value is an object and not an array or other type
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${PORT}`;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'dev-cookie-secret';

// Ensure correct client IP detection when behind a proxy/load balancer
// This is important so express-rate-limit keys by the real client IP
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", FRONTEND_URL],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    },
    reportOnly: false
  },
  crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(join(__dirname, '../dist')));
app.use(cookieParser(COOKIE_SECRET));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Extract IP from X-Forwarded-For if behind proxy, otherwise use remoteAddress
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  }
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 failed login attempts per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  },
  message: {
    success: false,
    error: 'Too many failed login attempts. Please try again later.'
  }
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 2,
});

// Apply rate limiting
app.use('/api', apiLimiter);

// Initialize database
await initializeDatabase();

// Auth Routes
app.get('/api/auth/setup-status', authLimiter, async (req, res) => {
  try {
    const firstTime = await isFirstTimeSetup();
    res.json({ isFirstTimeSetup: firstTime });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check setup status' });
  }
});

app.post('/api/auth/setup', authLimiter, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    await setupInitialCredentials(password);
    const token = generateToken('admin');
    
    res.json({ 
      success: true, 
      token,
      message: 'Admin account created successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    console.log('Login attempt received');
    const isValid = await authenticateUser(password);
    
    if (!isValid) {
      console.log('Login failed: Invalid password');
      // Get the stored user to check what's in the database
      const user = await dbGet('SELECT * FROM admin_users WHERE username = ?', ['admin']);
      console.log('Stored user data:', user);
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    console.log('Login successful, generating token...');
    const token = generateToken('admin');
    console.log('Token generated. Length:', token?.length);
    
    // Set secure cookie
    console.log('Setting signed auth cookie...');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      signed: true,
      maxAge: 12 * 60 * 60 * 1000,
    });
    console.log('Cookie set. Sending JSON response...');
    const body = JSON.stringify({ success: true, token });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.status(200).send(body);
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/verify', authLimiter, authenticateToken, async (req, res) => {
  try {
    // Get the full user data from database
    const user = await dbGet(
      'SELECT username FROM admin_users WHERE username = ?',
      [req.user.username]
    );
    
    if (!user) {
      return res.status(404).json({ valid: false, error: 'User not found' });
    }
    
    res.json({ 
      valid: true, 
      user: { 
        username: user.username 
      } 
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ valid: false, error: 'Verification failed' });
  }
});

// Profile Routes
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await dbGet('SELECT * FROM profile_data ORDER BY id DESC LIMIT 1');
    
    const normalizeAvatar = (avatar) => {
      if (!avatar || typeof avatar !== 'string') return '/assets/profile-avatar.jpg';
      // Support data URLs and external URLs
      if (avatar.startsWith('data:') || avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
      // Normalize old dev path to built assets path
      if (avatar.includes('/src/assets/profile-avatar')) return '/assets/profile-avatar.jpg';
      // Ensure leading slash
      if (!avatar.startsWith('/')) return `/${avatar}`;
      // If it points to /public during dev, map to dist root file
      if (avatar.startsWith('/public/')) return avatar.replace('/public/', '/');
      return avatar;
    };

    if (!profile) {
      // Return default profile. Use a public path that exists after build.
      return res.json({
        name: "Alex Johnson",
        bio: "Digital creator & entrepreneur sharing my favorite tools and resources. Follow along for the latest in tech, design, and productivity.",
        avatar: "/assets/profile-avatar.jpg",
        social_links: {},
        show_avatar: 1
      });
    }
    
    res.json({
      name: profile.name,
      bio: profile.bio,
      avatar: normalizeAvatar(profile.avatar) || '/assets/profile-avatar.jpg',
      social_links: safeJsonParse(profile.social_links, {}),
      show_avatar: profile.show_avatar === 0 ? 0 : 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, avatar, socialLinks, showAvatar } = req.body;
    
    // Check if profile exists
    const existing = await dbGet('SELECT id FROM profile_data LIMIT 1');
    
    if (existing) {
      await dbRun(
        'UPDATE profile_data SET name = ?, bio = ?, avatar = ?, social_links = ?, show_avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, bio, avatar, JSON.stringify(socialLinks || {}), showAvatar ? 1 : 0, existing.id]
      );
    } else {
      await dbRun(
        'INSERT INTO profile_data (name, bio, avatar, social_links, show_avatar) VALUES (?, ?, ?, ?, ?)',
        [name, bio, avatar, JSON.stringify(socialLinks || {}), showAvatar ? 1 : 0]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Links Routes
app.get('/api/links', async (req, res) => {
  try {
    const links = await dbAll('SELECT * FROM links WHERE is_active = 1 ORDER BY sort_order');
    
    const formattedLinks = links.map(link => ({
      id: link.id,
      title: link.title,
      description: link.description || '',
      url: link.url,
      type: link.type || 'link',
      icon: link.icon,
      iconType: link.icon_type || undefined,
      backgroundColor: link.background_color || undefined,
      textColor: link.text_color || undefined,
      size: link.size || undefined,
      content: link.content || undefined,
      textItems: link.text_items ? JSON.parse(link.text_items) : undefined
    }));
    
    res.json(formattedLinks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load links' });
  }
});

// Export links as JSON
app.get('/api/links/export', authenticateToken, async (req, res) => {
  try {
    const links = await dbAll('SELECT * FROM links ORDER BY sort_order');
    const payload = links.map((link) => ({
      id: String(link.id),
      title: link.title,
      description: link.description || '',
      url: link.url || '',
      type: link.type || 'link',
      icon: link.icon || null,
      iconType: link.icon_type || null,
      backgroundColor: link.background_color || null,
      textColor: link.text_color || null,
      size: link.size || null,
      content: link.content || null,
      textItems: link.text_items ? JSON.parse(link.text_items) : null,
      sortOrder: link.sort_order,
      isActive: link.is_active,
    }));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="links-export.json"');
    res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Failed to export links' });
  }
});

// Import links from JSON
app.post('/api/links/import', authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Invalid payload: expected an array' });
    }
    const incoming = req.body;
    // Basic shape normalization
    const normalized = incoming.map((l, i) => ({
      id: String(l.id ?? i + 1),
      title: String(l.title ?? ''),
      description: String(l.description ?? ''),
      url: String(l.url ?? ''),
      type: String(l.type ?? 'link'),
      icon: l.icon ?? null,
      iconType: l.iconType ?? null,
      backgroundColor: l.backgroundColor ?? null,
      textColor: l.textColor ?? null,
      size: l.size ?? null,
      content: l.content ?? null,
      textItems: Array.isArray(l.textItems) ? l.textItems : null,
    }));

    await dbRun('DELETE FROM links');
    for (let i = 0; i < normalized.length; i++) {
      const link = normalized[i];
      const textItemsValue = Array.isArray(link.textItems)
        ? JSON.stringify(
            link.textItems.map((item) =>
              typeof item === 'string' ? { text: item } : { text: item.text, url: item.url || '' }
            )
          )
        : null;
      await dbRun(
        'INSERT INTO links (id, title, description, url, icon, type, text_items, sort_order, is_active, background_color, text_color, size, icon_type, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          String(link.id),
          link.title,
          link.description,
          link.url,
          link.icon,
          link.type,
          textItemsValue,
          i,
          1,
          link.backgroundColor,
          link.textColor,
          link.size,
          link.iconType,
          link.content,
        ]
      );
    }
    res.json({ success: true, count: normalized.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import links' });
  }
});

// Define strict validation schema to avoid type confusion
const LinkSchema = z.object({
  // Accept string IDs from frontend (Date.now().toString())
  id: z.union([z.string().min(1), z.number().int().nonnegative()]),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional().default(''),
  url: z.string().max(2048).optional().default(''),
  icon: z.string().max(200).nullable().optional().default(null),
  type: z.string().min(1).max(50).optional().default('link'),
  // Support structured text items [{ text, url? }]
  textItems: z
    .array(
      z.union([
        z.string().max(200),
        z.object({ text: z.string().max(200), url: z.string().max(2048).optional() })
      ])
    )
    .nullable()
    .optional(),
  backgroundColor: z.string().max(50).nullable().optional(),
  textColor: z.string().max(50).nullable().optional(),
  size: z.string().max(20).nullable().optional(),
  iconType: z.string().max(50).nullable().optional(),
  content: z.string().max(5000).nullable().optional(),
}).strip();
const LinksPayloadSchema = z.array(LinkSchema).max(200);

app.put('/api/links', authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Request body must be an array of links.' });
    }
    
    const links = LinksPayloadSchema.parse(req.body);
    
    // Delete all existing links
    await dbRun('DELETE FROM links');
    
    // Insert new links
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const idValue = typeof link.id === 'string' ? link.id : String(link.id);
      const textItemsValue = Array.isArray(link.textItems)
        ? JSON.stringify(
            link.textItems.map((item) =>
              typeof item === 'string' ? { text: item } : { text: item.text, url: item.url || '' }
            )
          )
        : null;
      await dbRun(
        'INSERT INTO links (id, title, description, url, icon, type, text_items, sort_order, is_active, background_color, text_color, size, icon_type, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          idValue,
          link.title,
          link.description || '',
          link.url || '',
          link.icon || null,
          link.type || 'link',
          textItemsValue,
          i,
          1,
          link.backgroundColor || null,
          link.textColor || null,
          link.size || null,
          link.iconType || null,
          link.content || null
        ]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid links payload', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save links' });
  }
});

// Theme Routes
app.get('/api/theme', async (req, res) => {
  try {
    const theme = await dbGet('SELECT * FROM theme_config ORDER BY id DESC LIMIT 1');
    
    if (!theme) {
      return res.json({
        primary: '#007bff',
        background: '#ffffff',
        foreground: '#000000'
      });
    }
    
    // If we have a full theme configuration stored, return it
    if (theme.full_config) {
      try {
        const fullConfig = JSON.parse(theme.full_config);
        return res.json(fullConfig);
      } catch (e) {
        // Fall back to basic config if JSON parsing fails
      }
    }
    
    // Return basic config for backward compatibility
    res.json({
      primary: theme.primary_color,
      background: theme.background_color,
      foreground: theme.text_color
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load theme' });
  }
});

app.put('/api/theme', authenticateToken, async (req, res) => {
  try {
    const themeConfig = req.body;
    
    // Extract basic colors for backward compatibility
    const primary = themeConfig.primary || '#007bff';
    const background = themeConfig.background || '#ffffff';
    const foreground = themeConfig.foreground || '#000000';
    
    // Check if theme exists
    const existing = await dbGet('SELECT id FROM theme_config LIMIT 1');
    
    if (existing) {
      await dbRun(
        'UPDATE theme_config SET primary_color = ?, background_color = ?, text_color = ?, full_config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [primary, background, foreground, JSON.stringify(themeConfig), existing.id]
      );
    } else {
      await dbRun(
        'INSERT INTO theme_config (primary_color, background_color, text_color, full_config) VALUES (?, ?, ?, ?)',
        [primary, background, foreground, JSON.stringify(themeConfig)]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save theme' });
  }
});

// Utility Routes
app.get('/api/generate-password', (req, res) => {
  const password = generateSecurePassword();
  res.json({ password });
});

app.post('/api/validate-password', (req, res) => {
  const { password } = req.body;
  const isStrong = isPasswordStrong(password);
  res.json({ isStrong });
});

app.post('/api/auth/change-password', authLimiter, authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new passwords are required' });
    }

    // Get current admin user
    const user = await dbGet(
      'SELECT username, password_hash, salt FROM admin_users WHERE username = ?',
      ['admin']
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'Admin user not found' });
    }

    // Verify current password
    const computedHash = await bcrypt.hash(currentPassword, user.salt);
    const isCurrentValid = computedHash === user.password_hash;
    if (!isCurrentValid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Enforce strong password
    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
    }

    // Hash new password with new salt
    const newSalt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, newSalt);

    // Update database
    await dbRun(
      'UPDATE admin_users SET password_hash = ?, salt = ?, created_at = created_at, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
      [newHash, newSalt, 'admin']
    ).catch(async () => {
      // Fallback if updated_at column does not exist
      await dbRun(
        'UPDATE admin_users SET password_hash = ?, salt = ? WHERE username = ?',
        [newHash, newSalt, 'admin']
      );
    });

    // Issue a fresh token
    const token = generateToken('admin');

    return res.json({ success: true, message: 'Password changed successfully', token });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

// Temporary debug endpoint - remove after use
app.get('/api/debug/admin', async (req, res) => {
  try {
    const admin = await dbGet('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    if (!admin) {
      return res.json({ exists: false, message: 'No admin user found' });
    }
    
    // Don't send the actual password hash and salt in production
    res.json({
      exists: true,
      username: admin.username,
      hasPassword: !!admin.password_hash,
      passwordHashLength: admin.password_hash?.length,
      saltLength: admin.salt?.length,
      createdAt: admin.created_at
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug error', details: error.message });
  }
});

// Internal function to reset the application (used by both endpoints)
const resetApplicationData = async () => {
  // Start a transaction to ensure all or nothing
  await dbRun('BEGIN TRANSACTION');
  
  try {
    console.log('Starting application reset...');
    
    // Get list of all tables
    const tables = await dbAll(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations'"
    );
    
    // Disable foreign key constraints temporarily
    await dbRun('PRAGMA foreign_keys = OFF');
    
    // Clear all data from all tables
    for (const table of tables) {
      try {
        console.log(`Clearing table: ${table.name}`);
        await dbRun(`DELETE FROM ${table.name}`);
      } catch (error) {
        console.warn(`Could not clear table ${table.name}:`, error.message);
      }
    }
    
    // Re-enable foreign key constraints
    await dbRun('PRAGMA foreign_keys = ON');
    
    // Reset SQLite sequences
    try {
      const sequences = await dbAll(
        "SELECT name FROM sqlite_sequence"
      );
      
      for (const seq of sequences) {
        await dbRun(`DELETE FROM sqlite_sequence WHERE name = '${seq.name}'`);
      }
    } catch (error) {
      console.warn('Could not reset SQLite sequences:', error.message);
    }
    
    // Insert default theme
    console.log('Setting up default theme...');
    await dbRun(`
      INSERT OR REPLACE INTO theme_config (id, primary_color, background_color, text_color, button_style, full_config)
      VALUES (1, ?, ?, ?, ?, ?)
    `, [
      '#007bff', 
      '#ffffff', 
      '#000000', 
      'rounded',
      JSON.stringify({
        primaryColor: '#007bff',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        buttonStyle: 'rounded',
        fontFamily: 'Inter, system-ui, sans-serif',
        linkStyle: 'card',
        customCSS: ''
      })
    ]);
    
    // Insert default empty profile
    console.log('Setting up default profile...');
    await dbRun(`
      INSERT OR REPLACE INTO profile_data (id, name, bio, avatar, social_links, show_avatar)
      VALUES (1, 'Your Name', 'A short bio about yourself', '', '{}', 1)
    `);
    
    // Commit the transaction
    await dbRun('COMMIT');
    
    console.log('Application reset completed successfully');
    
    return { 
      success: true, 
      message: 'Application reset successful. All data has been cleared and default settings have been restored.'
    };
    
  } catch (error) {
    // Rollback in case of any error
    console.error('Error in resetApplicationData:', error);
    try {
      await dbRun('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during transaction rollback:', rollbackError);
    }
    throw error;
  }
};

// Reset authentication - clear ALL data and reset to initial state (requires authentication)
app.post('/api/auth/reset', authenticateToken, resetLimiter, async (req, res) => {
  try {
    console.log('Authenticated reset endpoint called by user:', req.user?.username || 'unknown');
    
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    const result = await resetApplicationData();
    
    // Clear the auth token from the response
    res.clearCookie('token');
    
    res.json({
      ...result,
      success: true,
      message: 'Application reset successful. You will be redirected to the setup page.'
    });
  } catch (error) {
    console.error('Error in authenticated reset:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset application. ' + (error.message || 'Please try again.') 
    });
  }
});

// Special unauthenticated reset endpoint (for when you're locked out)
app.post('/api/auth/force-reset', resetLimiter, async (req, res) => {
  try {
    console.log('Force reset endpoint called');
    
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Reset-Token');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Verify reset token from environment variable or header
    const resetToken = process.env.RESET_TOKEN;
    const providedToken = req.headers['x-reset-token'];

    if (!resetToken || typeof resetToken !== 'string' || resetToken.length < 32) {
      console.warn('Force reset disabled: strong RESET_TOKEN env var not set');
      return res.status(403).json({ success: false, error: 'Unauthorized: Reset disabled' });
    }

    if (!providedToken || typeof providedToken !== 'string') {
      console.log('Invalid or missing reset token');
      return res.status(403).json({ success: false, error: 'Unauthorized: Invalid reset token' });
    }

    // Constant-time comparison
    const a = Buffer.from(providedToken);
    const b = Buffer.from(resetToken);
    const match = a.length === b.length && timingSafeEqual(a, b);

    if (!match) {
      console.log('Invalid or missing reset token');
      return res.status(403).json({ success: false, error: 'Unauthorized: Invalid reset token' });
    }
    
    console.log('Resetting application data...');
    const result = await resetApplicationData();
    
    console.log('Reset successful, sending response');
    res.json({
      ...result,
      success: true,
      message: 'Application reset successful. You can now set up a new admin account.'
    });
  } catch (error) {
    console.error('Error in force reset:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset application. ' + (error.message || 'Please try again.') 
    });
  }
});

// Serve React app for all other routes
// Rate limit for serving SPA index.html (to mitigate file system abuse)
const spaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window per SPA access
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { success: false, error: "Too many requests, please try again later." },
});

app.get('*', spaLimiter, (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log('Rate limiting active:');
  console.log('- Global API: 300 requests/15min per IP');
  console.log('- Auth endpoints: 20 requests/15min per IP');
  console.log('- Login attempts: 5 failed/10min per IP');
  console.log('- Force reset: 2 requests/hour per IP');
  console.log('Trust proxy:', app.get('trust proxy') ? 'Enabled' : 'Disabled');
});
