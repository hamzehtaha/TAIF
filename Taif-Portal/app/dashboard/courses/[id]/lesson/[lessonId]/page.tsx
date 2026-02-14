"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/auth.service";
import { lessonService } from "@/services/lesson.service";
import {
  lessonItemService,
  VideoContent,
  QuestionContent,
  RichTextContent as RichTextContentType
} from "@/services/lesson-item.service";
import { lessonItemProgressService } from "@/services/lesson-item-progress.service";
import { enrollmentService } from "@/services/enrollment.service";
import { Enrollment } from "@/models/enrollment.model";
import { VideoPlayer, QuizContent, RichTextContent } from "@/components/lesson";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Video,
  Menu,
  X,
  SkipBack,
  SkipForward,
  FileText,
  HelpCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { LessonItem } from "@/models/lesson-item.model";
import { Lesson } from "@/models/lesson.model";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";



const getItemIcon = (type: string) => {
  switch (type) {
    case "video": return Video;
    case "text": return FileText;
    case "question": return HelpCircle;
    default: return FileText;
  }
};

export default function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonItems, setLessonItems] = useState<LessonItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [allLessonItems, setAllLessonItems] = useState<Record<string, LessonItem[]>>({});
  const [enrollmentProgress, setEnrollmentProgress] = useState<Enrollment | null>(null);
  const markedCompleteRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.id);
      setLessonId(resolvedParams.lessonId);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    const loadLessonData = async () => {
      try {
        setError(null);

        // Load lesson, items with progress, and all lessons for navigation
        const [lessonData, itemsData, courseLessons, enrollment] = await Promise.all([
          lessonService.getLessonById(lessonId),
          lessonItemService.getItemsWithProgress(lessonId).catch(() =>
            lessonItemService.getItemsByLesson(lessonId)
          ),
          lessonService.getLessonsByCourse(courseId).catch(() => []),
          enrollmentService.getEnrollmentDetailsWithProgress(courseId).catch(() => null),
        ]);

        setLesson(lessonData);
        setLessonItems(itemsData);
        setAllLessons(courseLessons);
        setEnrollmentProgress(enrollment);

        // Find current lesson index in all lessons
        const lessonIdx = courseLessons.findIndex(l => l.id === lessonId);
        setCurrentLessonIndex(lessonIdx >= 0 ? lessonIdx : 0);

        // Set current lesson as expanded by default
        setExpandedLessons(new Set([lessonId]));

        // Store current lesson items
        setAllLessonItems(prev => ({ ...prev, [lessonId]: itemsData }));

        // Check for item query param (resume learning or navigation)
        const itemIdFromUrl = searchParams.get("item");
        if (itemIdFromUrl) {
          if (itemIdFromUrl === "last") {
            // Navigate to last item (from previous lesson navigation)
            setCurrentItemIndex(itemsData.length - 1);
            return;
          }
          const itemIndex = itemsData.findIndex(item => item.id === itemIdFromUrl);
          if (itemIndex >= 0) {
            setCurrentItemIndex(itemIndex);
            return;
          }
        }

        // Default: Find first incomplete item or start from beginning
        const firstIncompleteIndex = itemsData.findIndex(item => !item.isCompleted);
        setCurrentItemIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
      } catch (err) {
        console.error("Failed to load lesson:", err);
        setError("Failed to load lesson. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [courseId, lessonId, router, searchParams]);

  const currentItem = lessonItems[currentItemIndex] || null;

  // Auto-mark item as completed when it becomes current (except quiz items)
  useEffect(() => {
    if (!currentItem || !courseId) return;
    lessonItemProgressService.updateLastLessonItem(courseId, currentItem.id);
    if (markedCompleteRef.current.has(currentItem.id)) return;
    // Skip auto-completion for quiz items - they complete on submission
    if (currentItem.type === "question") return;
    if (currentItem.isCompleted) return;
    // Mark as completed immediately when viewing (video/text only)
    markComplete();
  }, [currentItem, currentItemIndex, courseId]);

  // Check if this is the first item of the first lesson (no previous available)
  const isFirstItemOfCourse = currentLessonIndex === 0 && currentItemIndex === 0;

  // Check if this is the last item of the last lesson (no next available)
  const isLastItemOfCourse = currentLessonIndex === allLessons.length - 1 && currentItemIndex === lessonItems.length - 1;

  const markComplete = async () => {
    try {
      markedCompleteRef.current.add(currentItem.id);
      await lessonItemProgressService.setLessonItemAsCompleted(courseId, currentItem.lessonId, currentItem.id);

      // Update local state
      setLessonItems(prev => prev.map((item, idx) =>
        idx === currentItemIndex ? { ...item, isCompleted: true } : item
      ));
    } catch (err) {
      console.error("Failed to mark item complete:", err);
      markedCompleteRef.current.delete(currentItem.id);
    }
  };

  const goToNextItem = () => {
    if (currentItemIndex < lessonItems.length - 1) {
      // More items in current lesson
      setCurrentItemIndex(prev => prev + 1);
    } else if (currentLessonIndex < allLessons.length - 1) {
      // Go to next lesson's first item
      const nextLesson = allLessons[currentLessonIndex + 1];
      router.push(`/dashboard/courses/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  const goToPreviousItem = () => {
    if (currentItemIndex > 0) {
      // More items before in current lesson
      setCurrentItemIndex(prev => prev - 1);
    } else if (currentLessonIndex > 0) {
      // Go to previous lesson's last item
      const prevLesson = allLessons[currentLessonIndex - 1];
      router.push(`/dashboard/courses/${courseId}/lesson/${prevLesson.id}?item=last`);
    }
  };

  const handleItemClick = (itemId: string) => {
    const index = lessonItems.findIndex(item => item.id === itemId);
    if (index >= 0) {
      setCurrentItemIndex(index);
    }
  };

  const completedCount = lessonItems.filter(item => item.isCompleted).length;
  const progressPercent = lessonItems.length > 0
    ? Math.round((completedCount / lessonItems.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">{error || t.learning?.lessonNotFound || "Lesson not found"}</h1>
          <Link href={`/dashboard/courses/${courseId}`}>
            <Button>{t.common.back}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-background">
        {/* Top Header with Controls */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition lg:hidden"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.learning?.backToCourse || t.lesson.backToCourse}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={goToPreviousItem}
              disabled={isFirstItemOfCourse}
              className="p-2 hover:bg-muted rounded-lg transition disabled:opacity-50"
              aria-label="Previous item"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground px-2">
              {currentItemIndex + 1} / {lessonItems.length}
            </span>
            <button
              onClick={goToNextItem}
              disabled={isLastItemOfCourse}
              className="p-2 hover:bg-muted rounded-lg transition disabled:opacity-50"
              aria-label="Next item"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
            className="gap-2 text-sm"
          >
            {t.learning?.exit || t.lesson.exit}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Content Area */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Content Display based on item type */}
            {currentItem ? (
              <>
                {/* Video Content */}
                {currentItem.type === "video" && (() => {
                  const videoContent = lessonItemService.parseContent<VideoContent>(currentItem.content);
                  const videoUrl = videoContent?.url || currentItem.url;
                  return (
                    <VideoPlayer
                      url={videoUrl}
                      title={currentItem.name}
                      description={videoContent?.description}
                    />
                  );
                })()}

                {/* Quiz Content */}
                {currentItem.type === "question" && (() => {
                  const quizContent = lessonItemService.parseContent<QuestionContent>(currentItem.content);

                  // Check if content has questions
                  const hasQuestions = quizContent && (
                    (quizContent.questions && quizContent.questions.length > 0) ||
                    (quizContent.question && quizContent.options)
                  );

                  if (!hasQuestions) {
                    return (
                      <div className="p-6 text-center">
                        <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Quiz content not available.</p>
                      </div>
                    );
                  }
                  return (
                    <QuizContent
                      lessonItemId={currentItem.id}
                      content={quizContent}
                      onComplete={async () => {
                        try {
                          markedCompleteRef.current.add(currentItem.id);
                          await lessonItemProgressService.setLessonItemAsCompleted(courseId, currentItem.lessonId, currentItem.id);
                          setLessonItems(prev => prev.map((item, idx) =>
                            idx === currentItemIndex ? { ...item, isCompleted: true } : item
                          ));
                        } catch (err) {
                          console.error("Failed to mark quiz complete:", err);
                          markedCompleteRef.current.delete(currentItem.id);
                        }
                      }}
                    />
                  );
                })()}

                {/* Rich Text Content */}
                {currentItem.type === "text" && (() => {
                  const textContent = lessonItemService.parseContent<RichTextContentType>(currentItem.content);
                  if (!textContent) {
                    // Fallback: try to display content as string
                    const fallbackText = typeof currentItem.content === "string"
                      ? currentItem.content
                      : "No content available.";
                    return (
                      <div className="p-6">
                        <div className="prose prose-sm max-w-none">
                          <p>{fallbackText}</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <RichTextContent
                      content={textContent}
                      title={currentItem.name}
                    />
                  );
                })()}

                {/* Item Details Header */}
                <div className="px-6 md:px-8 py-6 border-t">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {currentItem.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t.learning?.itemOf?.replace("{current}", String(currentItemIndex + 1)).replace("{total}", String(lessonItems.length)) || `Item ${currentItemIndex + 1} of ${lessonItems.length}`} {t.learning?.inLesson || "in"} &quot;{lesson.title}&quot;
                  </p>

                  {/* Navigation */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={goToPreviousItem}
                      disabled={isFirstItemOfCourse}
                      className="gap-2 min-h-[44px]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t.common.previous}
                    </Button>
                    <Button
                      onClick={goToNextItem}
                      disabled={isLastItemOfCourse}
                      className="gap-2 min-h-[44px]"
                    >
                      {t.common.next}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2">{t.learning?.noContent || "No Content Available"}</h2>
                  <p className="text-muted-foreground">{t.learning?.noContentDesc || "This lesson has no items yet."}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: All Lessons with Items */}
          <div
            className={`${sidebarOpen ? "translate-x-0" : "translate-x-full"
              } fixed lg:static right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-lg lg:shadow-none transition-transform lg:translate-x-0 z-40 overflow-y-auto`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Course Content</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-muted rounded lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lesson Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t.learning?.lessonProgress || "Lesson Progress"}</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedCount} / {lessonItems.length} items completed
                </p>
              </div>

              {/* Course Progress */}
              {enrollmentProgress && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{t.learning?.courseProgress || "Course Progress"}</span>
                  </div>
                  <p className="text-sm font-medium">
                    {Math.floor((enrollmentProgress.completedDurationInSeconds || 0) / 60)} min completed
                  </p>
                </div>
              )}

              {/* All Lessons List */}
              <div className="space-y-2">
                {allLessons.map((lessonItem, lessonIndex) => {
                  const isCurrentLesson = lessonItem.id === lessonId;
                  const isExpanded = expandedLessons.has(lessonItem.id);
                  const items = isCurrentLesson ? lessonItems : (allLessonItems[lessonItem.id] || []);

                  const toggleLesson = async (lid: string) => {
                    setExpandedLessons(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(lid)) {
                        newSet.delete(lid);
                      } else {
                        newSet.add(lid);
                        // Load items if not already loaded
                        if (!allLessonItems[lid]) {
                          lessonItemService.getItemsWithProgress(lid)
                            .catch(() => lessonItemService.getItemsByLesson(lid))
                            .then(data => {
                              setAllLessonItems(p => ({ ...p, [lid]: data }));
                            });
                        }
                      }
                      return newSet;
                    });
                  };

                  return (
                    <div key={lessonItem.id} className="border border-border rounded-lg overflow-hidden">
                      {/* Lesson Header */}
                      <button
                        onClick={() => toggleLesson(lessonItem.id)}
                        className={`w-full text-left p-3 flex items-center gap-3 transition ${isCurrentLesson ? "bg-primary/10" : "hover:bg-muted"
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrentLesson ? "bg-primary text-white" : "bg-muted"
                          }`}>
                          <span className="text-xs font-semibold">{lessonIndex + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isCurrentLesson ? "text-primary" : ""}`}>
                            {lessonItem.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {items.length} {t.learning?.items || "items"}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>

                      {/* Lesson Items (when expanded) */}
                      {isExpanded && items.length > 0 && (
                        <div className="border-t border-border bg-muted/30">
                          {items.map((item, itemIndex) => {
                            const Icon = getItemIcon(item.type);
                            const isActiveItem = isCurrentLesson && currentItemIndex === itemIndex;

                            const handleItemClick = () => {
                              if (isCurrentLesson) {
                                setCurrentItemIndex(itemIndex);
                              } else {
                                router.push(`/dashboard/courses/${courseId}/lesson/${lessonItem.id}?item=${item.id}`);
                              }
                              setSidebarOpen(false);
                            };

                            return (
                              <button
                                key={item.id}
                                onClick={handleItemClick}
                                className={`w-full text-left px-3 py-2 flex items-center gap-2 transition text-sm border-b border-border/50 last:border-b-0 ${isActiveItem
                                  ? "bg-primary text-white"
                                  : "hover:bg-muted"
                                  }`}
                              >
                                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${isActiveItem ? "bg-white/20" : "bg-background"
                                  }`}>
                                  <Icon className="w-3 h-3" />
                                </div>
                                <span className="flex-1 truncate text-xs">{item.name}</span>
                                {item.isCompleted && !isActiveItem && (
                                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Loading state for items */}
                      {isExpanded && !isCurrentLesson && !allLessonItems[lessonItem.id] && (
                        <div className="border-t border-border p-3 text-center">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {allLessons.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No lessons available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
