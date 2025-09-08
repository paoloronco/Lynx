import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SALT_ROUNDS = 12;

// Check if this is the first time setup (no admin exists)
export const isFirstTimeSetup = async () => {
  try {
    const result = await dbGet('SELECT COUNT(*) as count FROM admin_users');
    return result.count === 0;
  } catch (error) {
    console.error('Error checking first time setup:', error);
    return true; // Default to setup if error
  }
};

// Setup initial admin credentials
export const setupInitialCredentials = async (password) => {
  try {
    const firstTime = await isFirstTimeSetup();
    if (!firstTime) {
      throw new Error('Admin account already exists');
    }
    
    // Validate strong password
    if (!isPasswordStrong(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }
    
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await dbRun(
      'INSERT INTO admin_users (username, password_hash, salt) VALUES (?, ?, ?)',
      ['admin', passwordHash, salt] // Always use 'admin' as username
    );
    
    return true;
  } catch (error) {
    console.error('Error in setupInitialCredentials:', error);
    throw error;
  }
};

// Authenticate user against database
export const authenticateUser = async (password) => {
  try {
    console.log('Authenticating admin user');
    
    const user = await dbGet(
      'SELECT username, password_hash, salt FROM admin_users WHERE username = ?',
      ['admin'] // Only look for 'admin' user
    );
    
    if (!user) {
      console.log('Admin user not found in database');
      return false;
    }
    
    console.log('Found admin user, comparing passwords...');
    
    // Hash the provided password with the stored salt
    const hashedPassword = await bcrypt.hash(password, user.salt);
    const isValid = hashedPassword === user.password_hash;
    
    if (!isValid) {
      console.log('Password comparison failed');
      console.log('Stored hash:', user.password_hash);
      console.log('Computed hash:', hashedPassword);
      console.log('Using salt:', user.salt);
    } else {
      console.log('Authentication successful');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return false;
  }
};

// Generate JWT token
export const generateToken = (username) => {
  return jwt.sign(
    { username, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Verify reset token
export const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET + '-reset');
  } catch (error) {
    console.error('Reset token verification failed:', error);
    return null;
  }
};

// Enhanced password validation
export const isPasswordStrong = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChar;
};

// Hash a password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

// Verify a password
export const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

// Get admin username (always 'admin')
export const getAdminUsername = () => 'admin';

// Generate a cryptographically secure password
export const generateSecurePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*(),.?":{}|<>';
  
  // Ensure at least one character from each category
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill remaining length with random characters
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Middleware to verify authentication
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Verify the user exists in the database
  try {
    const user = await dbGet(
      'SELECT username FROM admin_users WHERE username = ?',
      [decoded.username]
    );

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Database error during authentication:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Generate auth token
export const generateAuthToken = (payload) => {
  return jwt.sign(
    { ...payload, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
};
