"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  FileText,
  HelpCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Star,
  Users,
  ChevronDown,
  ChevronRight,
  Video,
  X,
  Eye,
} from "lucide-react";
import { useInstructor } from "@/contexts/InstructorContext";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { cn } from "@/lib/utils";
import {
  InstructorLessonItem,
  VideoContent,
  RichContent,
  QuestionWithAnswers,
} from "@/types/instructor";

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const {
    currentCourse,
    loadCourse,
    videos,
    richContents,
    questions,
    loadVideos,
    loadRichContents,
    loadQuestions,
    isLoading,
  } = useInstructor();

  const [selectedItem, setSelectedItem] = useState<InstructorLessonItem | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourse(courseId);
    loadVideos();
    loadRichContents();
    loadQuestions();
  }, [courseId, loadCourse, loadVideos, loadRichContents, loadQuestions]);

  if (isLoading || !currentCourse) {
    return (
      <InstructorLayout>
        <PuzzleLoader />
      </InstructorLayout>
    );
  }

  const sortedLessons = [...currentCourse.lessons].sort((a, b) => a.order - b.order);
  const totalItems = sortedLessons.reduce((sum, l) => sum + l.items.length, 0);
  const completedCount = completedItems.size;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const getItemContent = (item: InstructorLessonItem) => {
    if (item.type === "video") {
      return (videos || []).find((v) => v.id === item.videoContentId);
    }
    if (item.type === "rich-content") {
      return (richContents || []).find((r) => r.id === item.richContentId);
    }
    if (item.type === "question") {
      return (questions || []).find((q) => q.id === item.questionId);
    }
    return null;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "rich-content":
        return <FileText className="h-4 w-4" />;
      case "question":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleItemClick = (item: InstructorLessonItem) => {
    setSelectedItem(item);
    setPreviewDialogOpen(true);
  };

  const markItemComplete = (itemId: string) => {
    setCompletedItems((prev) => new Set([...prev, itemId]));
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderItemPreview = () => {
    if (!selectedItem) return null;
    const content = getItemContent(selectedItem);

    if (selectedItem.type === "video") {
      const video = content as VideoContent | undefined;
      return (
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            {video?.videoUrl ? (
              <video
                controls
                className="w-full h-full rounded-lg"
                src={video.videoUrl}
                poster={video.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center text-white/70">
                <Play className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p>Video URL not configured</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{video?.title || selectedItem.title}</h3>
            {video?.description && (
              <p className="text-muted-foreground mt-1">{video.description}</p>
            )}
            {video?.duration && (
              <p className="text-sm text-muted-foreground mt-2">
                Duration: {formatDuration(video.duration)}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (selectedItem.type === "rich-content") {
      const richContent = content as RichContent | undefined;
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{richContent?.title || selectedItem.title}</h3>
          {richContent?.description && (
            <p className="text-muted-foreground">{richContent.description}</p>
          )}
          <Separator />
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: richContent?.htmlContent || "<p>No content</p>" }}
          />
        </div>
      );
    }

    if (selectedItem.type === "question") {
      const question = content as QuestionWithAnswers | undefined;
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">{question?.text || "Question"}</h3>
            {question?.description && (
              <p className="text-muted-foreground mt-1">{question.description}</p>
            )}
          </div>
          <div className="space-y-2">
            {question?.answers.map((answer, index) => (
              <button
                key={answer.id}
                className={cn(
                  "w-full p-3 text-left rounded-lg border transition-colors",
                  "hover:border-primary hover:bg-primary/5"
                )}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {answer.text}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            (In student view, correct answers would be validated after submission)
          </p>
        </div>
      );
    }

    return <p>Unknown content type</p>;
  };

  return (
    <InstructorLayout
      breadcrumbs={[
        { label: "Courses", href: "/instructor/courses" },
        { label: currentCourse.title, href: `/instructor/courses/${courseId}` },
        { label: "Preview" },
      ]}
    >
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Course Content */}
        <div className="w-80 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Eye className="h-3 w-3 mr-1" />
                Preview Mode
              </Badge>
            </div>
            <h2 className="font-semibold truncate">{currentCourse.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {sortedLessons.length} lessons • {totalItems} items
            </p>
          </div>

          {/* Progress */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} of {totalItems} items completed
            </p>
          </div>

          {/* Lessons List */}
          <ScrollArea className="flex-1">
            <Accordion type="multiple" className="p-2">
              {sortedLessons.map((lesson, lessonIndex) => (
                <AccordionItem key={lesson.id} value={lesson.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline hover:bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-xs font-medium text-muted-foreground w-5">
                        {lessonIndex + 1}
                      </span>
                      <span className="font-medium text-sm truncate">{lesson.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-1 ml-7">
                      {lesson.items
                        .sort((a, b) => a.order - b.order)
                        .map((item) => {
                          const isCompleted = completedItems.has(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              className={cn(
                                "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors",
                                selectedItem?.id === item.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted",
                                isCompleted && "text-muted-foreground"
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <span className="flex-shrink-0">{getItemIcon(item.type)}</span>
                              )}
                              <span className="truncate">{item.title}</span>
                            </button>
                          );
                        })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>

          {/* Back Button */}
          <div className="p-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/instructor/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit Preview
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {selectedItem ? (
            <div className="p-6 max-w-4xl mx-auto">
              {/* Item Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {getItemIcon(selectedItem.type)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{selectedItem.title}</h1>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedItem.type.replace("-", " ")}
                    </p>
                  </div>
                </div>
                {!completedItems.has(selectedItem.id) && (
                  <Button onClick={() => markItemComplete(selectedItem.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
                {completedItems.has(selectedItem.id) && (
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>

              <Separator className="mb-6" />

              {/* Item Content */}
              <Card>
                <CardContent className="p-6">{renderItemPreview()}</CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to the Course</h2>
                <p className="text-muted-foreground mb-6">
                  This is how your students will experience the course. Select a lesson item from
                  the sidebar to preview its content.
                </p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{sortedLessons.length}</p>
                        <p className="text-sm text-muted-foreground">Lessons</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Clock className="h-8 w-8 text-secondary" />
                      <div>
                        <p className="text-2xl font-bold">{totalItems}</p>
                        <p className="text-sm text-muted-foreground">Items</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </InstructorLayout>
  );
}
