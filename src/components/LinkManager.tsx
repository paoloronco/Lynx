import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Link, Type } from "lucide-react";
import { LinkCard, LinkData } from "./LinkCard";
import { TextCard } from "./TextCard";

interface LinkManagerProps {
  links: LinkData[];
  onLinksUpdate: (links: LinkData[]) => void;
}

export const LinkManager = ({ links, onLinksUpdate }: LinkManagerProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const addNewLink = () => {
    const newLink: LinkData = {
      id: Date.now().toString(),
      title: "",
      description: "",
      url: "",
      type: "link",
    };
    onLinksUpdate([...links, newLink]);
  };

  const addNewTextCard = () => {
    const newTextCard: LinkData = {
      id: Date.now().toString(),
      title: "",
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

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = links.findIndex(link => link.id === draggedItem);
    const targetIndex = links.findIndex(link => link.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newLinks = [...links];
    const [draggedLink] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, draggedLink);

    onLinksUpdate(newLinks);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
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
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              draggable
              onDragStart={(e) => handleDragStart(e, link.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, link.id)}
              onDragEnd={handleDragEnd}
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