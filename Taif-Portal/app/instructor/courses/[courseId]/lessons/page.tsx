"use client";

import { useEffect, useState } from "react";
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
import { useInstructor } from "@/contexts/InstructorContext";
import { 
  InstructorLesson, 
  InstructorLessonItem, 
  LessonItemType,
  VideoContent,
  RichContent,
  QuestionWithAnswers,
} from "@/types/instructor";
import { cn } from "@/lib/utils";
import { PuzzleLoader } from "@/components/PuzzleLoader";

export default function LessonsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const selectedLessonId = searchParams.get("lessonId");

  const {
    currentCourse,
    loadCourse,
    updateLesson,
    deleteLesson,
    createLessonItem,
    deleteLessonItem,
    reorderLessonItems,
    videos,
    richContents,
    questions,
    loadVideos,
    loadRichContents,
    loadQuestions,
    isLoading,
  } = useInstructor();

  const [selectedLesson, setSelectedLesson] = useState<InstructorLesson | null>(null);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [lessonEditForm, setLessonEditForm] = useState({ title: "", description: "" });
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<LessonItemType | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  useEffect(() => {
    loadCourse(courseId);
    loadVideos();
    loadRichContents();
    loadQuestions();
  }, [courseId, loadCourse, loadVideos, loadRichContents, loadQuestions]);

  useEffect(() => {
    if (currentCourse && selectedLessonId) {
      const lesson = currentCourse.lessons.find((l) => l.id === selectedLessonId);
      setSelectedLesson(lesson || null);
      if (lesson) {
        setLessonEditForm({ title: lesson.title, description: lesson.description || "" });
      }
    }
  }, [currentCourse, selectedLessonId]);

  if (isLoading || !currentCourse) {
    return (
      <InstructorLayout>
        <PuzzleLoader />
      </InstructorLayout>
    );
  }

  const handleSaveLesson = async () => {
    if (!selectedLesson) return;
    await updateLesson(courseId, selectedLesson.id, lessonEditForm);
    setIsEditingLesson(false);
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;
    await deleteLesson(courseId, selectedLesson.id);
    router.push(`/instructor/courses/${courseId}`);
  };

  const handleSelectContent = async (contentId: string) => {
    if (!selectedLesson || !selectedItemType) return;
    
    let title = "New Item";
    
    if (selectedItemType === "video") {
      const video = videos.find(v => v.id === contentId);
      title = video?.title || "Video";
    } else if (selectedItemType === "rich-content") {
      const content = richContents.find(r => r.id === contentId);
      title = content?.title || "Content";
    } else if (selectedItemType === "question") {
      const question = questions.find(q => q.id === contentId);
      title = question?.text?.slice(0, 50) || "Question";
    }

    await createLessonItem(courseId, selectedLesson.id, {
      title,
      type: selectedItemType,
      lessonId: selectedLesson.id,
      videoContentId: selectedItemType === "video" ? contentId : undefined,
      richContentId: selectedItemType === "rich-content" ? contentId : undefined,
      questionId: selectedItemType === "question" ? contentId : undefined,
    });
    
    setAddItemDialogOpen(false);
    setSelectedItemType(null);
  };

  const handleDeleteItem = async () => {
    if (!selectedLesson || !deleteItemId) return;
    await deleteLessonItem(courseId, selectedLesson.id, deleteItemId);
    setDeleteItemId(null);
  };

  const handleReorderItems = (newItems: InstructorLessonItem[]) => {
    if (!selectedLesson) return;
    reorderLessonItems(courseId, selectedLesson.id, newItems.map(i => i.id));
  };

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

  const getContentInfo = (item: InstructorLessonItem) => {
    if (item.type === "video") {
      const video = (videos || []).find(v => v.id === item.videoContentId);
      return video ? `${video.title} (${video.duration ? Math.floor(video.duration / 60) + "min" : "—"})` : "Video not found";
    }
    if (item.type === "rich-content") {
      const content = (richContents || []).find(r => r.id === item.richContentId);
      return content?.title || "Content not found";
    }
    if (item.type === "question") {
      const question = (questions || []).find(q => q.id === item.questionId);
      return question?.text?.slice(0, 60) + (question && question.text.length > 60 ? "..." : "") || "Question not found";
    }
    return "";
  };

  const sortedLessons = [...currentCourse.lessons].sort((a, b) => a.order - b.order);

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
                                  <p className="font-medium truncate">{item.title}</p>
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
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Select {selectedItemType === "video" ? "Video" : selectedItemType === "rich-content" ? "Rich Content" : "Question"}
            </DialogTitle>
            <DialogDescription>
              Choose content from your library to add to this lesson
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-2 pr-4">
              {selectedItemType === "video" && videos.map((video) => (
                <Card
                  key={video.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectContent(video.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <Video className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {video.duration ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, "0")}` : "No duration"}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
              {selectedItemType === "rich-content" && richContents.map((content) => (
                <Card
                  key={content.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectContent(content.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-secondary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{content.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {content.description || "No description"}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
              {selectedItemType === "question" && questions.map((question) => (
                <Card
                  key={question.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectContent(question.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-warning" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{question.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {question.type} • {question.answers.length} answers
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
              {((selectedItemType === "video" && videos.length === 0) ||
                (selectedItemType === "rich-content" && richContents.length === 0) ||
                (selectedItemType === "question" && questions.length === 0)) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No content available</p>
                  <Button variant="outline" asChild>
                    <Link href={`/instructor/${selectedItemType === "video" ? "videos" : selectedItemType === "rich-content" ? "rich-content" : "questions"}`}>
                      Create {selectedItemType === "video" ? "Video" : selectedItemType === "rich-content" ? "Content" : "Question"}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
              Cancel
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
