"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/auth.service";
import { enrollmentService } from "@/services/enrollment.service";
import { courseService } from "@/services/course.service";
import { Course } from "@/models/course.model";
import { categoryService } from "@/services/category.service";
import { CourseCard } from "@/components/CourseCard";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Award, Clock, TrendingUp, Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardHome() {
  const t = useTranslation();
  const router = useRouter();
  const user = authService.getUser();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [courses, recommendedCourses, categories] = await Promise.all([
        enrollmentService.getUserCourses(),
        courseService.getRecommendedCourses(),
        categoryService.getCategories()
      ]);
      const enrichedCourses = await courseService.enrichCoursesWithCategories(courses, categories);
      const enrichedRecommendedCourses = await courseService.enrichCoursesWithCategories(recommendedCourses, categories);
      setMyCourses(enrichedCourses ?? []);
      setRecommendedCourses(enrichedRecommendedCourses ?? []);
    } catch (err) {
      console.error("Failed to load enrolled courses:", err);
      setError("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadData();
  }, [router]);

  const stats = [
    {
      icon: BookOpen,
      label: t.dashboard.coursesEnrolled,
      value: myCourses.length.toString(),
      color: "bg-primary",
    },
    {
      icon: Clock,
      label: t.dashboard.hoursLearned,
      value: 0,
      subtitle: "Not implemented yet",
      color: "bg-accent",
    },
    {
      icon: Award,
      label: t.dashboard.certificates,
      value: 0,
      subtitle: "Not implemented yet",
      color: "bg-success",
    },
    {
      icon: TrendingUp,
      label: t.dashboard.completionRate,
      value: 0,
      subtitle: "Not implemented yet",
      color: "bg-warning",
    },
  ];

  if (loading) {
    return <PuzzleLoader />;
  }

  return (
    <ProtectedRoute>
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            {t.dashboard.welcome}, {user?.firstName}!
          </h1>
          <p className="text-lg text-muted-foreground">
            {t.dashboard.continueJourney}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      {"subtitle" in stat && stat.subtitle && (
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                    <div
                      className={`${stat.color} p-3 rounded-lg text-white`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Courses In Progress Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t.dashboard.myLearning}
              </h2>
              <p className="text-muted-foreground">
                {t.dashboard.continueLeaning}
              </p>
            </div>
            <Link href="/dashboard/courses">
              <Button variant="outline">
                {t.courses.allCourses}
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : myCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {t.dashboard.noCourses}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t.dashboard.startNewCourse}
                </p>
                <Link href="/dashboard/courses">
                  <Button>
                    {t.home.heroCta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommended Courses Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t.recommendations?.title || "Recommended for You"}
              </h2>
              <p className="text-muted-foreground">
                {t.recommendations?.subtitle || "Courses based on your interests"}
              </p>
            </div>
            <Link href="/dashboard/interests">
              <Button variant="outline">
                {t.recommendations?.explore || "Explore Interests"}
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : recommendedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <CourseCard key={course.id} course={course} showRecommendedBadge />
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-primary/5 border-primary/20">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary/50" />
                <h3 className="text-lg font-semibold mb-2">
                  {t.recommendations?.noRecommendations || "No recommendations yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t.recommendations?.selectInterests || "Select your interests to get personalized recommendations"}
                </p>
                <Link href="/dashboard/interests">
                  <Button>
                    {t.recommendations?.explore || "Explore Interests"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">{t.dashboard.settings}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.dashboard.manageProfile}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/certificates">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">{t.dashboard.yourCertificates}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.dashboard.viewDownloadCertificates}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg">{t.dashboard.helpSupport}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t.dashboard.getHelp}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}
