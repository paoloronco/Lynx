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
  nameFontSize?: string;
  bioFontSize?: string;
}

const Index = () => {
  // Start with empty/neutral profile while we load the real data from the API
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    bio: "",
    avatar: profileAvatar,
  });

  // Start with an empty links array to avoid showing mock links on initial render
  const [links, setLinks] = useState<LinkData[]>([]);

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
            nameFontSize: (profileData as any).name_font_size || (profileData as any).nameFontSize || undefined,
            bioFontSize: (profileData as any).bio_font_size || (profileData as any).bioFontSize || undefined,
            socialLinks: profileData.social_links || {}
          });
          // Apply document meta
          const tabTitle = (profileData as any).tab_title || (profileData as any).tabTitle;
          const metaDesc = (profileData as any).meta_description || (profileData as any).metaDescription;
          if (tabTitle && typeof tabTitle === 'string') {
            document.title = tabTitle;
          }
          if (metaDesc && typeof metaDesc === 'string') {
            let tag = document.querySelector('meta[name="description"]');
            if (!tag) {
              tag = document.createElement('meta');
              tag.setAttribute('name', 'description');
              document.head.appendChild(tag);
            }
            tag.setAttribute('content', metaDesc);
          }
        }

        // Load links data from database
        const linksData = await linksApi.get();
        if (linksData && linksData.length > 0) {
          const formattedLinks = linksData.map(link => {
            // Use iconType if available, otherwise fall back to icon_type from the API
            const iconType = link.iconType || (link as any).icon_type;
            return {
              id: link.id,
              title: link.title,
              description: link.description || '',
              url: link.url,
              type: (link.type as 'link' | 'text') || 'link',
              icon: link.icon || undefined,
              iconType: iconType || undefined,
              backgroundColor: link.backgroundColor,
              textColor: link.textColor,
              size: link.size,
              content: link.content,
                textItems: link.textItems,
                // Preserve per-link typography and alignment
                titleFontFamily: (link as any).titleFontFamily || (link as any).titleFont || undefined,
                descriptionFontFamily: (link as any).descriptionFontFamily || undefined,
                titleFontSize: (link as any).titleFontSize || undefined,
                descriptionFontSize: (link as any).descriptionFontSize || undefined,
                alignment: (link as any).alignment || undefined
            };
          });
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
