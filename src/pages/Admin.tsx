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
}

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    name: "Alex Johnson",
    bio: "Digital creator & entrepreneur sharing my favorite tools and resources. Follow along for the latest in tech, design, and productivity.",
    avatar: profileAvatar,
    showAvatar: true,
  });

  const [links, setLinks] = useState<LinkData[]>([
    {
      id: "1",
      title: "My Portfolio",
      description: "Check out my latest work and projects",
      url: "https://portfolio.example.com",
      type: "link",
    },
    {
      id: "2", 
      title: "Blog",
      description: "Thoughts on design, tech, and creativity",
      url: "https://blog.example.com",
      type: "link",
    },
    {
      id: "3",
      title: "Newsletter",
      description: "Weekly insights delivered to your inbox",
      url: "https://newsletter.example.com",
      type: "link",
    },
    {
      id: "4",
      title: "Text card",
      description: "",
      url: "",
      type: "text",
      textItems: [
        {
          text: "website1",
          url: "https://www.paoloronco.it"
        },
        {
          text: "website2", 
          url: "https://www.paolo.it"
        },
        {
          text: "website3",
          url: "https://www.ronco.it"
        }
      ]
    },
  ]);

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
            socialLinks: profileData.social_links || {}
          });
        }

        // Load links data
        const linksData = await linksApi.get();
        
        if (linksData && linksData.length > 0) {
          const formattedLinks = linksData.map(link => ({
            id: link.id,
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
            textItems: link.textItems
          }));
          setLinks(formattedLinks);
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
      // Format the links for the API
      const formattedLinks = newLinks.map(link => ({
        id: link.id,
        title: link.title,
        description: link.description,
        url: link.url,
        type: link.type || 'link',
        icon: link.icon,
        iconType: link.iconType,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor,
        size: link.size,
        content: link.content,
        textItems: link.textItems
      }));
      setLinks(newLinks);
      await linksApi.update(formattedLinks);
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
