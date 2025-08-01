import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, GripVertical, Upload, Type, ExternalLink, Plus, X } from "lucide-react";
import { LinkData } from "./LinkCard";

interface TextCardProps {
  link: LinkData;
  onUpdate: (link: LinkData) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export const TextCard = ({ link, onUpdate, onDelete, isDragging }: TextCardProps) => {
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

  const addTextItem = () => {
    setEditLink(prev => ({
      ...prev,
      textItems: [...(prev.textItems || []), { text: '', url: '' }]
    }));
  };

  const updateTextItem = (index: number, field: 'text' | 'url', value: string) => {
    setEditLink(prev => ({
      ...prev,
      textItems: prev.textItems?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const removeTextItem = (index: number) => {
    setEditLink(prev => ({
      ...prev,
      textItems: prev.textItems?.filter((_, i) => i !== index) || []
    }));
  };

  const formatContent = (content?: string) => {
    if (!content) return null;
    
    // Convert simple markdown-like syntax to HTML
    let formatted = content
      // Convert bullet points
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Convert numbered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Convert line breaks
      .replace(/\n/g, '<br/>');
    
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/(<li>.*?<\/li>(\s*<br\/>)*)+/g, (match) => {
      const listItems = match.replace(/<br\/>/g, '');
      return `<ul class="list-disc list-inside space-y-1 ml-2">${listItems}</ul>`;
    });
    
    return formatted;
  };

  return (
    <Card 
      className={`glass-card ${getSizeClasses(link.size)} transition-smooth hover:glow-effect group relative ${
        isDragging ? 'opacity-50 rotate-2' : ''
      } ${link.url ? 'cursor-pointer' : ''}`}
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
              placeholder="Text card title"
              className="glass-card border-primary/20"
            />
            
            {/* Clickable List Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Clickable List Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTextItem}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </Button>
              </div>
              {editLink.textItems?.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={item.text}
                    onChange={(e) => updateTextItem(index, 'text', e.target.value)}
                    placeholder="List item text"
                    className="glass-card border-primary/20 flex-1"
                  />
                  <Input
                    value={item.url || ''}
                    onChange={(e) => updateTextItem(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    className="glass-card border-primary/20 flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTextItem(index)}
                    className="w-8 h-8 text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Textarea
              value={editLink.content || ''}
              onChange={(e) => setEditLink(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Additional text content (optional)&#10;&#10;Tips:&#10;• Use * or - for bullet points&#10;• Use 1. 2. 3. for numbered lists&#10;• Use line breaks for paragraphs"
              className="glass-card border-primary/20 resize-none"
              rows={4}
            />
            <Input
              value={editLink.url}
              onChange={(e) => setEditLink(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com (optional - makes the entire card clickable)"
              className="glass-card border-primary/20"
            />
            
            {/* Icon Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Icon</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={editLink.icon || ''}
                  onChange={(e) => setEditLink(prev => ({ ...prev, icon: e.target.value, iconType: 'emoji' }))}
                  placeholder="📝 or emoji"
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
              <div className="flex items-center gap-2 mb-2">
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
                  {link.title || "Text Card"}
                </h3>
                {link.url && <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-smooth" />}
                {!link.url && <Type className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-smooth" />}
              </div>
              {link.textItems && link.textItems.length > 0 && (
                <ul className="text-sm leading-relaxed space-y-2 mb-3">
                  {link.textItems.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      {item.url ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.url, '_blank');
                          }}
                          className="text-left hover:underline hover:text-primary transition-colors"
                          style={{ color: link.textColor }}
                        >
                          {item.text} {item.url}
                        </button>
                      ) : (
                        <span style={{ color: link.textColor }}>{item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {link.content && (
                <div 
                  className="text-sm leading-relaxed"
                  style={{ color: link.textColor }}
                  dangerouslySetInnerHTML={{ __html: formatContent(link.content) }}
                />
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