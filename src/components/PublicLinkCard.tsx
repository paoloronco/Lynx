import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { LinkData } from "./LinkCard";

interface PublicLinkCardProps {
  link: LinkData;
}

const getIconUrl = (iconPath?: string | null) => {
  if (!iconPath) return null;
  
  // If it's a data URL or blob URL, return as is
  if (iconPath.startsWith('data:') || iconPath.startsWith('blob:')) {
    return iconPath;
  }
  
  // If it's already a full URL, return as is
  if (iconPath.startsWith('http')) {
    return iconPath;
  }
  
  // If it's an absolute path (starts with '/'), return as-is so we don't duplicate /uploads
  if (iconPath.startsWith('/')) {
    return iconPath;
  }
  
  // For relative paths, assume they're in the uploads directory
  return `/uploads/${iconPath.replace(/^\/+/, '')}`;
};

export const PublicLinkCard = ({ link }: PublicLinkCardProps) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const loadIcon = async () => {
      try {
        const url = getIconUrl(link.icon);
        
        // If it's a blob URL, convert it to a data URL
        if (url?.startsWith('blob:')) {
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setIconUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } else {
          setIconUrl(url);
        }
      } catch (error) {
        console.error('Error loading icon:', error);
        setIconUrl(null);
      }
    };

    loadIcon();
  }, [link.icon]);
  
  // Debug log to help diagnose icon issues
  console.log('Rendering PublicLinkCard with link:', {
    id: link.id,
    title: link.title,
    icon: link.icon,
    iconUrl,
    iconType: link.iconType,
    hasIcon: !!link.icon
  });
  const handleClick = () => {
    if (link.url) {
      window.open(link.url, '_blank');
    }
  };

  const getSizeClasses = (size?: string) => {
    switch (size) {
      case 'small': return 'p-3';
      case 'large': return 'p-6';
      default: return 'p-4';
    }
  };

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    if (link.backgroundColor) {
      styles.backgroundColor = link.backgroundColor;
    }
    if (link.textColor) {
      styles.color = link.textColor;
    }
    return styles;
  };

  // Add error state for images
  const [imageError, setImageError] = useState(false);

  // Determine what to show in the icon area
  const renderIcon = () => {
    // If no icon or there was an error loading it, show a fallback initial
    if (!iconUrl || imageError) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <span className="text-lg leading-none opacity-70">
            {link.title ? link.title.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
      );
    }
    // If we have an icon URL, render it with proper error handling. Use full-size image filling the container to avoid layout clipping.
    return (
      <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full overflow-hidden">
        <img
          src={iconUrl}
          alt={link.title || 'Link icon'}
          className="w-full h-full object-cover rounded-full"
          onError={() => {
            console.error('Error loading image:', iconUrl);
            setImageError(true);
          }}
        />
      </div>
    );
  };

  return (
    <Card 
      className={`glass-card ${getSizeClasses(link.size)} transition-smooth hover:glow-effect group cursor-pointer`}
      onClick={handleClick}
      style={getCustomStyles()}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden rounded">
            {renderIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="font-semibold truncate flex-1"
                style={link.textColor ? { color: link.textColor } : undefined}
              >
                {link.title || "Untitled Link"}
              </h3>
              <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-smooth flex-shrink-0" />
            </div>
            {link.description && (
              <p
                className="text-sm line-clamp-2 mt-1"
                style={link.textColor ? { color: link.textColor } : undefined}
              >
                {link.description}
              </p>
            )}
            {link.url && (
              <p
                className="text-xs mt-1 truncate text-muted-foreground"
                style={link.textColor ? { color: link.textColor, opacity: 0.8 } : undefined}
              >
                {link.url.replace(/^https?:\/\//, '')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};