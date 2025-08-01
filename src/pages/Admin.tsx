import { useState, useEffect } from "react";
import { AdminView } from "@/components/AdminView";
import { LoginForm } from "@/components/LoginForm";
import { InitialSetup } from "@/components/InitialSetup";
import { LinkData } from "@/components/LinkCard";
import { ThemeConfig, defaultTheme, applyTheme } from "@/lib/theme";
import { isAuthenticated, isFirstTimeSetup } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import profileAvatar from "@/assets/profile-avatar.jpg";

interface ProfileData {
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

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    name: "Alex Johnson",
    bio: "Digital creator & entrepreneur sharing my favorite tools and resources. Follow along for the latest in tech, design, and productivity.",
    avatar: profileAvatar,
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
        const { data: profileData } = await supabase
          .from('profile_data')
          .select('*')
          .single();
        
        if (profileData) {
          setProfile({
            name: profileData.name,
            bio: profileData.bio,
            avatar: profileData.avatar,
            socialLinks: profileData.social_links || {}
          });
        }

        // Load links data
        const { data: linksData } = await supabase
          .from('links')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (linksData && linksData.length > 0) {
          const formattedLinks = linksData.map(link => ({
            id: link.id,
            title: link.title,
            description: link.description || '',
            url: link.url,
            type: 'link' as const,
            icon: link.icon
          }));
          setLinks(formattedLinks);
        }

        // Load theme data
        const { data: themeData } = await supabase
          .from('theme_config')
          .select('*')
          .single();
        
        if (themeData) {
          const loadedTheme = {
            ...defaultTheme,
            primary: themeData.primary_color,
            background: themeData.background_color,
            foreground: themeData.text_color
          };
          setTheme(loadedTheme);
          applyTheme(loadedTheme);
        } else {
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

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Save data changes to database
  const saveProfile = async (newProfile: ProfileData) => {
    try {
      await supabase
        .from('profile_data')
        .update({
          name: newProfile.name,
          bio: newProfile.bio,
          avatar: newProfile.avatar,
          social_links: newProfile.socialLinks || {}
        })
        .eq('id', (await supabase.from('profile_data').select('id').single()).data?.id);
      setProfile(newProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const saveLinks = async (newLinks: LinkData[]) => {
    try {
      // First, delete existing links
      await supabase.from('links').delete().neq('id', '');
      
      // Insert new links
      const linksToInsert = newLinks.map((link, index) => ({
        id: link.id,
        title: link.title,
        description: link.description,
        url: link.url,
        icon: link.icon,
        sort_order: index
      }));
      
      await supabase.from('links').insert(linksToInsert);
      setLinks(newLinks);
    } catch (error) {
      console.error('Error saving links:', error);
    }
  };

  const saveTheme = async (newTheme: ThemeConfig) => {
    try {
      await supabase
        .from('theme_config')
        .update({
          primary_color: newTheme.primary,
          background_color: newTheme.background,
          text_color: newTheme.foreground,
          button_style: 'rounded' // Store a default value
        })
        .eq('id', (await supabase.from('theme_config').select('id').single()).data?.id);
      setTheme(newTheme);
      applyTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
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