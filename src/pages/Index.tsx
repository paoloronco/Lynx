import { useState, useEffect } from "react";
import { PublicView } from "@/components/PublicView";
import { LinkData } from "@/components/LinkCard";
import { applyTheme, defaultTheme } from "@/lib/theme";
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

  // Load data and theme from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('mylinks-profile');
    const savedLinks = localStorage.getItem('mylinks-links');
    const savedTheme = localStorage.getItem('mylinks-theme');
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }

    // Apply theme to public view
    if (savedTheme) {
      const loadedTheme = JSON.parse(savedTheme);
      applyTheme(loadedTheme);
    } else {
      applyTheme(defaultTheme);
    }
  }, []);

  return (
    <PublicView
      profile={profile}
      links={links}
    />
  );
};

export default Index;
