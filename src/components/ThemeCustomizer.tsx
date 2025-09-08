import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Palette, Type, Layout, Sparkles, FileDown, Upload, RotateCcw } from "lucide-react";
import { ThemeConfig, defaultTheme, applyTheme } from "@/lib/theme";

interface ThemeCustomizerProps {
  theme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void; // Persist to backend
  onThemePreview?: (theme: ThemeConfig) => void; // Live apply in admin without saving
}

export const ThemeCustomizer = ({ theme, onThemeChange, onThemePreview }: ThemeCustomizerProps) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [pendingTheme, setPendingTheme] = useState<ThemeConfig>(theme);

  // Sync pendingTheme with theme prop when it changes
  useEffect(() => {
    setPendingTheme(theme);
  }, [theme]);
  
  const updatePendingTheme = (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...pendingTheme, ...updates } as ThemeConfig;
    setPendingTheme(newTheme);
    // Live preview in admin without persisting
    onThemePreview?.(newTheme);
  };

  const saveTheme = async () => {
    try {
      await onThemeChange(pendingTheme);
      // Don't apply theme to admin interface here; preview already applied live
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const ColorPicker = ({ 
    label, 
    value, 
    onChange, 
    id 
  }: { 
    label: string; 
    value: string; 
    onChange: (color: string) => void;
    id: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2">
        <div
          className="w-8 h-8 rounded border-2 border-border cursor-pointer transition-all hover:scale-110"
          style={{ backgroundColor: value }}
          onClick={() => setActiveColorPicker(activeColorPicker === id ? null : id)}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
          placeholder="#000000"
        />
      </div>
      {activeColorPicker === id && (
        <div className="absolute z-50 mt-2">
          <div 
            className="fixed inset-0" 
            onClick={() => setActiveColorPicker(null)}
          />
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
            <HexColorPicker color={value} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  );

  const exportTheme = () => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mylinks-theme.json';
    link.click();
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target?.result as string);
          onThemeChange(importedTheme);
          applyTheme(importedTheme);
        } catch (error) {
          console.error('Failed to import theme:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const resetTheme = () => {
    onThemeChange(defaultTheme);
    applyTheme(defaultTheme);
  };

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Theme Customizer</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveTheme} size="sm">
            Save Changes
          </Button>
          <Button variant="outline" size="sm" onClick={exportTheme}>
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importTheme}
                className="hidden"
              />
            </label>
          </Button>
          <Button variant="destructive" size="sm" onClick={resetTheme}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="colors" className="flex items-center gap-1">
            <Palette className="w-4 h-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-1">
            <Type className="w-4 h-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-2 gap-4 relative">
            <ColorPicker
              id="primary"
              label="Primary Color"
              value={pendingTheme.primary}
              onChange={(color) => updatePendingTheme({ primary: color })}
            />
            <ColorPicker
              id="primaryGlow"
              label="Primary Glow"
              value={pendingTheme.primaryGlow}
              onChange={(color) => updatePendingTheme({ primaryGlow: color })}
            />
            <ColorPicker
              id="background"
              label="Background"
              value={pendingTheme.background}
              onChange={(color) => updatePendingTheme({ background: color })}
            />
            <ColorPicker
              id="backgroundSecondary"
              label="Background Secondary"
              value={pendingTheme.backgroundSecondary}
              onChange={(color) => updatePendingTheme({ backgroundSecondary: color })}
            />
            <ColorPicker
              id="card"
              label="Card Background"
              value={pendingTheme.card}
              onChange={(color) => updatePendingTheme({ card: color })}
            />
            <ColorPicker
              id="foreground"
              label="Text Color"
              value={pendingTheme.foreground}
              onChange={(color) => updatePendingTheme({ foreground: color })}
            />
            <ColorPicker
              id="muted"
              label="Muted Text"
              value={pendingTheme.muted}
              onChange={(color) => updatePendingTheme({ muted: color })}
            />
            <ColorPicker
              id="accent"
              label="Accent Color"
              value={pendingTheme.accent}
              onChange={(color) => updatePendingTheme({ accent: color })}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Background Gradient</h3>
            <div className="grid grid-cols-2 gap-4 relative">
              <ColorPicker
                id="bgGradientFrom"
                label="Gradient Start"
                value={pendingTheme.backgroundGradient.from}
                onChange={(color) => updatePendingTheme({
                  backgroundGradient: { ...pendingTheme.backgroundGradient, from: color }
                })}
              />
              <ColorPicker
                id="bgGradientTo"
                label="Gradient End"
                value={pendingTheme.backgroundGradient.to}
                onChange={(color) => updatePendingTheme({
                  backgroundGradient: { ...pendingTheme.backgroundGradient, to: color }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gradient Direction</Label>
              <Select
                value={pendingTheme.backgroundGradient.direction}
                onValueChange={(direction) => updatePendingTheme({
                  backgroundGradient: { ...pendingTheme.backgroundGradient, direction }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0deg">Top to Bottom</SelectItem>
                  <SelectItem value="90deg">Left to Right</SelectItem>
                  <SelectItem value="135deg">Diagonal (Top-Left to Bottom-Right)</SelectItem>
                  <SelectItem value="45deg">Diagonal (Bottom-Left to Top-Right)</SelectItem>
                  <SelectItem value="180deg">Bottom to Top</SelectItem>
                  <SelectItem value="270deg">Right to Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={pendingTheme.fontFamily}
                onValueChange={(fontFamily) => updatePendingTheme({ fontFamily })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                  <SelectItem value="Poppins, system-ui, sans-serif">Poppins</SelectItem>
                  <SelectItem value="Roboto, system-ui, sans-serif">Roboto</SelectItem>
                  <SelectItem value="Montserrat, system-ui, sans-serif">Montserrat</SelectItem>
                  <SelectItem value="Open Sans, system-ui, sans-serif">Open Sans</SelectItem>
                  <SelectItem value="Lato, system-ui, sans-serif">Lato</SelectItem>
                  <SelectItem value="Playfair Display, serif">Playfair Display</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name Font Size</Label>
                <Input
                  value={pendingTheme.fontSize.name}
                  onChange={(e) => updatePendingTheme({
                    fontSize: { ...pendingTheme.fontSize, name: e.target.value }
                  })}
                  placeholder="1.5rem"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio Font Size</Label>
                <Input
                  value={pendingTheme.fontSize.bio}
                  onChange={(e) => updatePendingTheme({
                    fontSize: { ...pendingTheme.fontSize, bio: e.target.value }
                  })}
                  placeholder="0.875rem"
                />
              </div>
              <div className="space-y-2">
                <Label>Link Title Size</Label>
                <Input
                  value={pendingTheme.fontSize.linkTitle}
                  onChange={(e) => updatePendingTheme({
                    fontSize: { ...pendingTheme.fontSize, linkTitle: e.target.value }
                  })}
                  placeholder="1rem"
                />
              </div>
              <div className="space-y-2">
                <Label>Link Description Size</Label>
                <Input
                  value={pendingTheme.fontSize.linkDescription}
                  onChange={(e) => updatePendingTheme({
                    fontSize: { ...pendingTheme.fontSize, linkDescription: e.target.value }
                  })}
                  placeholder="0.875rem"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Card Border Radius: {pendingTheme.cardRadius}px</Label>
              <Slider
                value={[pendingTheme.cardRadius]}
                onValueChange={([value]) => updatePendingTheme({ cardRadius: value })}
                max={24}
                min={0}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Card Spacing: {pendingTheme.cardSpacing}px</Label>
              <Slider
                value={[pendingTheme.cardSpacing]}
                onValueChange={([value]) => updatePendingTheme({ cardSpacing: value })}
                max={32}
                min={4}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Glow Intensity: {pendingTheme.glowIntensity}</Label>
              <Slider
                value={[pendingTheme.glowIntensity]}
                onValueChange={([value]) => updatePendingTheme({ glowIntensity: value })}
                max={1}
                min={0}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <Label>Blur Intensity: {pendingTheme.blurIntensity}px</Label>
              <Slider
                value={[pendingTheme.blurIntensity]}
                onValueChange={([value]) => updatePendingTheme({ blurIntensity: value })}
                max={50}
                min={0}
                step={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Width</Label>
            <Select
              value={pendingTheme.maxWidth}
              onValueChange={(maxWidth) => updatePendingTheme({ maxWidth })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20rem">Small (320px)</SelectItem>
                <SelectItem value="24rem">Medium (384px)</SelectItem>
                <SelectItem value="28rem">Large (448px)</SelectItem>
                <SelectItem value="32rem">Extra Large (512px)</SelectItem>
                <SelectItem value="36rem">XXL (576px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Name</Label>
              <Input
                value={pendingTheme.content.profileName}
                onChange={(e) => updatePendingTheme({
                  content: { ...pendingTheme.content, profileName: e.target.value }
                })}
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Profile Bio</Label>
              <Textarea
                value={pendingTheme.content.profileBio}
                onChange={(e) => updatePendingTheme({
                  content: { ...pendingTheme.content, profileBio: e.target.value }
                })}
                placeholder="Tell people about yourself..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Footer Text</Label>
              <Input
                value={pendingTheme.content.footerText}
                onChange={(e) => updatePendingTheme({
                  content: { ...pendingTheme.content, footerText: e.target.value }
                })}
                placeholder="Connect with me through these links"
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Page Title</Label>
              <Input
                value={pendingTheme.content.adminTitle}
                onChange={(e) => updatePendingTheme({
                  content: { ...pendingTheme.content, adminTitle: e.target.value }
                })}
                placeholder="Link Manager Admin"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
