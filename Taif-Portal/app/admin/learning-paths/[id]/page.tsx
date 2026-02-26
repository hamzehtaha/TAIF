"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Route,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  Check,
  X,
  Search,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { learningPathService } from "@/services/learning-path.service";
import { courseService } from "@/services/course.service";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  name: string;
  description?: string;
  order: number;
  courses: SectionCourse[];
}

interface SectionCourse {
  id: string;
  courseId: string;
  order: number;
  isRequired: boolean;
  courseName?: string;
  courseDescription?: string;
  coursePhoto?: string;
  course?: {
    id: string;
    name?: string;
    title?: string;
    description?: string;
    photo?: string;
  };
}

interface CourseItem {
  id: string;
  name: string;
  description?: string;
  photo?: string;
}

export default function LearningPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const learningPathId = params.id as string;

  const [learningPath, setLearningPath] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Section dialog
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({ name: "", description: "" });

  // Course dialog
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  // Delete dialogs
  const [deleteType, setDeleteType] = useState<"section" | "course">("section");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use details API which already includes sections with courses
      const [pathData, coursesData] = await Promise.all([
        learningPathService.getDetails(learningPathId),
        courseService.getCourses(),
      ]);
      
      setLearningPath(pathData);
      setAllCourses(coursesData);

      // Sections with courses are already included in the details response
      const sectionsWithCourses = (pathData.sections || []).sort(
        (a: any, b: any) => a.order - b.order
      );
      setSections(sectionsWithCourses);
      
      // Expand all sections by default
      setExpandedSections(new Set(sectionsWithCourses.map((s: any) => s.id)));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [learningPathId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Section handlers
  const handleOpenSectionDialog = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({ name: section.name, description: section.description || "" });
    } else {
      setEditingSection(null);
      setSectionForm({ name: "", description: "" });
    }
    setSectionDialogOpen(true);
  };

  const handleSaveSection = async () => {
    if (!sectionForm.name.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingSection) {
        await learningPathService.updateSection(editingSection.id, sectionForm);
      } else {
        await learningPathService.createSection(learningPathId, {
          ...sectionForm,
          order: sections.length + 1,
        });
      }
      await loadData();
      setSectionDialogOpen(false);
    } catch (error) {
      console.error("Failed to save section:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Course handlers
  const handleOpenCourseDialog = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setCourseSearch("");
    
    // Get already added course IDs for this section
    const section = sections.find((s) => s.id === sectionId);
    const existingCourseIds = new Set(section?.courses.map((c) => c.courseId) || []);
    setSelectedCourses(existingCourseIds);
    
    setCourseDialogOpen(true);
  };

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const handleSaveCourses = async () => {
    if (!selectedSectionId) return;
    setIsSubmitting(true);
    try {
      const section = sections.find((s) => s.id === selectedSectionId);
      const existingCourseIds = new Set(section?.courses.map((c) => c.courseId) || []);

      // Add new courses
      const toAdd = [...selectedCourses].filter((id) => !existingCourseIds.has(id));
      for (let i = 0; i < toAdd.length; i++) {
        await learningPathService.addCourseToSection(selectedSectionId, {
          courseId: toAdd[i],
          order: (section?.courses.length || 0) + i + 1,
          isRequired: true,
        });
      }

      // Remove courses
      const toRemove = section?.courses.filter((c) => !selectedCourses.has(c.courseId)) || [];
      for (const course of toRemove) {
        await learningPathService.removeCourseFromSection(course.id);
      }

      await loadData();
      setCourseDialogOpen(false);
    } catch (error) {
      console.error("Failed to save courses:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleConfirmDelete = (type: "section" | "course", id: string) => {
    setDeleteType(type);
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      if (deleteType === "section") {
        await learningPathService.deleteSection(deletingId);
      } else {
        await learningPathService.removeCourseFromSection(deletingId);
      }
      await loadData();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = allCourses.filter((course) =>
    (course.title || course.name || "").toLowerCase().includes(courseSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <PuzzleLoader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Learning Paths", href: "/admin/learning-paths" },
        { label: learningPath?.name || "Details" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Route className="h-6 w-6 text-primary" />
                {learningPath?.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage sections and courses for this learning path
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenSectionDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sections.length}</p>
                <p className="text-sm text-muted-foreground">Sections</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sections.reduce((sum, s) => sum + s.courses.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sections.reduce(
                    (sum, s) => sum + s.courses.filter((c) => c.isRequired).length,
                    0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Required Courses</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <Card key={section.id}>
              <Collapsible
                open={expandedSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="p-2 rounded-lg bg-muted">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <div>
                          <CardTitle className="text-lg">
                            Section {sectionIndex + 1}: {section.name}
                          </CardTitle>
                          {section.description && (
                            <CardDescription>{section.description}</CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {section.courses.length} courses
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCourseDialog(section.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Courses
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenSectionDialog(section)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleConfirmDelete("section", section.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {section.courses.length > 0 ? (
                      <div className="space-y-2 pl-12">
                        {section.courses
                          .sort((a, b) => a.order - b.order)
                          .map((course, courseIndex) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground w-6">
                                  {courseIndex + 1}.
                                </span>
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">
                                  {course.courseName || course.course?.name || course.course?.title || "Unknown Course"}
                                </span>
                                {course.isRequired && (
                                  <Badge variant="outline" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleConfirmDelete("course", course.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground pl-12">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No courses in this section</p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleOpenCourseDialog(section.id)}
                        >
                          Add courses
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}

          {sections.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No sections yet</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Create sections to organize courses in this learning path
                </p>
                <Button className="mt-4" onClick={() => handleOpenSectionDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Section
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Edit Section" : "Create Section"}
            </DialogTitle>
            <DialogDescription>
              {editingSection
                ? "Update the section details"
                : "Add a new section to organize courses"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-name">Name *</Label>
              <Input
                id="section-name"
                placeholder="e.g., Getting Started"
                value={sectionForm.name}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-description">Description</Label>
              <Textarea
                id="section-description"
                placeholder="Describe what this section covers..."
                value={sectionForm.description}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSection}
              disabled={!sectionForm.name.trim() || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSection ? "Save Changes" : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Selection Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Courses</DialogTitle>
            <DialogDescription>
              Choose courses to include in this section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-2">
                {filteredCourses.map((course) => {
                  const isSelected = selectedCourses.has(course.id);
                  return (
                    <div
                      key={course.id}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => handleToggleCourse(course.id)}
                    >
                      <Checkbox checked={isSelected} />
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">{course.title || course.name}</p>
                        {course.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredCourses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No courses found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{selectedCourses.size} courses selected</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourses} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteType === "section" ? "Section" : "Course"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "section"
                ? "This will delete the section and remove all courses from it."
                : "This will remove the course from this section."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
