"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  GripVertical,
  Video,
  FileText,
  HelpCircle,
  MoreVertical,
  Edit,
  X,
  Check,
} from "lucide-react";
import { Reorder } from "framer-motion";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Separator } from "@/components/ui/separator";
import { courseService } from "@/services/course.service";
import { lessonService } from "@/services/lesson.service";
import { lessonItemService } from "@/services/lesson-item.service";
import { Course } from "@/models/course.model";
import { Lesson } from "@/models/lesson.model";
import { LessonItem } from "@/models/lesson-item.model";
import { cn } from "@/lib/utils";
import { PuzzleLoader } from "@/components/PuzzleLoader";

type LessonItemType = 'video' | 'text' | 'question' | 'rich-content';

interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: LessonItem[];
}

export default function LessonsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const selectedLessonId = searchParams.get("lessonId");

  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [lessonEditForm, setLessonEditForm] = useState({ title: "", description: "" });
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<LessonItemType | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  // Form states for different item types
  const [itemName, setItemName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [richTextContent, setRichTextContent] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionOptions, setQuestionOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  const loadCourseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [course, rawLessons] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getLessonsByCourse(courseId),
      ]);
      
      setCurrentCourse(course);
      
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
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  useEffect(() => {
    if (courseLessons.length > 0 && selectedLessonId) {
      const lesson = courseLessons.find((l) => l.id === selectedLessonId);
      setSelectedLesson(lesson || null);
      if (lesson) {
        setLessonEditForm({ title: lesson.title, description: lesson.description || "" });
      }
    }
  }, [courseLessons, selectedLessonId]);

  if (isLoading || !currentCourse) {
    return (
      <InstructorLayout>
        <PuzzleLoader />
      </InstructorLayout>
    );
  }

  const handleSaveLesson = async () => {
    if (!selectedLesson) return;
    try {
      await lessonService.updateLesson(selectedLesson.id, {
        title: lessonEditForm.title,
      });
      await loadCourseData();
      setIsEditingLesson(false);
    } catch (error) {
      console.error('Failed to update lesson:', error);
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;
    try {
      await lessonService.deleteLesson(selectedLesson.id);
      router.push(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const resetItemForm = () => {
    setItemName("");
    setVideoUrl("");
    setVideoDuration(0);
    setRichTextContent("");
    setQuestionText("");
    setQuestionOptions(["", "", "", ""]);
    setCorrectOptionIndex(0);
  };

  const handleCreateItem = async () => {
    if (!selectedLesson || !selectedItemType || !itemName.trim()) return;
    
    try {
      const typeMap = { 'video': 0, 'text': 1, 'rich-content': 1, 'question': 2 };
      let content = "";
      let duration = 0;

      if (selectedItemType === "video") {
        content = JSON.stringify({ url: videoUrl });
        duration = videoDuration;
      } else if (selectedItemType === "rich-content" || selectedItemType === "text") {
        content = richTextContent;
      } else if (selectedItemType === "question") {
        content = JSON.stringify({
          question: questionText,
          options: questionOptions.filter(opt => opt.trim()),
          correctIndex: correctOptionIndex,
        });
      }

      await lessonItemService.createLessonItem({
        name: itemName,
        content,
        type: typeMap[selectedItemType],
        lessonId: selectedLesson.id,
        durationInSeconds: duration,
      });
      
      await loadCourseData();
      setAddItemDialogOpen(false);
      setSelectedItemType(null);
      resetItemForm();
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedLesson || !deleteItemId) return;
    try {
      await lessonItemService.deleteLessonItem(deleteItemId);
      await loadCourseData();
      setDeleteItemId(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleReorderItems = (newItems: LessonItem[]) => {
    if (!selectedLesson) return;
    // TODO: Backend doesn't support reordering yet
    console.warn('Reordering not supported by backend yet');
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-primary" />;
      case "text":
      case "rich-content":
        return <FileText className="h-4 w-4 text-secondary" />;
      case "question":
        return <HelpCircle className="h-4 w-4 text-warning" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentInfo = (item: LessonItem) => {
    const content = typeof item.content === 'string' ? item.content : '';
    return content ? content.slice(0, 60) + (content.length > 60 ? '...' : '') : 'No content';
  };

  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);

  return (
    <InstructorLayout
      breadcrumbs={[
        { label: "Courses", href: "/instructor/courses" },
        { label: currentCourse.title, href: `/instructor/courses/${courseId}` },
        { label: "Lessons" },
      ]}
    >
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Lesson Sidebar */}
        <div className="w-72 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Lessons</h2>
            <p className="text-xs text-muted-foreground">
              {currentCourse.lessons.length} lessons
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {sortedLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/instructor/courses/${courseId}/lessons?lessonId=${lesson.id}`}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg mb-1 transition-colors",
                    selectedLessonId === lesson.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="text-xs font-medium w-5">{lesson.order}</span>
                  <span className="flex-1 truncate text-sm">{lesson.title}</span>
                  <Badge
                    variant={selectedLessonId === lesson.id ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {lesson.items.length}
                  </Badge>
                </Link>
              ))}
            </div>
          </ScrollArea>
          <div className="p-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/instructor/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {selectedLesson ? (
            <div className="p-6 space-y-6">
              {/* Lesson Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditingLesson ? (
                    <div className="space-y-3">
                      <Input
                        value={lessonEditForm.title}
                        onChange={(e) =>
                          setLessonEditForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="text-xl font-bold"
                      />
                      <Textarea
                        value={lessonEditForm.description}
                        onChange={(e) =>
                          setLessonEditForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Lesson description..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveLesson}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingLesson(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
                      {selectedLesson.description && (
                        <p className="text-muted-foreground mt-1">
                          {selectedLesson.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {!isEditingLesson && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditingLesson(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Lesson
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={handleDeleteLesson}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Lesson
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <Separator />

              {/* Lesson Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Lesson Items</h2>
                    <p className="text-sm text-muted-foreground">
                      Drag to reorder. Select content from your library.
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedItemType("video"); setAddItemDialogOpen(true); }}>
                        <Video className="mr-2 h-4 w-4 text-primary" />
                        Add Video
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedItemType("rich-content"); setAddItemDialogOpen(true); }}>
                        <FileText className="mr-2 h-4 w-4 text-secondary" />
                        Add Rich Content
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedItemType("question"); setAddItemDialogOpen(true); }}>
                        <HelpCircle className="mr-2 h-4 w-4 text-warning" />
                        Add Question
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {selectedLesson.items.length > 0 ? (
                  <Reorder.Group
                    axis="y"
                    values={selectedLesson.items}
                    onReorder={handleReorderItems}
                    className="space-y-2"
                  >
                    {selectedLesson.items
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <Reorder.Item key={item.id} value={item}>
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                  <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="p-2 rounded-lg bg-muted">
                                  {getItemIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.name}</p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {getContentInfo(item)}
                                  </p>
                                </div>
                                <Badge variant="outline" className="capitalize text-xs">
                                  {item.type.replace("-", " ")}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => setDeleteItemId(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Reorder.Item>
                      ))}
                  </Reorder.Group>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-semibold mb-2">No items yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add content from your library to this lesson
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Select a Lesson</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a lesson from the sidebar to edit its content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Content Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={(open) => {
        if (!open) resetItemForm();
        setAddItemDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add {selectedItemType === "video" ? "Video" : selectedItemType === "rich-content" ? "Rich Content" : "Question"}
            </DialogTitle>
            <DialogDescription>
              {selectedItemType === "video" && "Add a video from YouTube or Vimeo"}
              {selectedItemType === "rich-content" && "Add text or HTML content"}
              {selectedItemType === "question" && "Create a multiple choice question"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Common: Item Name */}
            <div className="space-y-2">
              <Label htmlFor="item-name">Name *</Label>
              <Input
                id="item-name"
                placeholder="Enter item name..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            {/* Video Form */}
            {selectedItemType === "video" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="video-url">Video URL *</Label>
                  <Input
                    id="video-url"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports YouTube and Vimeo URLs
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-duration">Duration (minutes)</Label>
                  <Input
                    id="video-duration"
                    type="number"
                    min="0"
                    placeholder="e.g., 15"
                    value={videoDuration > 0 ? Math.round(videoDuration / 60) : ""}
                    onChange={(e) => setVideoDuration(parseInt(e.target.value || "0") * 60)}
                  />
                </div>
              </>
            )}

            {/* Rich Text Form */}
            {selectedItemType === "rich-content" && (
              <div className="space-y-2">
                <Label htmlFor="rich-content">Content *</Label>
                <Textarea
                  id="rich-content"
                  placeholder="Enter your text content here. HTML is supported..."
                  className="min-h-40"
                  value={richTextContent}
                  onChange={(e) => setRichTextContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You can use HTML formatting for rich text
                </p>
              </div>
            )}

            {/* Question Form */}
            {selectedItemType === "question" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="question-text">Question *</Label>
                  <Textarea
                    id="question-text"
                    placeholder="Enter your question..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {questionOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-option"
                        checked={correctOptionIndex === index}
                        onChange={() => setCorrectOptionIndex(index)}
                        className="h-4 w-4"
                      />
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionOptions];
                          newOptions[index] = e.target.value;
                          setQuestionOptions(newOptions);
                        }}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddItemDialogOpen(false);
              resetItemForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateItem}
              disabled={!itemName.trim() || 
                (selectedItemType === "video" && !videoUrl.trim()) ||
                (selectedItemType === "rich-content" && !richTextContent.trim()) ||
                (selectedItemType === "question" && (!questionText.trim() || questionOptions.filter(o => o.trim()).length < 2))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Create {selectedItemType === "video" ? "Video" : selectedItemType === "rich-content" ? "Rich Content" : "Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this item from the lesson? The content will remain in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </InstructorLayout>
  );
}
