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
  fontSize: {
    name: string;
    bio: string;
    linkTitle: string;
    linkDescription: string;
  };
  
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
  fontSize: {
    name: '1.5rem',
    bio: '0.875rem',
    linkTitle: '1rem',
    linkDescription: '0.875rem'
  },
  
  cardRadius: 12,
  cardSpacing: 12,
  maxWidth: '28rem',
  
  glowIntensity: 0.3,
  blurIntensity: 20,
  
  content: {
    profileName: 'Alex Johnson',
    profileBio: 'Digital creator & entrepreneur sharing my favorite tools and resources.',
    footerText: 'Connect with me through these links',
    adminTitle: 'Link Manager Admin'
  }
};

export const applyTheme = (theme: ThemeConfig) => {
  const root = document.documentElement;
  
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
  root.style.setProperty('--accent', hexToHsl(theme.accent));
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
  
  // Apply layout
  root.style.setProperty('--radius', `${theme.cardRadius}px`);
  root.style.setProperty('--blur-intensity', `${theme.blurIntensity}px`);
  
  // Update glass card background with blur intensity
  root.style.setProperty('--glass-bg', `hsl(${hexToHsl(theme.card)} / 0.8)`);
  root.style.setProperty('--glass-border', `1px solid hsl(${hexToHsl(theme.border)} / 0.5)`);
  
  // Force body background update
  document.body.style.background = `linear-gradient(${theme.backgroundGradient.direction}, ${theme.backgroundGradient.from}, ${theme.backgroundGradient.to})`;
};