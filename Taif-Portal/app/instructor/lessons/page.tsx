"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Plus,
  Trash2,
  MoreVertical,
  GripVertical,
  X,
  Check,
  ChevronRight,
} from "lucide-react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInstructor } from "@/contexts/InstructorContext";
import { InstructorLesson, InstructorLessonItem, LessonItemType } from "@/types/instructor";
import { cn } from "@/lib/utils";

export default function LessonsPage() {
  const {
    lessons,
    lessonItems,
    loadLessons,
    loadLessonItems,
    createStandaloneLesson,
    updateStandaloneLesson,
    deleteStandaloneLesson,
    addItemsToLesson,
    removeItemFromLesson,
    reorderStandaloneLessonItems,
  } = useInstructor();

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addItemsDialogOpen, setAddItemsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<InstructorLesson | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [reorderedItems, setReorderedItems] = useState<InstructorLessonItem[]>([]);

  useEffect(() => {
    loadLessons();
    loadLessonItems();
  }, [loadLessons, loadLessonItems]);

  const safeLessons = useMemo(() => lessons || [], [lessons]);
  const safeItems = lessonItems || [];

  const filteredLessons = safeLessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemIcon = (type: LessonItemType) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-primary" />;
      case "rich-content":
        return <FileText className="h-4 w-4 text-secondary" />;
      case "question":
        return <HelpCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getItemTypeCount = (lesson: InstructorLesson, type: string) => {
    return lesson.items.filter((item) => item.type === type).length;
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    const lesson = await createStandaloneLesson({
      title: formData.title,
      description: formData.description,
    });
    // Add selected items if any
    if (selectedItemIds.length > 0 && lesson) {
      await addItemsToLesson(lesson.id, selectedItemIds);
    }
    setCreateDialogOpen(false);
    setFormData({ title: "", description: "" });
    setSelectedItemIds([]);
    setCreateStep(1);
  };

  const handleCancelCreate = () => {
    setCreateDialogOpen(false);
    setFormData({ title: "", description: "" });
    setSelectedItemIds([]);
    setCreateStep(1);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteStandaloneLesson(deleteId);
      setDeleteId(null);
      if (selectedLesson?.id === deleteId) {
        setSelectedLesson(null);
      }
    }
  };

  const handleAddItems = async () => {
    if (selectedLesson && selectedItemIds.length > 0) {
      await addItemsToLesson(selectedLesson.id, selectedItemIds);
      setAddItemsDialogOpen(false);
      setSelectedItemIds([]);
      // Refresh lessons
      await loadLessons();
    }
  };

  // Keep selected lesson in sync with lessons array
  useEffect(() => {
    if (selectedLesson) {
      const updated = safeLessons.find((l) => l.id === selectedLesson.id);
      if (updated) {
        setSelectedLesson(updated);
        setReorderedItems(updated.items.sort((a, b) => a.order - b.order));
      }
    }
  }, [safeLessons, selectedLesson]);

  const handleReorderItems = async (newOrder: InstructorLessonItem[]) => {
    if (!selectedLesson) return;
    setReorderedItems(newOrder);
    // Reorder items using the dedicated method
    await reorderStandaloneLessonItems(selectedLesson.id, newOrder.map(item => item.id));
  };

  const handleRemoveItem = async (itemId: string) => {
    if (selectedLesson) {
      await removeItemFromLesson(selectedLesson.id, itemId);
      // Update local state
      setSelectedLesson((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : null
      );
    }
  };

  const openAddItemsDialog = (lesson: InstructorLesson) => {
    setSelectedLesson(lesson);
    setSelectedItemIds([]);
    setAddItemsDialogOpen(true);
  };

  const availableItems = safeItems.filter(
    (item) => !selectedLesson?.items.some((i) => i.id === item.id)
  );

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <InstructorLayout breadcrumbs={[{ label: "Lessons" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lessons</h1>
            <p className="text-muted-foreground">
              Create and manage reusable lessons for your courses
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Lesson
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{safeLessons.length}</p>
              <p className="text-sm text-muted-foreground">Total Lessons</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {safeLessons.reduce((sum, l) => sum + getItemTypeCount(l, "video"), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Video Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">
                {safeLessons.reduce((sum, l) => sum + getItemTypeCount(l, "rich-content"), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Content Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">
                {safeLessons.reduce((sum, l) => sum + getItemTypeCount(l, "question"), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </CardContent>
          </Card>
        </div>

        {/* Layout: Lessons list + Detail panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lessons List */}
          <div className="space-y-3">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedLesson?.id === lesson.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{lesson.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {lesson.items.length} items
                          </Badge>
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openAddItemsDialog(lesson)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Items
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(lesson.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No lessons found" : "No lessons yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "Create lessons to organize your content"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Lesson
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detail Panel */}
          <Card className="h-fit lg:sticky lg:top-6">
            <CardContent className="p-4">
              {selectedLesson ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{selectedLesson.title}</h2>
                      {selectedLesson.description && (
                        <p className="text-sm text-muted-foreground">
                          {selectedLesson.description}
                        </p>
                      )}
                    </div>
                    <Button size="sm" onClick={() => openAddItemsDialog(selectedLesson)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Items
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">
                        Lesson Items ({selectedLesson.items.length})
                      </h3>
                      <p className="text-xs text-muted-foreground">Drag to reorder</p>
                    </div>
                    {reorderedItems.length > 0 ? (
                      <Reorder.Group
                        axis="y"
                        values={reorderedItems}
                        onReorder={handleReorderItems}
                        className="space-y-2"
                      >
                        {reorderedItems.map((item) => (
                          <Reorder.Item
                            key={item.id}
                            value={item}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            {getItemIcon(item.type)}
                            <span className="flex-1 text-sm truncate">{item.title}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.type.replace("-", " ")}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(item.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No items in this lesson yet
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a lesson to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Dialog - Two Step */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => !open && handleCancelCreate()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {createStep === 1 ? "Create Lesson" : "Add Lesson Items"}
            </DialogTitle>
            <DialogDescription>
              {createStep === 1
                ? "Step 1: Enter lesson details"
                : "Step 2: Select items to include (optional)"}
            </DialogDescription>
          </DialogHeader>

          {createStep === 1 ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Enter lesson title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Enter lesson description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <ScrollArea className="h-72">
                <div className="space-y-2 pr-4">
                  {safeItems.length > 0 ? (
                    safeItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedItemIds.includes(item.id)
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <Checkbox
                          checked={selectedItemIds.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />
                        {getItemIcon(item.type)}
                        <span className="flex-1 text-sm truncate">{item.title}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.type.replace("-", " ")}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-2">No lesson items available</p>
                      <p className="text-xs">Create lesson items first to add them here</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              {selectedItemIds.length > 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  {selectedItemIds.length} item(s) selected
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {createStep === 2 && (
              <Button variant="ghost" onClick={() => setCreateStep(1)}>
                Back
              </Button>
            )}
            <Button variant="outline" onClick={handleCancelCreate}>
              Cancel
            </Button>
            {createStep === 1 ? (
              <Button
                onClick={() => setCreateStep(2)}
                disabled={!formData.title.trim()}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate}>
                <Check className="mr-2 h-4 w-4" />
                Create Lesson
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Items Dialog */}
      <Dialog open={addItemsDialogOpen} onOpenChange={setAddItemsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Items to Lesson</DialogTitle>
            <DialogDescription>Select lesson items to add</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-2 py-4">
              {availableItems.length > 0 ? (
                availableItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedItemIds.includes(item.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    <Checkbox
                      checked={selectedItemIds.includes(item.id)}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                    />
                    {getItemIcon(item.type)}
                    <span className="flex-1 text-sm">{item.title}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.type.replace("-", " ")}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No available items. Create lesson items first.
                </p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItems} disabled={selectedItemIds.length === 0}>
              Add {selectedItemIds.length > 0 && `(${selectedItemIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this lesson. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </InstructorLayout>
  );
}
