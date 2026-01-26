"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { courseService, Course } from "@/services/courseService";
import { RatingComponent } from "@/components/RatingComponent";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Users,
  Clock,
  Badge as BadgeIcon,
  ChevronRight,
  CheckCircle,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CourseDetails({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslation();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/signin");
      return;
    }

    if (!id) return;

    const loadCourse = async () => {
      try {
        const data = await courseService.getCourseById(id);
        setCourse(data);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, router]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);

    try {
      await courseService.enrollInCourse(course.id);
      setCourse((prev) =>
        prev ? { ...prev, isEnrolled: true } : null
      );
    } catch (error) {
      console.error("Failed to enroll:", error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleRating = async (rating: number, review?: string) => {
    if (!course) return;

    try {
      await courseService.rateCourse(course.id, rating, review);
      setShowRating(false);
      // Optionally reload course data or show success message
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
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

  if (!course) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
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
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition">
                <Link href={course.isEnrolled && course.lessons.length > 0 ? `/dashboard/courses/${course.id}/lesson/${course.lessons[0].id}` : "#"}>
                  <button 
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-white/90 transition"
                    disabled={!course.isEnrolled}
                  >
                    <Play className="w-6 h-6 text-primary ml-1" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Course Info */}
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div>
                  <Badge className="mb-4 bg-primary">
                    {t.courses[course.difficulty as keyof typeof t.courses] ||
                      course.difficulty}
                  </Badge>
                  <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({course.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {course.enrollmentCount} students
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {course.duration} hours
                  </span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-lg mb-8">
                <img
                  src="/instructor-avatar.jpg"
                  alt={course.instructor}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <h3 className="font-semibold text-lg">
                    {course.instructor}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  {t.courses.description}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* What You'll Learn */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  {t.courses.whatYouWillLearn}
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                    <span>Master the fundamentals of the subject</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                    <span>Build real-world projects and portfolios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                    <span>Gain industry-relevant skills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                    <span>Earn a certificate upon completion</span>
                  </li>
                </ul>
              </div>

              {/* Lessons */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  {t.courses.lessons}
                </h2>
                <div className="space-y-2">
                  {(course.lessons || []).map((lesson, index) => (
                    <div key={lesson.id} className="border border-border rounded-lg overflow-hidden">
                      <div 
                        onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                        className="p-4 hover:bg-muted/50 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{lesson.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {lesson.duration} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.isCompleted && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                          {course.isEnrolled && (
                            <Link 
                              href={`/dashboard/courses/${course.id}/lesson/${lesson.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 hover:bg-primary/10 rounded-full transition"
                            >
                              <Play className="w-4 h-4 text-primary" />
                            </Link>
                          )}
                          <ChevronRight 
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              expandedLesson === lesson.id ? "rotate-90" : ""
                            }`} 
                          />
                        </div>
                      </div>
                      
                      {expandedLesson === lesson.id && (
                        <div className="px-4 pb-4 pt-2 bg-muted/30 border-t border-border">
                          <p className="text-sm text-muted-foreground mb-3">
                            {lesson.description || "This lesson covers important concepts and practical applications."}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{lesson.duration} minutes</span>
                            </div>
                            {course.isEnrolled && (
                              <Link 
                                href={`/dashboard/courses/${course.id}/lesson/${lesson.id}`}
                                className="text-primary hover:underline font-medium"
                              >
                                Start Lesson →
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Enroll Card */}
            {!course.isEnrolled && (
              <Card className="sticky top-20 mb-6 border-2 border-primary">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      {t.courseDetail.enrolledMessage}
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
                    {t.courseDetail.startLearning}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Course Progress */}
            {course.isEnrolled && course.progress !== undefined && (
              <Card className="mb-6 sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">{t.courses.progress}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t.courseDetail.courseCompletion}</span>
                        <span className="font-semibold">
                          {Math.round(course.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-success h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    {course.progress === 100 && (
                      <Button className="w-full gap-2">
                        {t.dashboard.downloadCertificate}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t.courses.requirements}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t.courseDetail.basicUnderstanding}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t.courseDetail.computerInternet}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>{t.courseDetail.timeCommitment}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Rating Section */}
            {course.isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.courseDetail.shareFeedback}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!showRating ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowRating(true)}
                    >
                      {t.courses.rating}
                    </Button>
                  ) : (
                    <RatingComponent onSubmit={handleRating} />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
