import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Edit, Camera, Linkedin, Github, Instagram, Facebook, Twitter } from "lucide-react";
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

interface ProfileSectionProps {
  profile: ProfileData;
  onProfileUpdate: (profile: ProfileData) => void;
}

export const ProfileSection = ({ profile, onProfileUpdate }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onProfileUpdate(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setEditProfile(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="glass-card p-8 text-center transition-smooth hover:glow-effect">
      <div className="relative inline-block mb-6">
        <Avatar className="w-24 h-24 border-2 border-primary/20">
          <AvatarImage src={profile.avatar || profileAvatar} alt={profile.name} />
          <AvatarFallback className="text-2xl font-bold gradient-text">
            {profile.name.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        {isEditing && (
          <Button
            size="icon"
            variant="glass"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-4 h-4" />
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={editProfile.name}
            onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
            className="glass-card border-primary/20 text-center text-xl font-semibold"
          />
          <Textarea
            value={editProfile.bio}
            onChange={(e) => setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell people about yourself..."
            className="glass-card border-primary/20 text-center resize-none"
            rows={3}
          />
          
          {/* Social Links */}
          <div className="space-y-3 pt-4 border-t border-primary/10">
            <Label className="text-sm font-medium">Social Links</Label>
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <Input
                  value={editProfile.socialLinks?.linkedin || ''}
                  onChange={(e) => setEditProfile(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                  }))}
                  placeholder="https://linkedin.com/in/username"
                  className="glass-card border-primary/20 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-foreground" />
                <Input
                  value={editProfile.socialLinks?.github || ''}
                  onChange={(e) => setEditProfile(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, github: e.target.value }
                  }))}
                  placeholder="https://github.com/username"
                  className="glass-card border-primary/20 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                <Input
                  value={editProfile.socialLinks?.instagram || ''}
                  onChange={(e) => setEditProfile(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                  }))}
                  placeholder="https://instagram.com/username"
                  className="glass-card border-primary/20 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-700" />
                <Input
                  value={editProfile.socialLinks?.facebook || ''}
                  onChange={(e) => setEditProfile(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                  }))}
                  placeholder="https://facebook.com/username"
                  className="glass-card border-primary/20 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-foreground" />
                <Input
                  value={editProfile.socialLinks?.twitter || ''}
                  onChange={(e) => setEditProfile(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                  }))}
                  placeholder="https://x.com/username or https://twitter.com/username"
                  className="glass-card border-primary/20 text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={handleSave} variant="gradient" size="sm">
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative group">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {profile.name || "Your Name"}
            </h1>
            
            {/* Social Icons */}
            {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
              <div className="flex justify-center gap-3 mb-4">
                {profile.socialLinks.linkedin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-blue-600/20"
                    onClick={() => window.open(profile.socialLinks?.linkedin, '_blank')}
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </Button>
                )}
                {profile.socialLinks.github && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-foreground/20"
                    onClick={() => window.open(profile.socialLinks?.github, '_blank')}
                  >
                    <Github className="w-4 h-4 text-foreground" />
                  </Button>
                )}
                {profile.socialLinks.instagram && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-pink-500/20"
                    onClick={() => window.open(profile.socialLinks?.instagram, '_blank')}
                  >
                    <Instagram className="w-4 h-4 text-pink-500" />
                  </Button>
                )}
                {profile.socialLinks.facebook && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-blue-700/20"
                    onClick={() => window.open(profile.socialLinks?.facebook, '_blank')}
                  >
                    <Facebook className="w-4 h-4 text-blue-700" />
                  </Button>
                )}
                {profile.socialLinks.twitter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-foreground/20"
                    onClick={() => window.open(profile.socialLinks?.twitter, '_blank')}
                  >
                    <Twitter className="w-4 h-4 text-foreground" />
                  </Button>
                )}
              </div>
            )}
            
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio || "Add a bio to tell people about yourself..."}
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-smooth"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};