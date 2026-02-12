"use client";

/**
 * AddLessonItemDialog - Reusable dialog for adding lesson items (create new or select existing)
 */

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Library, Check, FileText, Video, HelpCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonItem, LessonItemType } from "@/lib/api/types";

export type AddItemMode = "create" | "select";

interface AddLessonItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AddItemMode;
  onModeChange: (mode: AddItemMode) => void;
  availableItems: LessonItem[];
  excludeItemIds?: string[];
  onCreateItem: (name: string, type: LessonItemType, content: string) => Promise<void>;
  onSelectItems: (itemIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

const getItemTypeIcon = (type: LessonItemType) => {
  switch (type) {
    case LessonItemType.Video:
      return <Video className="h-4 w-4 text-primary" />;
    case LessonItemType.RichText:
      return <FileText className="h-4 w-4 text-secondary" />;
    case LessonItemType.Question:
      return <HelpCircle className="h-4 w-4 text-warning" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getItemTypeLabel = (type: LessonItemType): string => {
  switch (type) {
    case LessonItemType.Video:
      return "Video";
    case LessonItemType.RichText:
      return "Rich Text";
    case LessonItemType.Question:
      return "Question";
    default:
      return "Unknown";
  }
};

export function AddLessonItemDialog({
  open,
  onOpenChange,
  mode,
  onModeChange,
  availableItems,
  excludeItemIds = [],
  onCreateItem,
  onSelectItems,
  isLoading = false,
}: AddLessonItemDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<LessonItemType>(LessonItemType.Video);
  const [content, setContent] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredItems = useMemo(() => {
    let items = availableItems.filter((i) => !excludeItemIds.includes(i.id));
    
    if (typeFilter !== "all") {
      items = items.filter((i) => i.type === parseInt(typeFilter));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(query));
    }
    
    return items;
  }, [availableItems, excludeItemIds, searchQuery, typeFilter]);

  const toggleSelection = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    await onCreateItem(name, type, content);
    handleClose();
  };

  const handleSelect = async () => {
    if (selectedIds.length === 0) return;
    await onSelectItems(selectedIds);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setType(LessonItemType.Video);
    setContent("");
    setSelectedIds([]);
    setSearchQuery("");
    setTypeFilter("all");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Item" : "Add Existing Items"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new lesson item"
              : "Select items from your content library"}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 border-b pb-4">
          <Button
            variant={mode === "create" ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange("create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
          <Button
            variant={mode === "select" ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange("select")}
          >
            <Library className="mr-2 h-4 w-4" />
            Select Existing
          </Button>
        </div>

        {mode === "create" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name *</Label>
              <Input
                id="item-name"
                placeholder="e.g., Introduction Video"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-type">Type *</Label>
              <Select
                value={type.toString()}
                onValueChange={(v) => setType(parseInt(v) as LessonItemType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LessonItemType.Video.toString()}>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </div>
                  </SelectItem>
                  <SelectItem value={LessonItemType.RichText.toString()}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Rich Text
                    </div>
                  </SelectItem>
                  <SelectItem value={LessonItemType.Question.toString()}>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Question
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-content">Content</Label>
              <Textarea
                id="item-content"
                placeholder={
                  type === LessonItemType.Video
                    ? "Video URL..."
                    : type === LessonItemType.RichText
                    ? "Rich text content..."
                    : "Question JSON..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={LessonItemType.Video.toString()}>Video</SelectItem>
                  <SelectItem value={LessonItemType.RichText.toString()}>Rich Text</SelectItem>
                  <SelectItem value={LessonItemType.Question.toString()}>Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedIds.includes(item.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleSelection(item.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleSelection(item.id)}
                      />
                      {getItemTypeIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getItemTypeLabel(item.type)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-2">No items available</p>
                    <p className="text-xs">
                      Create content first or switch to &quot;Create New&quot;
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
            {selectedIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedIds.length} item(s) selected
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {mode === "create" ? (
            <Button onClick={handleCreate} disabled={!name.trim() || isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Create Item
            </Button>
          ) : (
            <Button
              onClick={handleSelect}
              disabled={selectedIds.length === 0 || isLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
