"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { courseService, Course } from "@/services/courseService";
import { lessonService, Lesson } from "@/services/lessonService";
import { lessonItemService, LessonItem } from "@/services/lessonItemService";
import { enrollmentService } from "@/services/enrollmentService";
import { categoryService } from "@/services/categoryService";
import { EnrollmentDto } from "@/dtos/enrollment/EnrollmentDto";
import { LessonList } from "@/components/learning/LessonList";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  Play,
  Heart,
  AlertCircle,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Star,
  Users,
  MessageSquare,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// Mock review data - easy to replace with actual API data later
interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CourseRating {
  averageRating: number;
  totalReviews: number;
  enrolledCount: number;
  reviews: Review[];
}

// Default mock data - will be replaced with API data
const getDefaultRating = (): CourseRating => ({
  averageRating: 4.5,
  totalReviews: 24,
  enrolledCount: 156,
  reviews: [
    {
      id: "1",
      userId: "u1",
      userName: "Ahmed Hassan",
      rating: 5,
      comment: "Excellent course! Very comprehensive and well-structured content.",
      createdAt: "2025-01-15",
    },
    {
      id: "2",
      userId: "u2",
      userName: "Sara Ali",
      rating: 4,
      comment: "Great learning experience. The instructor explains concepts clearly.",
      createdAt: "2025-01-10",
    },
    {
      id: "3",
      userId: "u3",
      userName: "Mohammed Omar",
      rating: 5,
      comment: "Highly recommended for beginners and intermediate learners.",
      createdAt: "2025-01-05",
    },
  ],
});

interface LessonWithItems extends Lesson {
  items: LessonItem[];
}

interface CourseDetails extends Omit<Course, 'lessons'> {
  lessons: LessonWithItems[];
  enrollment?: EnrollmentDto | null;
}

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslation();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [togglingFavourite, setTogglingFavourite] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [courseRating, setCourseRating] = useState<CourseRating>(getDefaultRating());
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (!id) return;

    const loadCourseData = async () => {
      try {
        setError(null);
        
        // Load course, lessons, and enrollment status in parallel
        const [courseData, lessonsData, enrolledCourses, favouriteCourses, categories, enrollment] = await Promise.all([
          courseService.getCourseById(id),
          lessonService.getLessonsByCourse(id).catch(() => []),
          enrollmentService.getUserCourses().catch(() => []),
          enrollmentService.getUserFavouriteCourses().catch(() => []),
          categoryService.getCategories().catch(() => []),
          enrollmentService.getEnrollmentByCourse(id),
        ]);

        // Check enrollment and favourite status
        const isEnrolled = enrolledCourses.some(c => c.id === id);
        const isFavourite = favouriteCourses.some(c => c.id === id);
        const categoryName = categories.find(c => c.id === courseData.categoryId)?.name || "Unknown";

        // Load lesson items for each lesson (with progress if enrolled)
        const lessonsWithItems: LessonWithItems[] = await Promise.all(
          lessonsData.map(async (lesson) => {
            try {
              // Use progress endpoint if user is enrolled to get completion status
              const items = isEnrolled 
                ? await lessonItemService.getItemsWithProgress(lesson.id).catch(() => 
                    lessonItemService.getItemsByLesson(lesson.id)
                  )
                : await lessonItemService.getItemsByLesson(lesson.id);
              return { ...lesson, items };
            } catch {
              return { ...lesson, items: [] };
            }
          })
        );

        setCourse({
          ...courseData,
          isEnrolled,
          isFavourite,
          categoryName,
          lessons: lessonsWithItems,
          enrollment,
        });
      } catch (err) {
        console.error("Failed to load course:", err);
        setError("Failed to load course details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [id, router]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);

    try {
      await enrollmentService.enroll(course.id);
      setCourse((prev) =>
        prev ? { ...prev, isEnrolled: true } : null
      );
    } catch (err) {
      console.error("Failed to enroll:", err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleFavourite = async () => {
    if (!course) return;
    setTogglingFavourite(true);

    try {
      await enrollmentService.toggleFavourite(course.id);
      setCourse((prev) =>
        prev ? { ...prev, isFavourite: !prev.isFavourite } : null
      );
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    } finally {
      setTogglingFavourite(false);
    }
  };

  // Get resume learning URL based on lastLessonItemId or first item
  const getResumeLearningUrl = (): string => {
    if (!course || course.lessons.length === 0) return "#";

    const lastItemId = course.enrollment?.lastLessonItemId;
    
    // If we have a lastLessonItemId, find which lesson it belongs to
    if (lastItemId) {
      for (const lesson of course.lessons) {
        const itemExists = lesson.items.some(item => item.id === lastItemId);
        if (itemExists) {
          return `/dashboard/courses/${course.id}/lesson/${lesson.id}?item=${lastItemId}`;
        }
      }
    }

    // Default to first lesson's first item
    const firstLesson = course.lessons[0];
    if (firstLesson.items.length > 0) {
      return `/dashboard/courses/${course.id}/lesson/${firstLesson.id}?item=${firstLesson.items[0].id}`;
    }
    
    return `/dashboard/courses/${course.id}/lesson/${firstLesson.id}`;
  };

  // Check if user has any progress (any completed items)
  const hasAnyProgress = (): boolean => {
    if (!course) return false;
    return course.lessons.some(lesson => 
      lesson.items.some(item => item.isCompleted)
    );
  };

  // Handle review submission - ready for backend integration
  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return;
    setSubmittingReview(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      // await reviewService.submitReview(course.id, newReview.rating, newReview.comment);
      
      // For now, add to local state (mock behavior)
      const mockNewReview: Review = {
        id: `temp-${Date.now()}`,
        userId: "current-user",
        userName: "You",
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setCourseRating(prev => ({
        ...prev,
        totalReviews: prev.totalReviews + 1,
        averageRating: ((prev.averageRating * prev.totalReviews) + newReview.rating) / (prev.totalReviews + 1),
        reviews: [mockNewReview, ...prev.reviews],
      }));

      setNewReview({ rating: 5, comment: "" });
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Render star rating
  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-muted rounded-lg h-96 animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">{error || "Course not found"}</h1>
          <Link href="/dashboard/courses">
            <Button>{t.common.back}</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg overflow-hidden mb-6 aspect-video">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-muted-foreground/50" />
                </div>
              )}
              {course.isEnrolled && course.lessons.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition">
                  <Link href={`/dashboard/courses/${course.id}/lesson/${course.lessons[0].id}`}>
                    <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-white/90 transition">
                      <Play className="w-6 h-6 text-primary ml-1" />
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  {course.categoryName && (
                    <Badge className="mb-4 bg-primary">{course.categoryName}</Badge>
                  )}
                  <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                </div>
                {course.isEnrolled && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleFavourite}
                    disabled={togglingFavourite}
                    className={course.isFavourite ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart className={`w-5 h-5 ${course.isFavourite ? "fill-current" : ""}`} />
                  </Button>
                )}
              </div>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {course.lessons.length} {course.lessons.length === 1 ? "lesson" : "lessons"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  {t.courses.description}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {course.description || "No description available."}
                </p>
              </div>

              {/* Lessons with Lesson Items */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  {t.courses.lessons} ({course.lessons.length})
                </h2>
                <LessonList
                  lessons={course.lessons}
                  expandedLessonId={expandedLesson}
                  onLessonToggle={(lessonId) => setExpandedLesson(expandedLesson === lessonId ? null : lessonId)}
                  onItemClick={(lessonId, itemId) => {
                    router.push(`/dashboard/courses/${course.id}/lesson/${lessonId}?item=${itemId}`);
                  }}
                  isEnrolled={course.isEnrolled}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Enroll Card */}
            {!course.isEnrolled ? (
              <Card className="mb-6 border-2 border-primary">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Enroll now to start learning
                    </p>
                  </div>
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full min-h-[48px] mb-4"
                  >
                    {enrolling ? t.common.loading : t.common.enroll}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Get instant access to all lessons
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6 border-2 border-success">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-semibold text-success">Enrolled</span>
                  </div>
                  {course.lessons.length > 0 && (
                    <Link href={getResumeLearningUrl()}>
                      <Button className="w-full min-h-[48px]">
                        <Play className="w-4 h-4 mr-2" />
                        {hasAnyProgress() ? t.learning?.continueLearning || "Continue Learning" : t.learning?.startLearning || "Start Learning"}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Course Info Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">{t.courses?.courseInfo || "Course Info"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.courses?.category || "Category"}</span>
                  <span className="font-medium">{course.categoryName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.courses?.lessons || "Lessons"}</span>
                  <span className="font-medium">{course.lessons.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {t.courses?.enrolledStudents || "Enrolled"}
                  </span>
                  <span className="font-medium">{courseRating.enrolledCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {t.courses?.rating || "Rating"}
                  </span>
                  <span className="font-medium flex items-center gap-1">
                    {courseRating.averageRating.toFixed(1)}
                    <span className="text-muted-foreground">({courseRating.totalReviews})</span>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Favourite Button for enrolled users */}
            {course.isEnrolled && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleToggleFavourite}
                    disabled={togglingFavourite}
                  >
                    <Heart className={`w-4 h-4 ${course.isFavourite ? "fill-red-500 text-red-500" : ""}`} />
                    {course.isFavourite ? t.courses?.removeFromFavorites || "Remove from Favorites" : t.courses?.addToFavorites || "Add to Favorites"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t.courses?.reviews || "Reviews"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating Summary */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{courseRating.averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mt-1">
                      {renderStars(Math.round(courseRating.averageRating))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {courseRating.totalReviews} {t.courses?.reviewsCount || "reviews"}
                    </div>
                  </div>
                </div>

                {/* Add Review Form (for enrolled users) */}
                {course.isEnrolled && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">{t.courses?.writeReview || "Write a Review"}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t.courses?.yourRating || "Your Rating"}:</span>
                        {renderStars(newReview.rating, true, (r) => setNewReview(prev => ({ ...prev, rating: r })))}
                      </div>
                      <Textarea
                        placeholder={t.courses?.reviewPlaceholder || "Share your experience with this course..."}
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        rows={3}
                      />
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submittingReview || !newReview.comment.trim()}
                        className="w-full gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {submittingReview ? t.common.loading : t.courses?.submitReview || "Submit Review"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="border-t pt-4 space-y-4">
                  {courseRating.reviews.map((review) => (
                    <div key={review.id} className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.userName}</span>
                        <span className="text-xs text-muted-foreground">{review.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
