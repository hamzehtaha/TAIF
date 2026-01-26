"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { courseService } from "@/services/courseService";
import { mockCourseSections } from "@/services/mockData";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Video,
  Play,
  Pause,
  Menu,
  X,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  duration: number;
  lessons: any[];
  order: number;
}

export default function Lesson({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const t = useTranslation();
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

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
      router.push("/signin");
      return;
    }

    // Load sections based on courseId
    const timer = setTimeout(() => {
      const courseSections =
        mockCourseSections[courseId as string] || [];
      setSections(courseSections);

      // Find and set the current lesson
      let found = false;
      for (const section of courseSections) {
        const lesson = section.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          setCurrentLesson(lesson);
          setExpandedSections(new Set([section.id]));
          found = true;
          break;
        }
      }

      if (!found && courseSections.length > 0) {
        const firstLesson = courseSections[0].lessons[0];
        setCurrentLesson(firstLesson);
        setExpandedSections(new Set([courseSections[0].id]));
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [courseId, lessonId, router]);

  const handleCompleteLesson = async () => {
    if (!courseId || !lessonId) return;
    setCompleting(true);

    try {
      await courseService.updateLessonProgress(courseId, lessonId);
      setCompleted(true);
    } catch (error) {
      console.error("Failed to complete lesson:", error);
    } finally {
      setCompleting(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleLessonSelect = (lesson: any) => {
    setCurrentLesson(lesson);
    setCompleted(false);
  };

  const findLessonIndex = () => {
    let index = 0;
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (lesson.id === currentLesson?.id) {
          return index;
        }
        index++;
      }
    }
    return -1;
  };

  const getAllLessons = () => {
    const lessons = [];
    for (const section of sections) {
      lessons.push(...section.lessons);
    }
    return lessons;
  };

  const goToNextLesson = () => {
    const lessons = getAllLessons();
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
    if (currentIndex < lessons.length - 1) {
      handleLessonSelect(lessons[currentIndex + 1]);
    }
  };

  const goToPreviousLesson = () => {
    const lessons = getAllLessons();
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
    if (currentIndex > 0) {
      handleLessonSelect(lessons[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full h-screen bg-muted/50 animate-pulse" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-screen bg-background">
        {/* Top Header with Controls */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={goToPreviousLesson}
              className="p-2 hover:bg-muted rounded-lg transition"
              aria-label="Previous lesson"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 hover:bg-muted rounded-lg transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={goToNextLesson}
              className="p-2 hover:bg-muted rounded-lg transition"
              aria-label="Next lesson"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
            className="gap-2 text-sm"
          >
            Exit
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Video & Lesson Content */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-shrink-0">
              {/* Video Player */}
              <div className="relative bg-black overflow-hidden w-full aspect-video">
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary/30 via-accent/20 to-black/50">
                  <div className="text-center">
                    <Video className="w-20 h-20 text-white/40 mx-auto mb-4" />
                    <p className="text-white/70 font-medium">
                      {currentLesson?.title}
                    </p>
                    <p className="text-white/50 text-sm mt-2">
                      Video Player - {currentLesson?.duration} min
                    </p>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center text-white transition"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 ml-0.5" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <label className="text-white text-sm flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoplay}
                            onChange={(e) => setAutoplay(e.target.checked)}
                            className="w-4 h-4"
                          />
                          Autoplay
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Details */}
            <div className="flex-1 px-6 md:px-8 py-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {currentLesson?.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{currentLesson?.duration} minutes</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                  <div className="text-sm">
                    Lesson {findLessonIndex() + 1} of {getAllLessons().length}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8 p-6 bg-muted/30 rounded-lg border border-border">
                  <h2 className="text-lg font-semibold mb-3">About This Lesson</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentLesson?.description}
                  </p>
                </div>

                {/* Learning Objectives */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Learning Objectives
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span>Understand the core concepts of this lesson</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span>Apply knowledge to practical scenarios</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span>Prepare for the next lesson</span>
                    </li>
                  </ul>
                </div>

                {/* Resources */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Resources</h2>
                  <div className="space-y-2">
                    <a
                      href="#"
                      className="block p-3 border border-border rounded-lg hover:bg-muted/50 transition"
                    >
                      📄 Lesson Notes PDF
                    </a>
                    <a
                      href="#"
                      className="block p-3 border border-border rounded-lg hover:bg-muted/50 transition"
                    >
                      💾 Code Examples
                    </a>
                    <a
                      href="#"
                      className="block p-3 border border-border rounded-lg hover:bg-muted/50 transition"
                    >
                      🔗 External Resources
                    </a>
                  </div>
                </div>

                {/* Complete Button */}
                <div className="flex gap-4">
                  {!completed ? (
                    <Button
                      onClick={handleCompleteLesson}
                      disabled={completing}
                      className="gap-2 min-h-[48px]"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {completing ? t.common.loading : "Mark as Complete"}
                    </Button>
                  ) : (
                    <div className="p-4 bg-success/10 border border-success rounded-lg flex items-center gap-3 w-full">
                      <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-success">Lesson Completed!</p>
                        <p className="text-sm text-success/80">Great work! Continue to the next lesson.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="mt-8 pt-8 border-t border-border flex gap-4">
                  <Button
                    variant="outline"
                    onClick={goToPreviousLesson}
                    className="gap-2 min-h-[48px]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </Button>
                  <Button onClick={goToNextLesson} className="gap-2 min-h-[48px]">
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Lessons */}
          <div
            className={`${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            } fixed lg:static right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-lg lg:shadow-none transition-transform lg:translate-x-0 z-40 overflow-y-auto`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-semibold">Course Content</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-muted rounded"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div key={section.id} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 bg-muted/50 hover:bg-muted transition flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{section.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {section.duration} min
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          expandedSections.has(section.id) ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {expandedSections.has(section.id) && (
                      <div className="bg-background p-3 space-y-2 border-t border-border">
                        {section.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              handleLessonSelect(lesson);
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition text-sm ${
                              currentLesson?.id === lesson.id
                                ? "bg-primary text-white"
                                : lesson.isCompleted
                                  ? "bg-success/10 border border-success/20 hover:bg-success/15"
                                  : "hover:bg-muted border border-transparent"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium">{lesson.title}</p>
                                <p className="text-xs opacity-75 mt-1">
                                  {lesson.duration} min
                                </p>
                              </div>
                              {lesson.isCompleted && (
                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
