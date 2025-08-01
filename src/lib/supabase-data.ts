import { supabase } from '@/integrations/supabase/client';
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
    url: string;
  }>;
}

// Load public profile data
export const loadProfileData = async (): Promise<ProfileData | null> => {
  try {
    const { data, error } = await supabase
      .from('profile_data')
      .select('*')
      .single();
    
    if (error || !data) return null;
    
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
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error || !data) return [];
    
    return data.map(link => ({
      id: link.id,
      title: link.title,
      description: link.description || '',
      url: link.url,
      type: 'link' as const,
      icon: link.icon
    }));
  } catch (error) {
    console.error('Error loading links data:', error);
    return [];
  }
};

// Load theme configuration
export const loadThemeData = async (): Promise<ThemeConfig> => {
  try {
    const { data, error } = await supabase
      .from('theme_config')
      .select('*')
      .single();
    
    if (error || !data) return defaultTheme;
    
    return {
      ...defaultTheme,
      primary: data.primary_color,
      background: data.background_color,
      foreground: data.text_color
    };
  } catch (error) {
    console.error('Error loading theme data:', error);
    return defaultTheme;
  }
};