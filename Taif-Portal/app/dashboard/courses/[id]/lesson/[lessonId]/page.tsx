"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { lessonService, Lesson } from "@/services/lessonService";
import { lessonItemService, LessonItem } from "@/services/lessonItemService";
import { lessonItemProgressService } from "@/services/lessonItemProgressService";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
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

    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    const loadLessonData = async () => {
      try {
        setError(null);
        
        // Load lesson, items with progress, and all lessons for navigation
        const [lessonData, itemsData, courseLessons] = await Promise.all([
          lessonService.getLessonById(lessonId),
          lessonItemService.getItemsWithProgress(lessonId).catch(() => 
            lessonItemService.getItemsByLesson(lessonId)
          ),
          lessonService.getLessonsByCourse(courseId).catch(() => []),
        ]);

        setLesson(lessonData);
        setLessonItems(itemsData);
        setAllLessons(courseLessons);
        
        // Find current lesson index in all lessons
        const lessonIdx = courseLessons.findIndex(l => l.id === lessonId);
        setCurrentLessonIndex(lessonIdx >= 0 ? lessonIdx : 0);
        
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

  // Auto-mark item as completed when it becomes current
  useEffect(() => {
    if (!currentItem || !courseId) return;
    if (currentItem.isCompleted) return;
    if (markedCompleteRef.current.has(currentItem.id)) return;

    // Mark as completed immediately when viewing
    const markComplete = async () => {
      try {
        markedCompleteRef.current.add(currentItem.id);
        await lessonItemProgressService.setLessonItemAsCompleted(courseId, currentItem.id);
        
        // Update local state
        setLessonItems(prev => prev.map((item, idx) => 
          idx === currentItemIndex ? { ...item, isCompleted: true } : item
        ));
      } catch (err) {
        console.error("Failed to mark item complete:", err);
        markedCompleteRef.current.delete(currentItem.id);
      }
    };

    markComplete();
  }, [currentItem, currentItemIndex, courseId]);

  // Check if this is the first item of the first lesson (no previous available)
  const isFirstItemOfCourse = currentLessonIndex === 0 && currentItemIndex === 0;
  
  // Check if this is the last item of the last lesson (no next available)
  const isLastItemOfCourse = currentLessonIndex === allLessons.length - 1 && currentItemIndex === lessonItems.length - 1;

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
                {currentItem.type === "video" && (
                  <div className="flex-shrink-0">
                    <div className="relative bg-black overflow-hidden w-full aspect-video">
                      {currentItem.url ? (
                        <iframe
                          src={currentItem.url}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary/30 via-accent/20 to-black/50">
                          <Video className="w-20 h-20 text-white/40 mb-4" />
                          <p className="text-white/70 font-medium">{currentItem.name}</p>
                          <p className="text-white/50 text-sm mt-2">Video content</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Item Details - Clean layout without scroll */}
                <div className="px-6 md:px-8 py-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {currentItem.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t.learning?.itemOf?.replace("{current}", String(currentItemIndex + 1)).replace("{total}", String(lessonItems.length)) || `Item ${currentItemIndex + 1} of ${lessonItems.length}`} {t.learning?.inLesson || "in"} "{lesson.title}"
                  </p>

                  {/* Content */}
                  {currentItem.content && (
                    <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                      <div className="prose prose-sm max-w-none">
                        {currentItem.content}
                      </div>
                    </div>
                  )}

                  {currentItem.type === "text" && !currentItem.content && (
                    <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                      <p className="text-muted-foreground">
                        {t.learning?.textContent || "Text content"}
                      </p>
                    </div>
                  )}

                  {currentItem.type === "question" && (
                    <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                      <p className="text-muted-foreground">
                        {t.learning?.questionContent || "Quiz content"} - Not implemented yet
                      </p>
                    </div>
                  )}

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

          {/* Right Sidebar: Lesson Items */}
          <div
            className={`${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            } fixed lg:static right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-lg lg:shadow-none transition-transform lg:translate-x-0 z-40 overflow-y-auto`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{lesson.title}</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-muted rounded lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t.learning?.progress || "Progress"}</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedCount} / {lessonItems.length}
                </p>
              </div>

              {/* Items List - Show green checkmark for completed items */}
              <div className="space-y-1">
                {lessonItems.map((item, index) => {
                  const Icon = getItemIcon(item.type);
                  const isActive = currentItemIndex === index;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentItemIndex(index);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition text-sm ${
                        isActive
                          ? "bg-primary text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? "bg-white/20" : "bg-muted"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                        </div>
                        {item.isCompleted && !isActive && (
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {lessonItems.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t.learning?.noItems || "No items in this lesson"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
