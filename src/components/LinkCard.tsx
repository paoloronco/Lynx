import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, ExternalLink, GripVertical, Upload, Palette } from "lucide-react";

export interface LinkData {
  id: string;
  title: string;
  description: string;
  url: string;
  icon?: string;
  iconType?: 'emoji' | 'image' | 'svg';
  backgroundColor?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'link' | 'text';
  content?: string; // For text-only cards
  textItems?: Array<{
    text: string;
    url?: string;
  }>; // For clickable list items
}

interface LinkCardProps {
  link: LinkData;
  onUpdate: (link: LinkData) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export const LinkCard = ({ link, onUpdate, onDelete, isDragging }: LinkCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLink, setEditLink] = useState(link);

  const handleSave = () => {
    onUpdate(editLink);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLink(link);
    setIsEditing(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setEditLink(prev => ({ 
          ...prev, 
          icon: result,
          iconType: file.type.startsWith('image/svg') ? 'svg' : 'image'
        }));
      };
      reader.readAsDataURL(file);
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

  const handleClick = () => {
    if (!isEditing && link.url) {
      window.open(link.url, '_blank');
    }
  };

  return (
    <Card 
      className={`glass-card ${getSizeClasses(link.size)} transition-smooth hover:glow-effect group cursor-pointer relative ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
      onClick={handleClick}
      style={getCustomStyles()}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-smooth cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="ml-6">
        {isEditing ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editLink.title}
              onChange={(e) => setEditLink(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Link title"
              className="glass-card border-primary/20"
            />
            <Textarea
              value={editLink.description}
              onChange={(e) => setEditLink(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Link description"
              className="glass-card border-primary/20 resize-none"
              rows={2}
            />
            <Input
              value={editLink.url}
              onChange={(e) => setEditLink(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
              className="glass-card border-primary/20"
            />
            
            {/* Icon Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Icon</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={editLink.icon || ''}
                  onChange={(e) => setEditLink(prev => ({ ...prev, icon: e.target.value, iconType: 'emoji' }))}
                  placeholder="🔗 or emoji"
                  className="glass-card border-primary/20 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleIconUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Size</Label>
              <Select
                value={editLink.size || 'medium'}
                onValueChange={(value: 'small' | 'medium' | 'large') => 
                  setEditLink(prev => ({ ...prev, size: value }))
                }
              >
                <SelectTrigger className="glass-card border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Background</Label>
                <Input
                  type="color"
                  value={editLink.backgroundColor || '#000000'}
                  onChange={(e) => setEditLink(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="h-8 w-full"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Text Color</Label>
                <Input
                  type="color"
                  value={editLink.textColor || '#ffffff'}
                  onChange={(e) => setEditLink(prev => ({ ...prev, textColor: e.target.value }))}
                  className="h-8 w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSave} variant="gradient" size="sm">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
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
                <h3 className="font-semibold truncate" style={{ color: link.textColor }}>
                  {link.title || "Untitled Link"}
                </h3>
                <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-smooth" />
              </div>
              {link.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {link.description}
                </p>
              )}
              {link.url && (
                <p className="text-xs text-accent mt-1 truncate">
                  {link.url}
                </p>
              )}
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="icon"
                className="w-8 h-8"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => onDelete(link.id)}
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};