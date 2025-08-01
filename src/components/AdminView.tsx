import { ProfileSection } from "./ProfileSection";
import { LinkManager } from "./LinkManager";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { PasswordManager } from "./PasswordManager";
import { LinkData } from "./LinkCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Link, Palette, User, Key } from "lucide-react";
import { logout } from "@/lib/auth";
import { ThemeConfig } from "@/lib/theme";

interface ProfileData {
  name: string;
  bio: string;
  avatar: string;
}

interface AdminViewProps {
  profile: ProfileData;
  links: LinkData[];
  theme: ThemeConfig;
  onProfileUpdate: (profile: ProfileData) => void;
  onLinksUpdate: (links: LinkData[]) => void;
  onThemeChange: (theme: ThemeConfig) => void;
  onLogout: () => void;
}

export const AdminView = ({ 
  profile, 
  links, 
  theme, 
  onProfileUpdate, 
  onLinksUpdate, 
  onThemeChange,
  onLogout 
}: AdminViewProps) => {
  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="glass-card p-4 border border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <h1 className="text-lg font-semibold text-primary">
                {theme.content.adminTitle}
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-1">
              <Link className="w-4 h-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-1">
              <Key className="w-4 h-4" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-md mx-auto">
              <ProfileSection 
                profile={profile}
                onProfileUpdate={onProfileUpdate}
              />
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <div className="max-w-md mx-auto">
              <LinkManager
                links={links}
                onLinksUpdate={onLinksUpdate}
              />
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-6">
            <ThemeCustomizer
              theme={theme}
              onThemeChange={onThemeChange}
            />
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <PasswordManager />
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground opacity-60">
            Advanced admin interface - Full control over your link hub
          </p>
        </div>
      </div>
    </div>
  );
};