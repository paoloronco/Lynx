import { useState, useEffect } from "react";
import { PublicView } from "@/components/PublicView";
import { LinkData } from "@/components/LinkCard";
import { applyTheme, defaultTheme, ThemeConfig } from "@/lib/theme";
import { profileApi, linksApi, themeApi } from "@/lib/api-client";
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

const Index = () => {
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

  // Load data and theme from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile data from database
        const profileData = await profileApi.get();
        if (profileData) {
          setProfile({
            name: profileData.name,
            bio: profileData.bio,
            avatar: profileData.avatar,
            socialLinks: profileData.social_links || {}
          });
        }

        // Load links data from database
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

        // Load theme data from database and apply it
        const themeData = await themeApi.get();
        if (themeData) {
          // If we have a full theme configuration, use it; otherwise merge with defaults
          const loadedTheme: ThemeConfig = themeData.primary && themeData.background && themeData.foreground && !themeData.fontFamily
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
          applyTheme(loadedTheme);
        } else {
          applyTheme(defaultTheme);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default theme if database loading fails
        applyTheme(defaultTheme);
      }
    };

    loadData();
  }, []);

  return (
    <PublicView
      profile={profile}
      links={links}
    />
  );
};

export default Index;
