"use client";

import { useState, useEffect, useMemo } from "react";
import { BookOpen, Search, Plus, Edit, Trash2, Calendar, Layers, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Lesson, Instructor } from "@/models/lesson.model";
import { LessonItem } from "@/models/lesson-item.model";
import { lessonService } from "@/services/lesson.service";
import { lessonItemService } from "@/services/lesson-item.service";
import { instructorService } from "@/services/instructor.service";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Sortable Item Component for drag-and-drop
interface SortableItemProps {
  id: string;
  item: any;
  itemName: string;
  onRemove: (lessonItemId: string) => void;
}

function SortableItem({ id, item, itemName, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-background border-b last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div>
          <p className="font-medium">{itemName}</p>
          <p className="text-xs text-muted-foreground">Order: {item.order}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onRemove(item.lessonItemId)}>
        <X className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonItems, setLessonItems] = useState<LessonItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningLesson, setAssigningLesson] = useState<Lesson | null>(null);
  const [assignedItems, setAssignedItems] = useState<any[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photo: "",
    instructorId: "",
  });
  const [instructorOpen, setInstructorOpen] = useState(false);
  const [lessonItemOpen, setLessonItemOpen] = useState(false);
  const [selectedLessonItemId, setSelectedLessonItemId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadLessons();
    loadLessonItems();
    loadInstructors();
  }, []);

  const loadLessons = async () => {
    setIsLoading(true);
    try {
      const data = await lessonService.getAllLessons();
      setLessons(data);
    } catch (error) {
      console.error("Failed to load lessons:", error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLessonItems = async () => {
    try {
      const data = await lessonItemService.getAllLessonItems();
      setLessonItems(data);
    } catch (error) {
      console.error("Failed to load lesson items:", error);
    }
  };

  const loadInstructors = async () => {
    try {
      const data = await instructorService.getAll();
      setInstructors(data);
    } catch (error) {
      console.error("Failed to load instructors:", error);
    }
  };

  const filteredLessons = useMemo(() => {
    if (!searchQuery) return lessons;
    const query = searchQuery.toLowerCase();
    return lessons.filter(lesson => lesson.title.toLowerCase().includes(query));
  }, [lessons, searchQuery]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      photo: "",
      instructorId: "",
    });
  };

  const getInstructorName = (instructorId?: string) => {
    if (!instructorId) return "No instructor";
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : "Unknown";
  };

  const handleCreate = async () => {
    if (!formData.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await lessonService.createLesson({
        title: formData.title,
        description: formData.description || undefined,
        photo: formData.photo || undefined,
        instructorId: formData.instructorId || undefined,
      });
      toast({ title: "Success", description: "Lesson created successfully" });
      setCreateDialogOpen(false);
      resetForm();
      loadLessons();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create lesson", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingLesson || !formData.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await lessonService.updateLesson(editingLesson.id, {
        title: formData.title,
        description: formData.description || undefined,
        photo: formData.photo || undefined,
        instructorId: formData.instructorId || undefined,
      });
      toast({ title: "Success", description: "Lesson updated successfully" });
      setEditDialogOpen(false);
      setEditingLesson(null);
      resetForm();
      loadLessons();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lesson", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await lessonService.deleteLesson(deleteId);
      toast({ title: "Success", description: "Lesson deleted successfully" });
      setDeleteId(null);
      loadLessons();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete lesson", variant: "destructive" });
    }
  };

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      photo: lesson.photo || "",
      instructorId: lesson.instructorId || "",
    });
    setEditDialogOpen(true);
  };

  const openAssignDialog = async (lesson: Lesson) => {
    setAssigningLesson(lesson);
    try {
      const items = await lessonService.getLessonItems(lesson.id);
      setAssignedItems(items);
    } catch (error) {
      setAssignedItems([]);
    }
    setAssignDialogOpen(true);
  };

  const handleAssignItem = async () => {
    if (!assigningLesson || !selectedLessonItemId) return;
    try {
      await lessonService.assignLessonItem(assigningLesson.id, selectedLessonItemId);
      toast({ title: "Success", description: "Lesson item assigned successfully" });
      const items = await lessonService.getLessonItems(assigningLesson.id);
      setAssignedItems(items);
      setSelectedLessonItemId("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign lesson item", variant: "destructive" });
    }
  };

  const handleUnassignItem = async (lessonItemId: string) => {
    if (!assigningLesson) return;
    try {
      await lessonService.unassignLessonItem(assigningLesson.id, lessonItemId);
      toast({ title: "Success", description: "Lesson item removed" });
      const items = await lessonService.getLessonItems(assigningLesson.id);
      setAssignedItems(items);
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove lesson item", variant: "destructive" });
    }
  };

  const getAvailableLessonItems = () => {
    const assignedIds = assignedItems.map(a => a.lessonItemId);
    return lessonItems.filter(item => !assignedIds.includes(item.id));
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !assigningLesson) return;

    const oldIndex = assignedItems.findIndex(item => item.id === active.id);
    const newIndex = assignedItems.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(assignedItems, oldIndex, newIndex);
      // Update local state immediately for smooth UX
      setAssignedItems(newItems.map((item, idx) => ({ ...item, order: idx + 1 })));

      // Update order on backend
      try {
        const movedItem = assignedItems[oldIndex];
        await lessonService.updateLessonItemOrder(assigningLesson.id, movedItem.lessonItemId, newIndex + 1);
      } catch (error) {
        // Revert on error
        const items = await lessonService.getLessonItems(assigningLesson.id);
        setAssignedItems(items);
        toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Lessons" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Lessons</h1>
            <p className="text-muted-foreground">
              Manage lessons ({filteredLessons.length} lessons)
            </p>
          </div>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredLessons.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Lessons Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery ? "No lessons match your search." : "Create your first lesson to get started."}
              </p>
              <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground">{lesson.description || "No description"}</p>
                        {lesson.instructor && (
                          <p className="text-xs text-muted-foreground mt-1">Instructor: {lesson.instructor.firstName} {lesson.instructor.lastName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openAssignDialog(lesson)}>
                        <Layers className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(lesson)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(lesson.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Lesson</DialogTitle>
            <DialogDescription>Add a new lesson.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter lesson title"
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
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Instructor</Label>
              <Popover open={instructorOpen} onOpenChange={setInstructorOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {formData.instructorId ? getInstructorName(formData.instructorId) : "Select instructor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search instructors..." />
                    <CommandList>
                      <CommandEmpty>No instructors found.</CommandEmpty>
                      <CommandGroup>
                        {instructors.map((instructor) => (
                          <CommandItem
                            key={instructor.id}
                            value={instructor.id}
                            onSelect={() => {
                              setFormData({ ...formData, instructorId: instructor.id });
                              setInstructorOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.instructorId === instructor.id ? "opacity-100" : "opacity-0")} />
                            {instructor.firstName} {instructor.lastName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>Update lesson details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <Label htmlFor="edit-photo">Photo URL</Label>
              <Input
                id="edit-photo"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Instructor</Label>
              <Popover open={instructorOpen} onOpenChange={setInstructorOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {formData.instructorId ? getInstructorName(formData.instructorId) : "Select instructor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search instructors..." />
                    <CommandList>
                      <CommandEmpty>No instructors found.</CommandEmpty>
                      <CommandGroup>
                        {instructors.map((instructor) => (
                          <CommandItem
                            key={instructor.id}
                            value={instructor.id}
                            onSelect={() => {
                              setFormData({ ...formData, instructorId: instructor.id });
                              setInstructorOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.instructorId === instructor.id ? "opacity-100" : "opacity-0")} />
                            {instructor.firstName} {instructor.lastName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

      {/* Assign Lesson Items Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Lesson Items</DialogTitle>
            <DialogDescription>Assign or remove lesson items for: {assigningLesson?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add new item */}
            <div className="flex gap-2">
              <Popover open={lessonItemOpen} onOpenChange={setLessonItemOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="flex-1 justify-between">
                    {selectedLessonItemId 
                      ? lessonItems.find(i => i.id === selectedLessonItemId)?.name 
                      : "Select lesson item..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search lesson items..." />
                    <CommandList>
                      <CommandEmpty>No items available.</CommandEmpty>
                      <CommandGroup>
                        {getAvailableLessonItems().map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.id}
                            onSelect={() => {
                              setSelectedLessonItemId(item.id);
                              setLessonItemOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedLessonItemId === item.id ? "opacity-100" : "opacity-0")} />
                            {item.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button onClick={handleAssignItem} disabled={!selectedLessonItemId}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Assigned items list with drag-and-drop */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {assignedItems.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No lesson items assigned yet.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={assignedItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {assignedItems.map((item) => {
                      const itemName = item.lessonItemName || lessonItems.find(li => li.id === item.lessonItemId)?.name || "Unknown item";
                      return (
                        <SortableItem
                          key={item.id}
                          id={item.id}
                          item={item}
                          itemName={itemName}
                          onRemove={handleUnassignItem}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
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
