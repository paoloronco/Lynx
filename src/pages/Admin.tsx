import { useState, useEffect } from "react";
import { AdminView } from "@/components/AdminView";
import { LoginForm } from "@/components/LoginForm";
import { InitialSetup } from "@/components/InitialSetup";
import { LinkData } from "@/components/LinkCard";
import { ThemeConfig, defaultTheme, applyTheme } from "@/lib/theme";
import { isAuthenticated, isFirstTimeSetup } from "@/lib/auth";
import { profileApi, linksApi, themeApi } from "@/lib/api-client";
import profileAvatar from "@/assets/profile-avatar.jpg";

interface ProfileData {
  name: string;
  bio: string;
  avatar: string;
  showAvatar?: boolean;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  nameFontSize?: string;
  bioFontSize?: string;
}

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  
  // Use empty/neutral profile while real data is loading
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    bio: "",
    avatar: profileAvatar,
    showAvatar: true,
  });

  // Start with no links shown until we fetch them from the server
  const [links, setLinks] = useState<LinkData[]>([]);

  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  // Check authentication status and setup status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const firstTime = await isFirstTimeSetup();
      setShowSetup(firstTime);
      setIsLoggedIn(isAuthenticated());
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Load data from database and apply theme
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile data
        const profileData = await profileApi.get();
        
        if (profileData) {
          setProfile({
            name: profileData.name,
            bio: profileData.bio,
            avatar: profileData.avatar || (profileAvatar as string),
            showAvatar: (profileData as any).showAvatar ?? true,
            socialLinks: profileData.social_links || {},
            nameFontSize: (profileData as any).name_font_size || (profileData as any).nameFontSize || undefined,
            bioFontSize: (profileData as any).bio_font_size || (profileData as any).bioFontSize || undefined,
          });
        }

        // Load links data
        const linksData = await linksApi.get();
        
        if (linksData && linksData.length > 0) {
          const formattedLinks = linksData.map(link => ({
            id: String(link.id),
            title: link.title,
            description: link.description || '',
            url: link.url,
            type: link.type as 'link' | 'text',
            icon: link.icon,
            iconType: link.iconType,
            backgroundColor: link.backgroundColor,
            titleFontFamily: (link as any).titleFontFamily || (link as any).titleFont || undefined,
            descriptionFontFamily: (link as any).descriptionFontFamily || undefined,
            alignment: (link as any).alignment || undefined,
            textColor: link.textColor,
            size: link.size,
            content: link.content,
            textItems: link.textItems
          }));
          // Ensure typography fields are preserved in normalized links
          const fullyNormalized = formattedLinks.map(link => ({
            ...link,
            titleFontFamily: (link as any).titleFontFamily || undefined,
            descriptionFontFamily: (link as any).descriptionFontFamily || undefined,
            alignment: (link as any).alignment || undefined,
            titleFontSize: (link as any).titleFontSize || undefined,
            descriptionFontSize: (link as any).descriptionFontSize || undefined
          }));
          setLinks(fullyNormalized);
        }

        // Load theme data (for editing purposes) and apply it to admin too
        const themeData = await themeApi.get();
        
        if (themeData) {
          // If we have a full theme configuration, use it; otherwise merge with defaults
          const loadedTheme = themeData.primary && themeData.background && themeData.foreground && !themeData.fontFamily
            ? {
                ...defaultTheme,
                primary: themeData.primary,
                background: themeData.background,
                foreground: themeData.foreground
              }
            : {
                ...defaultTheme,
                ...themeData
              };
          setTheme(loadedTheme);
          applyTheme(loadedTheme);
        } else {
          setTheme(defaultTheme);
          applyTheme(defaultTheme);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        applyTheme(defaultTheme);
      }
    };

    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);


  // Save data changes to database
  const saveProfile = async (newProfile: ProfileData) => {
    try {
      await profileApi.update({
        name: newProfile.name,
        bio: newProfile.bio,
        avatar: newProfile.avatar,
        socialLinks: newProfile.socialLinks || {},
        showAvatar: typeof newProfile.showAvatar === 'boolean' ? newProfile.showAvatar : true,
        nameFontSize: newProfile.nameFontSize,
        bioFontSize: newProfile.bioFontSize,
      });
      setProfile(newProfile);
    } catch (error: any) {
      if (error?.message === 'AUTH_EXPIRED') {
        // Session expired: force re-authentication
        setIsLoggedIn(false);
        return;
      }
      console.error('Error saving profile:', error);
    }
  };

  const saveLinks = async (newLinks: LinkData[]) => {
    try {
      // Preserve all link properties (including custom styling fields)
      const formattedLinks = newLinks.map(link => ({
        ...link,
        id: String(link.id),
        // ensure `type` is present (backend expects a type for each link)
        type: (link as any).type || 'link'
      }));
      // Persist first; only update local state if backend succeeds
      await linksApi.update(formattedLinks);
      // Re-fetch from backend to guarantee public and admin are in sync
      const reloaded = await linksApi.get();
      const normalized = (reloaded || []).map(link => ({
        id: String(link.id),
        title: link.title,
        description: link.description || '',
        url: link.url,
        type: link.type as 'link' | 'text',
        icon: link.icon,
        iconType: link.iconType,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor,
        size: link.size,
        content: link.content,
        // Preserve new typography and alignment fields
        titleFontFamily: (link as any).titleFontFamily || (link as any).titleFont || undefined,
        descriptionFontFamily: (link as any).descriptionFontFamily || undefined,
        alignment: (link as any).alignment || undefined,
        textItems: link.textItems
      }));
      setLinks(normalized);
    } catch (error: any) {
      if (error?.message === 'AUTH_EXPIRED') {
        setIsLoggedIn(false);
        return;
      }
      console.error('Error saving links:', error);
    }
  };

  const saveTheme = async (newTheme: ThemeConfig) => {
    try {
      // Pass the full theme configuration to the API
      await themeApi.update(newTheme);
      setTheme(newTheme);
      // Apply theme to admin interface too
      applyTheme(newTheme);
    } catch (error: any) {
      if (error?.message === 'AUTH_EXPIRED') {
        setIsLoggedIn(false);
        throw error; // Let component-level handlers know it failed due to auth
      }
      console.error('Error saving theme:', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleThemeChange = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
    // Apply live changes to admin UI
    applyTheme(newTheme);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showSetup) {
      return <InitialSetup onSetupComplete={handleLogin} />;
    }
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <AdminView
      profile={profile}
      links={links}
      theme={theme}
      onProfileUpdate={saveProfile}
      onLinksUpdate={saveLinks}
      onThemeChange={saveTheme}
      onLogout={handleLogout}
    />
  );
};

export default Admin;
