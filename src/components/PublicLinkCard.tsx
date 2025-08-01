import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { LinkData } from "./LinkCard";

interface PublicLinkCardProps {
  link: LinkData;
}

export const PublicLinkCard = ({ link }: PublicLinkCardProps) => {
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

  return (
    <Card 
      className={`glass-card ${getSizeClasses(link.size)} transition-smooth hover:glow-effect group cursor-pointer`}
      onClick={handleClick}
      style={getCustomStyles()}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {link.icon && (
              <div className="flex-shrink-0">
                {link.iconType === 'image' || link.iconType === 'svg' ? (
                  <img src={link.icon} alt="" className="w-5 h-5 object-cover rounded" />
                ) : (
                  <span className="text-lg">{link.icon}</span>
                )}
              </div>
            )}
            <h3 className="font-semibold text-foreground truncate">
              {link.title || "Untitled Link"}
            </h3>
            <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-smooth" />
          </div>
          {link.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {link.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};