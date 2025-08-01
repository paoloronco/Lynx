import { PublicProfileSection } from "./PublicProfileSection";
import { PublicLinkCard } from "./PublicLinkCard";
import { PublicTextCard } from "./PublicTextCard";
import { LinkData } from "./LinkCard";

interface ProfileData {
  name: string;
  bio: string;
  avatar: string;
}

interface PublicViewProps {
  profile: ProfileData;
  links: LinkData[];
}

export const PublicView = ({ profile, links }: PublicViewProps) => {
  const visibleLinks = links.filter(link => {
    if (link.type === 'text') {
      return link.title.trim() !== '' && 
        ((link.content?.trim() !== '') || 
         (link.textItems && link.textItems.length > 0 && link.textItems.some(item => item.text.trim() !== '')));
    }
    return link.title.trim() !== '' && link.url.trim() !== '';
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <PublicProfileSection profile={profile} />
        
        {visibleLinks.length > 0 && (
          <div className="space-y-3">
            {visibleLinks.map((link) => (
              link.type === 'text' ? (
                <PublicTextCard key={link.id} link={link} />
              ) : (
                <PublicLinkCard key={link.id} link={link} />
              )
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground opacity-60">
            Connect with me through these links
          </p>
        </div>
      </div>
    </div>
  );
};