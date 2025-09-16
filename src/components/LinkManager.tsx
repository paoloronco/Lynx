import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Link, Type, Upload, Download } from "lucide-react";
import { LinkCard, LinkData } from "./LinkCard";
import { TextCard } from "./TextCard";

interface LinkManagerProps {
  links: LinkData[];
  onLinksUpdate: (links: LinkData[]) => void;
}

export const LinkManager = ({ links, onLinksUpdate }: LinkManagerProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const addNewLink = () => {
    const newLink: LinkData = {
      id: Date.now().toString(),
      title: "New link",
      description: "",
      url: "",
      type: "link",
    };
    onLinksUpdate([...links, newLink]);
  };

  const addNewTextCard = () => {
    const newTextCard: LinkData = {
      id: Date.now().toString(),
      title: "New text",
      description: "",
      url: "",
      type: "text",
      content: "",
    };
    onLinksUpdate([...links, newTextCard]);
  };

  const updateLink = (updatedLink: LinkData) => {
    const updatedLinks = links.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    );
    onLinksUpdate(updatedLinks);
  };

  const deleteLink = (id: string) => {
    const updatedLinks = links.filter(link => link.id !== id);
    onLinksUpdate(updatedLinks);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const performReorder = (fromId: string, toId: string) => {
    if (!fromId || !toId || fromId === toId) return;
    const draggedIndex = links.findIndex(link => link.id === fromId);
    const targetIndex = links.findIndex(link => link.id === toId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newLinks = [...links];
    const [draggedLink] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, draggedLink);
    onLinksUpdate(newLinks);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;
    performReorder(draggedItem, targetId);
    setDraggedItem(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverId(null);
  };

  const handleDragEnter = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;
    setDragOverId(targetId);
    // Reorder live as we drag over items for fluid UX
    performReorder(draggedItem, targetId);
  };

  // Export links as JSON
  const exportLinks = async () => {
    try {
      setBusy(true);
      const blob = await (await import('@/lib/api-client')).linksApi.export();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'links-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  // Import links from JSON
  const importLinks = async (file: File) => {
    try {
      setBusy(true);
      const text = await file.text();
      const data = JSON.parse(text);
      const { linksApi } = await import('@/lib/api-client');
      await linksApi.import(data);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) await importLinks(file);
    };
    input.click();
  };

  const moveByOffset = (id: string, delta: number) => {
    const index = links.findIndex(l => l.id === id);
    if (index === -1) return;
    const newIndex = Math.max(0, Math.min(links.length - 1, index + delta));
    if (newIndex === index) return;
    const newLinks = [...links];
    const [item] = newLinks.splice(index, 1);
    newLinks.splice(newIndex, 0, item);
    onLinksUpdate(newLinks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Your Content</h2>
        <div className="flex gap-2">
          <Button 
            onClick={addNewLink}
            variant="gradient"
            className="gap-2"
          >
            <Link className="w-4 h-4" />
            Add Link
          </Button>
          <Button 
            onClick={addNewTextCard}
            variant="outline"
            className="gap-2"
          >
            <Type className="w-4 h-4" />
            Add Text
          </Button>
          <Button onClick={exportLinks} variant="outline" className="gap-2" disabled={busy}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={handleImportFile} variant="outline" className="gap-2" disabled={busy}>
            <Upload className="w-4 h-4" /> Import
          </Button>
        </div>
      </div>

      {links.length === 0 ? (
        <Card className="glass-card p-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl opacity-50">📝</div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">No content yet</h3>
                <p className="text-muted-foreground text-sm">
                  Add links or text cards to get started with your personal hub.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={addNewLink} variant="gradient">
                  <Link className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
                <Button onClick={addNewTextCard} variant="outline">
                  <Type className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
              </div>
            </div>
        </Card>
      ) : (
        <div className="flex flex-col" style={{ gap: 'var(--card-spacing)' }}>
          {links.map((link) => (
            <div
              key={link.id}
              draggable
              onDragStart={(e) => handleDragStart(e, link.id)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(link.id)}
              onDrop={(e) => handleDrop(e, link.id)}
              onDragEnd={handleDragEnd}
              className={dragOverId === link.id ? 'ring-2 ring-primary/40 rounded-lg' : ''}
            >
              {link.type === 'text' ? (
                <TextCard
                  link={link}
                  onUpdate={updateLink}
                  onDelete={deleteLink}
                  isDragging={draggedItem === link.id}
                />
              ) : (
                <LinkCard
                  link={link}
                  onUpdate={updateLink}
                  onDelete={deleteLink}
                  onMoveUp={() => moveByOffset(link.id, -1)}
                  onMoveDown={() => moveByOffset(link.id, 1)}
                  isDragging={draggedItem === link.id}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};