"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/auth.service";
import { courseService } from "@/services/course.service";
import { categoryService } from "@/services/category.service";
import { enrollmentService } from "@/services/enrollment.service";
import { CourseCard } from "@/components/CourseCard";
import { CategoryFilter } from "@/components/learning/CategoryFilter";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter} from "lucide-react";
import { Course } from "@/models/course.model";
import { Category } from "@/models/category.model";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Courses() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [favouriteCourseIds, setFavouriteCourseIds] = useState<Set<string>>(new Set());
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Read category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {

    // Load all data
    const loadData = async () => {
      try {
        setError(null);
        
        // Load courses, categories, and user data in parallel
        const [coursesData, categoriesData, enrolledData, favouritesData] = await Promise.all([
          courseService.getCourses(),
          categoryService.getCategories(),
          enrollmentService.getUserCourses().catch(() => []),
          enrollmentService.getUserFavouriteCourses().catch(() => []),
        ]);

        // Create sets and maps for quick lookup
        const enrolledIds = new Set(enrolledData.map(c => c.id));
        const favouriteIds = new Set(favouritesData.map(c => c.id));
        
        // Create a map of enrolled courses with their duration for progress calculation
        const enrolledCourseMap = new Map<string, Course>(enrolledData.map(c => [c.id, c] as [string, Course]));
        
        setEnrolledCourseIds(enrolledIds);
        setFavouriteCourseIds(favouriteIds);
        setCategories(categoriesData);

        // Fetch enrollment progress and completion status for enrolled courses
        const enrollmentProgressMap = new Map<string, number>();
        const completedCourseIds = new Set<string>();
        await Promise.all(
          Array.from(enrolledIds).map(async (courseId) => {
            try {
              const enrollment = await enrollmentService.getEnrollmentDetailsWithProgress(courseId);
              if (enrollment) {
                // Track completion status
                if (enrollment.isCompleted) {
                  completedCourseIds.add(courseId);
                }
                // Calculate progress
                if (enrollment.completedDurationInSeconds !== undefined) {
                  const enrolledCourse = enrolledCourseMap.get(courseId);
                  const totalDuration = enrolledCourse?.durationInMinutes ? enrolledCourse.durationInMinutes * 60 : 0;
                  if (totalDuration > 0) {
                    const progress = Math.min(100, Math.round((enrollment.completedDurationInSeconds / totalDuration) * 100));
                    enrollmentProgressMap.set(courseId, progress);
                  }
                }
              }
            } catch {
              // Ignore errors for individual progress fetches
            }
          })
        );

        // Enrich courses with enrollment, favourite status, progress, and completion
        const enrichedCourses = await courseService.enrichCoursesWithCategories(
          coursesData.map(course => ({
            ...course,
            isEnrolled: enrolledIds.has(course.id),
            isFavourite: favouriteIds.has(course.id),
            progress: enrollmentProgressMap.get(course.id) || 0,
            isCompleted: completedCourseIds.has(course.id),
          })),
          categoriesData.map(c => ({ id: c.id, name: c.name }))
        );

        setCourses(enrichedCourses);
        setFilteredCourses(enrichedCourses);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Handle search and category filter
  useEffect(() => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(
        (course) => course.categoryId === categoryFilter
      );
    }

    setFilteredCourses(filtered);
  }, [searchTerm, categoryFilter, courses]);

  const handleCategoryChange = (categoryId: string | null) => {
    setCategoryFilter(categoryId);
    // Update URL without full page reload
    if (categoryId) {
      router.push(`/dashboard/courses?category=${categoryId}`, { scroll: false });
    } else {
      router.push("/dashboard/courses", { scroll: false });
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollmentService.enroll(courseId);
      // Update course list
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? { ...course, isEnrolled: true }
            : course
        )
      );
      setEnrolledCourseIds(prev => new Set([...prev, courseId]));
    } catch (err) {
      console.error("Failed to enroll:", err);
    }
  };

  if (loading) {
    return <PuzzleLoader />;
  }

  return (
    <ProtectedRoute>
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            {t.courses.allCourses}
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore our collection of courses and expand your skills
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={t.home.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategoryId={categoryFilter}
            onCategorySelect={handleCategoryChange}
            loading={loading}
          />
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Found {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
          </p>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {t.courses.filter}
          </Button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-muted rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={() => handleEnroll(course.id)}
                isCompleted={course.isCompleted}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}
