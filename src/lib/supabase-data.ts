import { profileApi, linksApi, themeApi } from './api-client';
import { ThemeConfig, defaultTheme } from './theme';

export interface ProfileData {
  name: string;
  bio: string;
  avatar: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface LinkData {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'link' | 'text';
  icon?: string;
  textItems?: Array<{
    text: string;
    url?: string;
  }>;
}

// Load public profile data
export const loadProfileData = async (): Promise<ProfileData | null> => {
  try {
    const data = await profileApi.get();
    
    return {
      name: data.name,
      bio: data.bio,
      avatar: data.avatar,
      socialLinks: data.social_links || {}
    };
  } catch (error) {
    console.error('Error loading profile data:', error);
    return null;
  }
};

// Load public links data
export const loadLinksData = async (): Promise<LinkData[]> => {
  try {
    const data = await linksApi.get();
    
    return data.map(link => ({
      id: link.id,
      title: link.title,
      description: link.description || '',
      url: link.url,
      type: (link.type as 'link' | 'text') || 'link',
      icon: link.icon,
      textItems: link.textItems
    }));
  } catch (error) {
    console.error('Error loading links data:', error);
    return [];
  }
};

// Load theme configuration
export const loadThemeData = async (): Promise<ThemeConfig> => {
  try {
    const data = await themeApi.get();
    
    return {
      ...defaultTheme,
      primary: data.primary,
      background: data.background,
      foreground: data.foreground
    };
  } catch (error) {
    console.error('Error loading theme data:', error);
    return defaultTheme;
  }
};
