"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Star,
  Edit,
  Trash2,
  Plus,
  Save,
  CheckCircle,
  Clock,
  Archive,
  MoreVertical,
  GripVertical,
  ChevronRight,
  FileText,
  Video,
  HelpCircle,
  MessageSquare,
  Settings,
  Eye,
  Check,
  Library,
} from "lucide-react";
import { Reorder } from "framer-motion";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { courseService } from "@/services/course.service";
import { lessonService } from "@/services/lesson.service";
import { lessonItemService } from "@/services/lesson-item.service";
import { categoryService } from "@/services/category.service";
import { tagService, Tag } from "@/services/tag.service";
import { Course } from "@/models/course.model";
import { Lesson } from "@/models/lesson.model";
import { LessonItem } from "@/models/lesson-item.model";
import { Category } from "@/models/category.model";
import { cn } from "@/lib/utils";
import { PuzzleLoader } from "@/components/PuzzleLoader";

type CourseStatus = 'draft' | 'published' | 'archived';

interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: LessonItem[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseStatus, setCourseStatus] = useState<CourseStatus>('draft');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    tags: [] as string[],
  });
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonDialogMode, setLessonDialogMode] = useState<"create" | "select">("create");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDescription, setNewLessonDescription] = useState("");
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [reorderedLessons, setReorderedLessons] = useState<CourseLesson[]>([]);

  const loadCourseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [course, rawLessons, cats, tags] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getLessonsByCourse(courseId),
        categoryService.getCategories(),
        tagService.getAllTags(),
      ]);
      
      setCurrentCourse(course);
      setCategories(cats);
      setAllTags(tags);
      
      // Load lesson items for each lesson
      const lessonsWithItems: CourseLesson[] = await Promise.all(
        rawLessons.map(async (lesson) => {
          const items = await lessonItemService.getItemsByLesson(lesson.id);
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            order: lesson.order || 0,
            items,
          };
        })
      );
      
      setCourseLessons(lessonsWithItems);
      setReorderedLessons([...lessonsWithItems].sort((a, b) => a.order - b.order));
      setEditForm({
        title: course.title,
        description: course.description || '',
        categoryId: course.categoryId,
        tags: course.tags || [],
      });
      setSelectedTagIds(course.tags || []);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Get available lessons - empty for now since we don't have standalone lessons concept
  const availableLessons: CourseLesson[] = [];

  if (isLoading || !currentCourse) {
    return (
      <InstructorLayout>
        <PuzzleLoader />
      </InstructorLayout>
    );
  }

  const handleSaveEdit = async () => {
    try {
      await courseService.updateCourse(courseId, {
        name: editForm.title,
        description: editForm.description,
        tags: editForm.tags,
      });
      await loadCourseData();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleSaveTags = async () => {
    try {
      await courseService.updateCourse(courseId, {
        tags: selectedTagIds,
      });
      await loadCourseData();
      setTagsDialogOpen(false);
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getTagNames = (tagIds: string[]) => {
    return tagIds
      .map(id => allTags.find(t => t.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const handleDelete = async () => {
    try {
      await courseService.deleteCourse(courseId);
      router.push("/instructor/courses");
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handlePublish = async () => {
    // TODO: Backend doesn't support status yet
    setCourseStatus('published');
  };

  const handleArchive = async () => {
    // TODO: Backend doesn't support status yet
    setCourseStatus('archived');
  };

  const handleUnpublish = async () => {
    // TODO: Backend doesn't support status yet
    setCourseStatus('draft');
  };

  const handleCreateLesson = async () => {
    if (!newLessonTitle.trim()) return;
    
    try {
      await lessonService.createLesson({
        title: newLessonTitle,
        url: newLessonTitle.toLowerCase().replace(/\s+/g, '-'),
        courseId,
      });
      
      setNewLessonTitle("");
      setNewLessonDescription("");
      setLessonDialogOpen(false);
      await loadCourseData();
    } catch (error) {
      console.error('Failed to create lesson:', error);
    }
  };

  const handleAddExistingLessons = async () => {
    // Not supported by backend - lessons are tied to courses on creation
    setSelectedLessonIds([]);
    setLessonDialogOpen(false);
  };

  const handleReorderLessons = async (newOrder: CourseLesson[]) => {
    setReorderedLessons(newOrder);
    // TODO: Backend doesn't support reordering yet
  };

  const handleRemoveLessonFromCourse = async (lessonId: string) => {
    try {
      await lessonService.deleteLesson(lessonId);
      await loadCourseData();
    } catch (error) {
      console.error('Failed to remove lesson:', error);
    }
  };

  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessonIds(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleDeleteLesson = async () => {
    if (deleteLessonId) {
      try {
        await lessonService.deleteLesson(deleteLessonId);
        setDeleteLessonId(null);
        await loadCourseData();
      } catch (error) {
        console.error('Failed to delete lesson:', error);
      }
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-primary" />;
      case "rich-content":
        return <FileText className="h-4 w-4 text-secondary" />;
      case "question":
        return <HelpCircle className="h-4 w-4 text-warning" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: CourseStatus) => {
    const variants: Record<CourseStatus, "default" | "secondary" | "outline"> = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    };
    const icons: Record<CourseStatus, React.ReactNode> = {
      published: <CheckCircle className="h-3 w-3" />,
      draft: <Clock className="h-3 w-3" />,
      archived: <Archive className="h-3 w-3" />,
    };
    return (
      <Badge variant={variants[status]} className="gap-1">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  return (
    <InstructorLayout
      breadcrumbs={[
        { label: "Courses", href: "/instructor/courses" },
        { label: currentCourse.title },
      ]}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/instructor/courses")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentCourse.title}</h1>
                {getStatusBadge(courseStatus)}
              </div>
              <p className="text-muted-foreground mt-1">
                {currentCourse.categoryName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-12 sm:ml-0">
            <Button variant="outline" asChild>
              <Link href={`/instructor/courses/${courseId}/preview`}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
            {courseStatus === "draft" && (
              <Button onClick={handlePublish}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            {courseStatus === "published" && (
              <Button variant="outline" onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/instructor/courses/${courseId}/reviews`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Reviews
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {courseStatus === "published" && (
                  <DropdownMenuItem onClick={handleUnpublish}>
                    <Clock className="mr-2 h-4 w-4" />
                    Unpublish (Back to Draft)
                  </DropdownMenuItem>
                )}
                {courseStatus === "archived" && (
                  <DropdownMenuItem onClick={handleUnpublish}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Restore to Draft
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentCourse.totalEnrolled || 0}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(currentCourse.rating || 0).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{currentCourse.reviewCount || 0} reviews</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courseLessons.length}</p>
                <p className="text-xs text-muted-foreground">Lessons</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courseLessons.reduce((sum, l) => sum + l.items.length, 0)}</p>
                <p className="text-xs text-muted-foreground">Items</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lessons" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Course Lessons</h2>
                <p className="text-sm text-muted-foreground">
                  Drag to reorder lessons
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLessonDialogMode("select");
                    setLessonDialogOpen(true);
                  }}
                >
                  <Library className="mr-2 h-4 w-4" />
                  Add Existing
                </Button>
                <Button
                  onClick={() => {
                    setLessonDialogMode("create");
                    setLessonDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              </div>
            </div>

            {reorderedLessons.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={reorderedLessons}
                onReorder={handleReorderLessons}
                className="space-y-3"
              >
                {reorderedLessons.map((lesson, index) => (
                  <Reorder.Item key={lesson.id} value={lesson}>
                    <Card className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <GripVertical className="h-5 w-5" />
                            <span className="text-sm font-medium w-6">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <Link
                                href={`/instructor/courses/${courseId}/lessons?lessonId=${lesson.id}`}
                                className="font-medium hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {lesson.title}
                              </Link>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {lesson.items.length} items
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/instructor/courses/${courseId}/lessons?lessonId=${lesson.id}`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Lesson
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleRemoveLessonFromCourse(lesson.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove from Course
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => setDeleteLessonId(lesson.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Permanently
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {lesson.description}
                              </p>
                            )}
                            {lesson.items.length > 0 && (
                              <div className="flex items-center gap-3 mt-2">
                                {lesson.items.slice(0, 5).map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-1 text-xs text-muted-foreground"
                                  >
                                    {getItemTypeIcon(item.type)}
                                    <span className="truncate max-w-24">{item.name}</span>
                                  </div>
                                ))}
                                {lesson.items.length > 5 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{lesson.items.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No lessons yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first lesson to start building your course content
                  </p>
                  <Button onClick={() => setLessonDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Basic information about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-medium">{currentCourse.title}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{currentCourse.description}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{currentCourse.categoryName}</p>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-muted-foreground">Tags</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedTagIds(currentCourse.tags || []);
                        setTagsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentCourse.tags && currentCourse.tags.length > 0 ? (
                      getTagNames(currentCourse.tags).map((tagName, idx) => (
                        <Badge key={idx} variant="secondary">{tagName}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags assigned</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="text-sm">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Manage course visibility and options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Course Status</p>
                    <p className="text-sm text-muted-foreground">
                      Current status: {courseStatus}
                    </p>
                  </div>
                  {getStatusBadge(courseStatus)}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Course</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this course and all its content
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course Details</DialogTitle>
            <DialogDescription>
              Update your course information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editForm.categoryId}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setNewLessonTitle("");
          setNewLessonDescription("");
          setSelectedLessonIds([]);
        }
        setLessonDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {lessonDialogMode === "create" ? "Create New Lesson" : "Add Existing Lessons"}
            </DialogTitle>
            <DialogDescription>
              {lessonDialogMode === "create"
                ? "Create a new lesson for this course"
                : "Select from your lesson library to add to this course"}
            </DialogDescription>
          </DialogHeader>

          {/* Mode Toggle */}
          <div className="flex gap-2 border-b pb-4">
            <Button
              variant={lessonDialogMode === "create" ? "default" : "outline"}
              size="sm"
              onClick={() => setLessonDialogMode("create")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
            <Button
              variant={lessonDialogMode === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setLessonDialogMode("select")}
            >
              <Library className="mr-2 h-4 w-4" />
              Select Existing
            </Button>
          </div>

          {lessonDialogMode === "create" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title *</Label>
                <Input
                  id="lesson-title"
                  placeholder="e.g., Introduction to HTML"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-description">Description (Optional)</Label>
                <Textarea
                  id="lesson-description"
                  placeholder="Brief description of what this lesson covers..."
                  value={newLessonDescription}
                  onChange={(e) => setNewLessonDescription(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="h-72">
                <div className="space-y-2 pr-4">
                  {availableLessons.length > 0 ? (
                    availableLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedLessonIds.includes(lesson.id)
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => toggleLessonSelection(lesson.id)}
                      >
                        <Checkbox
                          checked={selectedLessonIds.includes(lesson.id)}
                          onCheckedChange={() => toggleLessonSelection(lesson.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{lesson.title}</p>
                          {lesson.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {lesson.items.length} items
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-2">No lessons available</p>
                      <p className="text-xs">Create standalone lessons first or switch to &quot;Create New&quot;</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              {selectedLessonIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedLessonIds.length} lesson(s) selected
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            {lessonDialogMode === "create" ? (
              <Button onClick={handleCreateLesson} disabled={!newLessonTitle.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Lesson
              </Button>
            ) : (
              <Button onClick={handleAddExistingLessons} disabled={selectedLessonIds.length === 0}>
                <Check className="mr-2 h-4 w-4" />
                Add {selectedLessonIds.length > 0 ? `(${selectedLessonIds.length})` : ""}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Dialog */}
      <Dialog open={tagsDialogOpen} onOpenChange={setTagsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course Tags</DialogTitle>
            <DialogDescription>
              Select tags that describe your course content
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {allTags.length > 0 ? (
                  allTags.map((tag) => (
                    <div
                      key={tag.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedTagIds.includes(tag.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleTagSelection(tag.id)}
                    >
                      <Checkbox
                        checked={selectedTagIds.includes(tag.id)}
                        onCheckedChange={() => toggleTagSelection(tag.id)}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tags available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            {selectedTagIds.length > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                {selectedTagIds.length} tag(s) selected
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTags}>
              <Check className="mr-2 h-4 w-4" />
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{currentCourse.title}&quot;? This action cannot be undone.
              All lessons and content will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Dialog */}
      <AlertDialog open={!!deleteLessonId} onOpenChange={() => setDeleteLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? All items within this lesson will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
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
