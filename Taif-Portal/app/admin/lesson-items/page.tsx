"use client";

import { useState, useEffect, useMemo } from "react";
import { Layers, Search, Plus, Video, FileText, HelpCircle, Edit, Trash2, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LessonItem } from "@/models/lesson-item.model";
import { lessonItemService } from "@/services/lesson-item.service";
import { contentService, Content, LessonItemType } from "@/services/content.service";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<number, React.ReactNode> = {
  0: <Video className="h-5 w-5" />,
  1: <FileText className="h-5 w-5" />,
  2: <HelpCircle className="h-5 w-5" />,
};

const typeColors: Record<number, string> = {
  0: "bg-blue-500/10 text-blue-500",
  1: "bg-green-500/10 text-green-500",
  2: "bg-purple-500/10 text-purple-500",
};

const typeLabels: Record<number, string> = {
  0: "Video",
  1: "Rich Text",
  2: "Quiz",
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function LessonItemsPage() {
  const [items, setItems] = useState<LessonItem[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<LessonItem | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contentId: "",
    type: 0,
    durationInSeconds: 0,
  });
  const [contentOpen, setContentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadAllItems();
    loadContents();
  }, []);

  const loadAllItems = async () => {
    setIsLoading(true);
    try {
      const data = await lessonItemService.getAllLessonItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContents = async () => {
    try {
      const data = await contentService.getAllContent();
      setContents(data);
    } catch (error) {
      console.error("Failed to load contents:", error);
    }
  };

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(query));
    }
    if (selectedType !== "all") {
      result = result.filter(item => item.type === selectedType);
    }
    return result;
  }, [items, searchQuery, selectedType]);

  const getContentTitle = (contentId?: string) => {
    if (!contentId) return "No content";
    const content = contents.find(c => c.id === contentId);
    if (!content) return "Unknown content";
    try {
      const data = JSON.parse(content.contentJson);
      return data.title || "Untitled";
    } catch {
      return "Untitled";
    }
  };

  const filteredContents = useMemo(() => {
    if (formData.type === undefined) return contents;
    return contents.filter(c => c.type === formData.type);
  }, [contents, formData.type]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      contentId: "",
      type: 0,
      durationInSeconds: 0,
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.contentId) {
      toast({ title: "Error", description: "Name and Content are required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await lessonItemService.createLessonItem({
        name: formData.name,
        description: formData.description || undefined,
        contentId: formData.contentId,
        type: formData.type,
        lessonId: "00000000-0000-0000-0000-000000000000", // Placeholder - will be assigned when added to lesson
        durationInSeconds: formData.durationInSeconds,
      });
      toast({ title: "Success", description: "Lesson item created successfully" });
      setCreateDialogOpen(false);
      resetForm();
      loadAllItems();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create lesson item", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingItem || !formData.name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await lessonItemService.updateLessonItem(editingItem.id, {
        name: formData.name,
        description: formData.description || undefined,
        contentId: formData.contentId || undefined,
        type: formData.type,
        durationInSeconds: formData.durationInSeconds,
      });
      toast({ title: "Success", description: "Lesson item updated successfully" });
      setEditDialogOpen(false);
      setEditingItem(null);
      resetForm();
      loadAllItems();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lesson item", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await lessonItemService.deleteLessonItem(deleteId);
      toast({ title: "Success", description: "Lesson item deleted successfully" });
      setDeleteId(null);
      loadAllItems();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete lesson item", variant: "destructive" });
    }
  };

  const openEditDialog = (item: LessonItem) => {
    setEditingItem(item);
    // Get type from the content if available
    let itemType = typeof item.type === 'number' ? item.type : 0;
    if (item.contentId) {
      const content = contents.find(c => c.id === item.contentId);
      if (content) {
        itemType = content.type;
      }
    }
    setFormData({
      name: item.name,
      description: item.description || "",
      contentId: item.contentId || "",
      type: itemType,
      durationInSeconds: item.durationInSeconds || 0,
    });
    setEditDialogOpen(true);
  };

  // Auto-update type and duration when content is selected
  const handleContentSelect = (contentId: string) => {
    const content = contents.find(c => c.id === contentId);
    let duration = formData.durationInSeconds;
    
    // Extract duration from video content
    if (content && content.type === 0) {
      try {
        const data = JSON.parse(content.contentJson);
        if (data.durationInSeconds) {
          duration = data.durationInSeconds;
        }
      } catch {}
    }
    
    setFormData({ 
      ...formData, 
      contentId, 
      type: content ? content.type : formData.type,
      durationInSeconds: duration
    });
    setContentOpen(false);
  };

  const getItemType = (item: LessonItem): number => {
    if (typeof item.type === 'number') return item.type;
    const typeStr = String(item.type).toLowerCase();
    if (typeStr === 'video') return 0;
    if (typeStr === 'richtext') return 1;
    if (typeStr === 'quiz') return 2;
    return 0;
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Lesson Items" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Lesson Items</h1>
            <p className="text-muted-foreground">
              Manage lesson items ({filteredItems.length} items)
            </p>
          </div>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson Item
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="0">Video</SelectItem>
                  <SelectItem value="1">Rich Text</SelectItem>
                  <SelectItem value="2">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Lesson Items Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || selectedType !== "all"
                  ? "No items match your filters."
                  : "Create your first lesson item to get started."}
              </p>
              <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => {
              const itemType = getItemType(item);
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[itemType] || "bg-gray-100"}`}>
                          {typeIcons[itemType] || <Layers className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description || "No description"}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Badge variant="outline">{typeLabels[itemType]}</Badge>
                            <span>•</span>
                            <span>Content: {getContentTitle(item.contentId)}</span>
                            {item.durationInSeconds > 0 && (
                              <>
                                <span>•</span>
                                <span>{Math.round(item.durationInSeconds / 60)} min</span>
                              </>
                            )}
                          </div>
                          {item.createdAt && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {formatDate(item.createdAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Lesson Item</DialogTitle>
            <DialogDescription>Add a new lesson item with content reference.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter lesson item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formData.type.toString()} onValueChange={(v) => setFormData({ ...formData, type: parseInt(v), contentId: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Video</SelectItem>
                  <SelectItem value="1">Rich Text</SelectItem>
                  <SelectItem value="2">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Popover open={contentOpen} onOpenChange={setContentOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {formData.contentId ? getContentTitle(formData.contentId) : "Select content..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search content..." />
                    <CommandList>
                      <CommandEmpty>No content found.</CommandEmpty>
                      <CommandGroup>
                        {filteredContents.map((content) => {
                          const title = getContentTitle(content.id);
                          return (
                            <CommandItem
                              key={content.id}
                              value={content.id}
                              onSelect={() => handleContentSelect(content.id)}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formData.contentId === content.id ? "opacity-100" : "opacity-0")} />
                              {title}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.durationInSeconds}
                onChange={(e) => setFormData({ ...formData, durationInSeconds: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lesson Item</DialogTitle>
            <DialogDescription>Update lesson item details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type.toString()} onValueChange={(v) => setFormData({ ...formData, type: parseInt(v), contentId: "" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Video</SelectItem>
                  <SelectItem value="1">Rich Text</SelectItem>
                  <SelectItem value="2">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {formData.contentId ? getContentTitle(formData.contentId) : "Select content..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search content..." />
                    <CommandList>
                      <CommandEmpty>No content found.</CommandEmpty>
                      <CommandGroup>
                        {filteredContents.map((content) => {
                          const title = getContentTitle(content.id);
                          return (
                            <CommandItem
                              key={content.id}
                              value={content.id}
                              onSelect={() => handleContentSelect(content.id)}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formData.contentId === content.id ? "opacity-100" : "opacity-0")} />
                              {title}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (seconds)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={formData.durationInSeconds}
                onChange={(e) => setFormData({ ...formData, durationInSeconds: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
