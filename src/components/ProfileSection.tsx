import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Edit, Camera, Linkedin, Github, Instagram, Facebook, Twitter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
  // Per-profile typography
  nameFontSize?: string;
  bioFontSize?: string;
}

interface ProfileSectionProps {
  profile: ProfileData;
  onProfileUpdate: (profile: ProfileData) => void;
}

export const ProfileSection = ({ profile, onProfileUpdate }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const current = isEditing ? editProfile : profile;
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Keep editable state in sync with incoming profile when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditProfile(profile);
    }
  }, [profile, isEditing]);

  const handleSave = () => {
    onProfileUpdate(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const processImage = async (file: File): Promise<string> => {
    // Reject unreasonable files early (pre-compress)
    const MAX_INPUT_BYTES = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_INPUT_BYTES) {
      throw new Error('Selected file is too large (max 20MB).');
    }

    // Helper to load an image from a src and return the image element
    const loadImageFromSrc = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(new Error('Could not load the selected image from provided source.'));
      image.src = src;
    });

    // If SVG, avoid canvas draw (may produce CORS/taint issues) and just return a data URL
    const isSvg = file.type === 'image/svg+xml' || file.name?.toLowerCase().endsWith('.svg');
    if (isSvg) {
      // Read as text then build a data URL to preserve vector content
      const svgData = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result || ''));
        fr.onerror = () => reject(new Error('Failed to read SVG file.'));
        fr.readAsText(file);
      });
      const encoded = encodeURIComponent(svgData).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
      return `data:image/svg+xml;charset=utf-8,${encoded}`;
    }

    // Try loading from object URL first, then fall back to data URL if needed
    let objectUrl: string | null = null;
    let dataUrl: string | null = null;
    let img: HTMLImageElement | null = null;
    try {
      objectUrl = URL.createObjectURL(file);
      img = await loadImageFromSrc(objectUrl);
      // success
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    } catch (err) {
      // try data URL fallback
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl); } catch (e) {}
        objectUrl = null;
      }
      try {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result || ''));
          fr.onerror = () => reject(new Error('Failed to read file as data URL.'));
          fr.readAsDataURL(file);
        });
        img = await loadImageFromSrc(dataUrl);
      } catch (err2) {
        throw new Error('Could not load the selected image. The file may be corrupt or in an unsupported format.');
      }
    }

    // Resize to fit within bounds while keeping aspect ratio
    const MAX_DIM = 512; // avatar-friendly, keeps payload small
    let { width, height } = img;
    if (width > MAX_DIM || height > MAX_DIM) {
      const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported.');
    try {
      ctx.drawImage(img as HTMLImageElement, 0, 0, width, height);
    } catch (drawErr) {
      // Canvas draw may fail for certain SVGs or security-restricted images. If so, return original data URL if available.
      if (dataUrl) return dataUrl;
      // As a last resort, if we still have the original file as an object URL, attempt to return that (but it won't be persisted across sessions)
      if (objectUrl) return objectUrl;
      throw new Error('Failed to process image on canvas. Try a different image or smaller file.');
    }

    // Decide output format
    const isPng = file.type === 'image/png';
    // If PNG is small, keep PNG to preserve transparency; otherwise use JPEG for photos
    const usePng = isPng && file.size < 2 * 1024 * 1024; // <2MB
    const quality = 0.9; // good quality for avatars
    const mime = usePng ? 'image/png' : 'image/jpeg';

    const outputDataUrl = canvas.toDataURL(mime, quality);

    // Final payload sanity check (~base64 expands by ~33%)
    const approxBytes = Math.ceil((outputDataUrl.length - 'data:;base64,'.length) * 0.75);
    const MAX_OUTPUT_BYTES = 5 * 1024 * 1024; // 5MB after compression
    if (approxBytes > MAX_OUTPUT_BYTES) {
      throw new Error('Processed image is still too large. Try a smaller image.');
    }

    return outputDataUrl;
  };

  const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return profileAvatar as unknown as string;
    if (avatar.startsWith('data:') || avatar.startsWith('blob:') || avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('/')) return avatar;
    // If it's a relative path, assume uploads
    return `/uploads/${avatar.replace(/^\/+/, '')}`;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Unsupported file type. Please select an image.');
      }
      const processed = await processImage(file);
      setEditProfile(prev => ({ ...prev, avatar: processed }));
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process the selected image.');
    }
  };

  return (
    <Card className="glass-card p-8 text-center transition-smooth hover:glow-effect">
      <div className="relative inline-block mb-6">
        {current.showAvatar !== false && (
        <Avatar className="w-24 h-24">
          <AvatarImage
            src={getAvatarUrl(current.avatar)}
            alt={current.name || 'User'}
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
          <AvatarFallback className="text-2xl font-bold gradient-text">
            {(current.name && current.name.length > 0) ? current.name.charAt(0) : 'U'}
          </AvatarFallback>
        </Avatar>
        )}
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
        {uploadError && (
          <p className="text-xs text-destructive mt-2">{uploadError}</p>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Show Avatar Toggle */}
          <div className="flex items-center justify-center gap-3">
            <Label htmlFor="show-avatar" className="text-sm">Show profile picture</Label>
            <Switch
              id="show-avatar"
              checked={editProfile.showAvatar !== false}
              onCheckedChange={(checked) => setEditProfile(prev => ({ ...prev, showAvatar: !!checked }))}
            />
          </div>

          <Input
            value={editProfile.name}
            onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
            className="glass-card border-primary/20 text-center text-xl font-semibold"
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Name Font Size (px)</Label>
              <Input
                type="number"
                value={parseInt(editProfile.nameFontSize || '24', 10)}
                onChange={(e) => setEditProfile(prev => ({ ...prev, nameFontSize: `${e.target.value}px` }))}
                className="h-8 w-full"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bio Font Size (px)</Label>
              <Input
                type="number"
                value={parseInt(editProfile.bioFontSize || '14', 10)}
                onChange={(e) => setEditProfile(prev => ({ ...prev, bioFontSize: `${e.target.value}px` }))}
                className="h-8 w-full"
              />
            </div>
          </div>
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
            <h1 className="font-bold text-foreground mb-2" style={{ ...(current.nameFontSize ? { fontSize: current.nameFontSize } : { fontSize: '2rem' }) }}>
              {current.name || "Your Name"}
            </h1>
            
            {/* Social Icons */}
            {current.socialLinks && Object.values(current.socialLinks).some(link => link) && (
              <div className="flex justify-center gap-3 mb-4">
                {current.socialLinks.linkedin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-blue-600/20"
                    onClick={() => window.open(current.socialLinks?.linkedin, '_blank')}
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </Button>
                )}
                {current.socialLinks.github && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-foreground/20"
                    onClick={() => window.open(current.socialLinks?.github, '_blank')}
                  >
                    <Github className="w-4 h-4 text-foreground" />
                  </Button>
                )}
                {current.socialLinks.instagram && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-pink-500/20"
                    onClick={() => window.open(current.socialLinks?.instagram, '_blank')}
                  >
                    <Instagram className="w-4 h-4 text-pink-500" />
                  </Button>
                )}
                {current.socialLinks.facebook && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-blue-700/20"
                    onClick={() => window.open(current.socialLinks?.facebook, '_blank')}
                  >
                    <Facebook className="w-4 h-4 text-blue-700" />
                  </Button>
                )}
                {current.socialLinks.twitter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-foreground/20"
                    onClick={() => window.open(current.socialLinks?.twitter, '_blank')}
                  >
                    <Twitter className="w-4 h-4 text-foreground" />
                  </Button>
                )}
              </div>
            )}
            
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line" style={{ ...(current.bioFontSize ? { fontSize: current.bioFontSize } : {}) }}>
              {current.bio || "Add a bio to tell people about yourself..."}
            </p>
            <Button
              onClick={() => {
                // Ensure we edit the latest profile values
                setEditProfile(profile);
                setIsEditing(true);
              }}
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