"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { courseService, Course } from "@/services/courseService";
import { CourseCard } from "@/components/CourseCard";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";

export default function Courses() {
  const t = useTranslation();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      router.push("/signin");
      return;
    }

    // Load courses
    const loadCourses = async () => {
      try {
        const data = await courseService.getCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [router]);

  // Handle search and filter
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

    // Filter by difficulty
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.difficulty === difficultyFilter
      );
    }

    setFilteredCourses(filtered);
  }, [searchTerm, difficultyFilter, courses]);

  const handleEnroll = async (courseId: string) => {
    try {
      await courseService.enrollCourse(courseId);
      // Update course list
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? { ...course, isEnrolled: true }
            : course
        )
      );
    } catch (error) {
      console.error("Failed to enroll:", error);
    }
  };

  if (loading) {
    return <PuzzleLoader />;
  }

  return (
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

        {/* Search and Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
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

          {/* Difficulty Filter */}
          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
            >
              <option value="all">All Levels</option>
              <option value="beginner">{t.courses.beginner}</option>
              <option value="intermediate">{t.courses.intermediate}</option>
              <option value="advanced">{t.courses.advanced}</option>
            </select>
          </div>
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
  );
}
