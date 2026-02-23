"use client";

import { useState, useEffect, useMemo } from "react";
import { BookOpen, Search, Filter, Plus, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "@/models/lesson.model";
import { Course } from "@/models/course.model";
import { lessonService, PagedResult } from "@/services/lesson.service";
import { courseService } from "@/services/course.service";
import Link from "next/link";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadLessons();
  }, [page, selectedCourseId, searchQuery]);

  const loadCourses = async () => {
    try {
      const data = await courseService.getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
    }
  };

  const loadLessons = async () => {
    setIsLoading(true);
    try {
      const result = await lessonService.getPagedLessons({
        page,
        pageSize,
        search: searchQuery || undefined,
        courseId: selectedCourseId !== "all" ? selectedCourseId : undefined,
      });
      setLessons(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Failed to load lessons:", error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || "Unknown Course";
  };

  return (
    <InstructorLayout breadcrumbs={[{ label: "Lessons" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Lessons</h1>
            <p className="text-muted-foreground">
              View all lessons across your courses ({totalCount} total)
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCourseId}
                onValueChange={(value) => {
                  setSelectedCourseId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[250px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : lessons.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Lessons Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || selectedCourseId !== "all"
                  ? "No lessons match your filters. Try adjusting your search criteria."
                  : "You haven't created any lessons yet. Go to a course to create lessons."}
              </p>
              <Button asChild>
                <Link href="/instructor/courses">Go to Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{lesson.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{getCourseTitle(lesson.courseId)}</Badge>
                            {lesson.duration > 0 && (
                              <>
                                <span>•</span>
                                <span>{Math.round(lesson.duration / 60)} min</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/instructor/courses/${lesson.courseId}?lesson=${lesson.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </InstructorLayout>
  );
}
