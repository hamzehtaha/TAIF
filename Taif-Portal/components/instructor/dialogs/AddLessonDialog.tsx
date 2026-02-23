"use client";

/**
 * AddLessonDialog - Reusable dialog for adding lessons (create new or select existing)
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Library, Check, BookOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson, LessonWithItems } from "@/lib/api/types";

export type AddLessonMode = "create" | "select";

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AddLessonMode;
  onModeChange: (mode: AddLessonMode) => void;
  availableLessons: (Lesson | LessonWithItems)[];
  excludeLessonIds?: string[];
  courseId: string;
  onCreateLesson: (title: string, courseId: string, photo?: string) => Promise<void>;
  onSelectLessons: (lessonIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function AddLessonDialog({
  open,
  onOpenChange,
  mode,
  onModeChange,
  availableLessons,
  excludeLessonIds = [],
  courseId,
  onCreateLesson,
  onSelectLessons,
  isLoading = false,
}: AddLessonDialogProps) {
  const [title, setTitle] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLessons = useMemo(() => {
    const available = availableLessons.filter(
      (l) => !excludeLessonIds.includes(l.id)
    );
    if (!searchQuery.trim()) return available;
    const query = searchQuery.toLowerCase();
    return available.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query)
    );
  }, [availableLessons, excludeLessonIds, searchQuery]);

  const toggleSelection = (lessonId: string) => {
    setSelectedIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    await onCreateLesson(title, courseId, photo || undefined);
    handleClose();
  };

  const handleSelect = async () => {
    if (selectedIds.length === 0) return;
    await onSelectLessons(selectedIds);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setPhoto("");
    setSelectedIds([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  const getLessonItemCount = (lesson: Lesson | LessonWithItems): number => {
    if ("lessonItems" in lesson) {
      return lesson.lessonItems?.length || 0;
    }
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Lesson" : "Add Existing Lessons"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new lesson"
              : "Select lessons from your library"}
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
              <Label htmlFor="lesson-title">Title *</Label>
              <Input
                id="lesson-title"
                placeholder="e.g., Introduction to HTML"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-photo">Photo URL (optional)</Label>
              <Input
                id="lesson-photo"
                placeholder="https://example.com/image.jpg"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {filteredLessons.length > 0 ? (
                  filteredLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedIds.includes(lesson.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleSelection(lesson.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(lesson.id)}
                        onCheckedChange={() => toggleSelection(lesson.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getLessonItemCount(lesson)} items
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-2">No lessons available</p>
                    <p className="text-xs">
                      Create standalone lessons first or switch to &quot;Create New&quot;
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
            {selectedIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedIds.length} lesson(s) selected
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {mode === "create" ? (
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Lesson
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
