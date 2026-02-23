"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  BookOpen,
  LayoutGrid,
  List,
  SortAsc,
} from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCourseStore, useCategoryStore } from "@/stores/instructor";
import { tagService, Tag } from "@/services/tag.service";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { Course } from "@/models/course.model";
import { CreateCourseRequest, UpdateCourseRequest } from "@/dtos/course.dto";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "title";

export default function CoursesPage() {
  // Zustand stores
  const {
    courses,
    isLoading,
    loadMyCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useCourseStore();
  const { categories, loadCategories } = useCategoryStore();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Dialog State
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Course form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPhoto, setFormPhoto] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadMyCourses();
    loadCategories();
    loadTags();
  }, [loadMyCourses, loadCategories]);

  const loadTags = async () => {
    try {
      const tags = await tagService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [courses, searchQuery, sortBy]);

  // Handlers
  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategoryId("");
    setFormPhoto("");
    setFormTags([]);
  };

  const handleOpenCreate = () => {
    setEditingCourse(null);
    resetForm();
    setCourseDialogOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormDescription(course.description || "");
    setFormCategoryId(course.categoryId);
    setFormPhoto(course.thumbnail || "");
    setFormTags(course.tags || []);
    setCourseDialogOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      await deleteCourse(courseToDelete.id);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleCourseSubmit = async () => {
    if (!formTitle.trim() || !formCategoryId) return;
    
    setIsSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          name: formTitle,
          description: formDescription,
          photo: formPhoto,
          tags: formTags,
        });
      } else {
        await createCourse({
          name: formTitle,
          description: formDescription,
          photo: formPhoto,
          categoryId: formCategoryId,
          tags: formTags,
        });
      }
      setCourseDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFormTag = (tagId: string) => {
    setFormTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };


  return (
    <InstructorLayout breadcrumbs={[{ label: "Courses" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Courses</h1>
            <p className="text-muted-foreground">Create and manage your courses</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {searchQuery && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          </div>
        )}

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {courses.reduce((sum, c) => sum + (c.totalEnrolled || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <PuzzleLoader />
          </div>
        )}

        {/* Course List/Grid */}
        {!isLoading && filteredCourses.length > 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-3"
            )}
          >
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/instructor/courses/${course.id}`}>
                  <div className="relative h-40 bg-muted">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/instructor/courses/${course.id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {course.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEdit(course)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(course)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isLoading && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No courses found" : "No courses yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Create your first course to start teaching"}
              </p>
              {!searchQuery && (
                <Button onClick={handleOpenCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Create/Edit Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setCourseDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update your course details" : "Fill in the details to create a new course"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Title *</Label>
              <Input
                id="course-title"
                placeholder="Enter course title..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                placeholder="Describe your course..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-category">Category *</Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-photo">Thumbnail URL</Label>
              <Input
                id="course-photo"
                placeholder="https://example.com/image.jpg"
                value={formPhoto}
                onChange={(e) => setFormPhoto(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <div
                        key={tag.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                          formTags.includes(tag.id)
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        )}
                        onClick={() => toggleFormTag(tag.id)}
                      >
                        <Checkbox
                          checked={formTags.includes(tag.id)}
                          onCheckedChange={() => toggleFormTag(tag.id)}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No tags available
                    </p>
                  )}
                </div>
              </ScrollArea>
              {formTags.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formTags.length} tag(s) selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCourseSubmit}
              disabled={!formTitle.trim() || !formCategoryId || isSubmitting}
            >
              {isSubmitting ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{courseToDelete?.title}&quot;? This action cannot be undone.
              All lessons and content within this course will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </InstructorLayout>
  );
}
