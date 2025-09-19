export interface ThemeConfig {
  // Colors
  primary: string;
  primaryGlow: string;
  background: string;
  backgroundSecondary: string;
  card: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
  
  // Gradients
  backgroundGradient: {
    from: string;
    to: string;
    direction: string;
  };
  cardGradient: {
    from: string;
    to: string;
    direction: string;
  };
  
  // Typography
  fontFamily: string;
  // Note: per-item font sizes are handled on profile and link objects; theme no longer stores font sizes
  
  // Layout
  cardRadius: number;
  cardSpacing: number;
  maxWidth: string;
  
  // Effects
  glowIntensity: number;
  blurIntensity: number;
  
  // Content
  content: {
    profileName: string;
    profileBio: string;
    footerText: string;
    adminTitle: string;
  };
}

export const defaultTheme: ThemeConfig = {
  primary: '#8b5cf6',
  primaryGlow: '#a78bfa',
  background: '#0f0f23',
  backgroundSecondary: '#1a1a2e',
  card: '#16213e',
  foreground: '#f8fafc',
  muted: '#64748b',
  accent: '#7c3aed',
  border: '#334155',
  
  backgroundGradient: {
    from: '#0f0f23',
    to: '#1a1a2e',
    direction: '135deg'
  },
  cardGradient: {
    from: '#16213e',
    to: '#1e293b',
    direction: '135deg'
  },
  
  fontFamily: 'Inter, system-ui, sans-serif',
  // font sizes removed from theme defaults; items will use their own saved sizes
  
  cardRadius: 12,
  cardSpacing: 12,
  maxWidth: '28rem',
  
  // Slightly stronger glow and softer blur for a more modern glass effect
  glowIntensity: 0.45,
  blurIntensity: 28,

  // Typography niceties
  // We'll expose line heights so it's easier to tweak spacing across the site
  // Note: these are not part of ThemeConfig interface above (backwards compatible)
  // but we'll set CSS variables for them below when applying the theme.
  
  content: {
    profileName: 'Alex Johnson',
    profileBio: 'Digital creator & entrepreneur sharing my favorite tools and resources.',
    footerText: 'Connect with me through these links',
    adminTitle: 'Link Manager Admin'
  }
};

// Convert hex to HSL for CSS variables
const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Apply theme for public view (affects the entire page)
export const applyTheme = (theme: ThemeConfig) => {
  const root = document.documentElement;
  
  // Apply all color variables for site-wide theming
  root.style.setProperty('--primary', hexToHsl(theme.primary));
  root.style.setProperty('--primary-glow', hexToHsl(theme.primaryGlow));
  root.style.setProperty('--primary-foreground', hexToHsl(theme.foreground));
  root.style.setProperty('--background', hexToHsl(theme.background));
  root.style.setProperty('--card', hexToHsl(theme.card));
  root.style.setProperty('--card-foreground', hexToHsl(theme.foreground));
  root.style.setProperty('--foreground', hexToHsl(theme.foreground));
  root.style.setProperty('--muted', hexToHsl(theme.backgroundSecondary));
  root.style.setProperty('--muted-foreground', hexToHsl(theme.muted));
  // Accent is no longer independently configurable; mirror primary to keep compatibility
  root.style.setProperty('--accent', hexToHsl(theme.primary));
  root.style.setProperty('--accent-foreground', hexToHsl(theme.foreground));
  root.style.setProperty('--border', hexToHsl(theme.border));
  root.style.setProperty('--input', hexToHsl(theme.backgroundSecondary));
  root.style.setProperty('--ring', hexToHsl(theme.primary));
  root.style.setProperty('--popover', hexToHsl(theme.card));
  root.style.setProperty('--popover-foreground', hexToHsl(theme.foreground));
  root.style.setProperty('--secondary', hexToHsl(theme.backgroundSecondary));
  root.style.setProperty('--secondary-foreground', hexToHsl(theme.foreground));
  
  // Apply gradients
  root.style.setProperty('--gradient-background', 
    `linear-gradient(${theme.backgroundGradient.direction}, ${theme.backgroundGradient.from}, ${theme.backgroundGradient.to})`);
  root.style.setProperty('--gradient-card', 
    `linear-gradient(${theme.cardGradient.direction}, ${theme.cardGradient.from}, ${theme.cardGradient.to})`);
  root.style.setProperty('--gradient-primary', 
    `linear-gradient(135deg, ${theme.primary}, ${theme.primaryGlow})`);
  
  // Apply typography
  root.style.setProperty('--font-family', theme.fontFamily);
  document.body.style.fontFamily = theme.fontFamily;
  // Reasonable default line heights
  root.style.setProperty('--line-height-normal', '1.45');
  root.style.setProperty('--line-height-tight', '1.25');
  
  // Apply layout
  root.style.setProperty('--radius', `${theme.cardRadius}px`);
  root.style.setProperty('--blur-intensity', `${theme.blurIntensity}px`);
  root.style.setProperty('--card-spacing', `${theme.cardSpacing}px`);
  
  // Update glass card background with blur intensity
  root.style.setProperty('--glass-bg', `hsl(${hexToHsl(theme.card)} / 0.78)`);
  root.style.setProperty('--glass-border', `1px solid hsl(${hexToHsl(theme.border)} / 0.5)`);
  // Card glow uses primary glow color with an intensity multiplier
  root.style.setProperty('--card-glow', `0 8px ${theme.blurIntensity}px hsl(${hexToHsl(theme.primaryGlow)} / ${Math.min(0.9, theme.glowIntensity)})`);
  // Glass tint (allow override from admin theme payload via `cardBlurTint` if present)
  const tint = (theme as any).cardBlurTint || theme.card;
  root.style.setProperty('--glass-tint', tint);
  
  // Force body background update
  document.body.style.background = `linear-gradient(${theme.backgroundGradient.direction}, ${theme.backgroundGradient.from}, ${theme.backgroundGradient.to})`;
};

// Apply admin theme (maintains consistent admin styling)
export const applyAdminTheme = () => {
  const root = document.documentElement;
  
  // Use a consistent admin theme that doesn't change
  const adminTheme = {
    primary: '#8b5cf6',
    primaryGlow: '#a78bfa',
    background: '#0f0f23',
    backgroundSecondary: '#1a1a2e',
    card: '#16213e',
    foreground: '#f8fafc',
    muted: '#64748b',
    accent: '#7c3aed',
    border: '#334155',
    backgroundGradient: {
      from: '#0f0f23',
      to: '#1a1a2e',
      direction: '135deg'
    }
  };
  
  // Apply admin-specific styling
  root.style.setProperty('--primary', hexToHsl(adminTheme.primary));
  root.style.setProperty('--primary-glow', hexToHsl(adminTheme.primaryGlow));
  root.style.setProperty('--primary-foreground', hexToHsl(adminTheme.foreground));
  root.style.setProperty('--background', hexToHsl(adminTheme.background));
  root.style.setProperty('--card', hexToHsl(adminTheme.card));
  root.style.setProperty('--card-foreground', hexToHsl(adminTheme.foreground));
  root.style.setProperty('--foreground', hexToHsl(adminTheme.foreground));
  root.style.setProperty('--muted', hexToHsl(adminTheme.backgroundSecondary));
  root.style.setProperty('--muted-foreground', hexToHsl(adminTheme.muted));
  // Accent mirrors primary in admin theme
  root.style.setProperty('--accent', hexToHsl(adminTheme.primary));
  root.style.setProperty('--accent-foreground', hexToHsl(adminTheme.foreground));
  root.style.setProperty('--border', hexToHsl(adminTheme.border));
  root.style.setProperty('--input', hexToHsl(adminTheme.backgroundSecondary));
  root.style.setProperty('--ring', hexToHsl(adminTheme.primary));
  root.style.setProperty('--popover', hexToHsl(adminTheme.card));
  root.style.setProperty('--popover-foreground', hexToHsl(adminTheme.foreground));
  root.style.setProperty('--secondary', hexToHsl(adminTheme.backgroundSecondary));
  root.style.setProperty('--secondary-foreground', hexToHsl(adminTheme.foreground));
  
  // Apply admin gradients
  root.style.setProperty('--gradient-background', 
    `linear-gradient(${adminTheme.backgroundGradient.direction}, ${adminTheme.backgroundGradient.from}, ${adminTheme.backgroundGradient.to})`);
  root.style.setProperty('--gradient-card', 
    `linear-gradient(135deg, ${adminTheme.card}, #1e293b)`);
  root.style.setProperty('--gradient-primary', 
    `linear-gradient(135deg, ${adminTheme.primary}, ${adminTheme.primaryGlow})`);
  
  // Apply admin typography
  root.style.setProperty('--font-family', 'Inter, system-ui, sans-serif');
  document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
  
  // Apply admin layout
  root.style.setProperty('--radius', '12px');
  root.style.setProperty('--blur-intensity', '20px');
  root.style.setProperty('--card-spacing', '12px');
  
  // Update glass card background
  root.style.setProperty('--glass-bg', `hsl(${hexToHsl(adminTheme.card)} / 0.8)`);
  root.style.setProperty('--glass-border', `1px solid hsl(${hexToHsl(adminTheme.border)} / 0.5)`);
  
  // Force body background update for admin
  document.body.style.background = `linear-gradient(${adminTheme.backgroundGradient.direction}, ${adminTheme.backgroundGradient.from}, ${adminTheme.backgroundGradient.to})`;
};
