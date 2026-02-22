"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Eye } from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LessonItem } from "@/models/lesson-item.model";
import { Lesson } from "@/models/lesson.model";
import { Course } from "@/models/course.model";
import { lessonItemService, LessonItemFilter } from "@/services/lesson-item.service";
import { lessonService } from "@/services/lesson.service";
import { courseService } from "@/services/course.service";
import Link from "next/link";

export default function RichContentPage() {
  const [richTexts, setRichTexts] = useState<LessonItem[]>([]);
  const [filteredRichTexts, setFilteredRichTexts] = useState<LessonItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("all");

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId !== "all") {
      loadLessonsForCourse(selectedCourseId);
    } else {
      setLessons([]);
      setSelectedLessonId("all");
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedLessonId !== "all") {
      loadRichTextsForLesson(selectedLessonId);
    } else if (selectedCourseId !== "all") {
      loadAllRichTextsForCourse(selectedCourseId);
    } else {
      loadAllRichTexts();
    }
  }, [selectedCourseId, selectedLessonId]);

  useEffect(() => {
    filterRichTexts();
  }, [richTexts, searchQuery]);

  const loadCourses = async () => {
    try {
      const data = await courseService.getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
    }
  };

  const loadLessonsForCourse = async (courseId: string) => {
    try {
      const data = await lessonService.getLessonsByCourse(courseId);
      setLessons(data);
    } catch (error) {
      console.error("Failed to load lessons:", error);
    }
  };

  const loadRichTextsForLesson = async (lessonId: string) => {
    setIsLoading(true);
    try {
      const items = await lessonItemService.getItemsByLesson(lessonId);
      setRichTexts(items.filter(item => item.type === "text"));
    } catch (error) {
      console.error("Failed to load rich texts:", error);
      setRichTexts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllRichTextsForCourse = async (courseId: string) => {
    setIsLoading(true);
    try {
      const filter: LessonItemFilter = { courseId, type: 1, pageSize: 1000 };
      const result = await lessonItemService.getPagedItems(filter);
      setRichTexts(result.items);
    } catch (error) {
      console.error("Failed to load rich texts:", error);
      setRichTexts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllRichTexts = async () => {
    setIsLoading(true);
    try {
      const filter: LessonItemFilter = { type: 1, pageSize: 1000 };
      const result = await lessonItemService.getPagedItems(filter);
      setRichTexts(result.items);
    } catch (error) {
      console.error("Failed to load rich texts:", error);
      setRichTexts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRichTexts = () => {
    let result = [...richTexts];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(query));
    }
    setFilteredRichTexts(result);
  };

  const getContentPreview = (content: string | object | undefined) => {
    if (!content) return "No content";
    const str = typeof content === "string" ? content : JSON.stringify(content);
    const text = str.replace(/<[^>]*>/g, '').substring(0, 100);
    return text.length >= 100 ? text + "..." : text;
  };

  return (
    <InstructorLayout breadcrumbs={[{ label: "Rich Content" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Rich Content</h1>
            <p className="text-muted-foreground">
              View all text content across your courses ({filteredRichTexts.length} items)
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId} disabled={selectedCourseId === "all"}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Filter by lesson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lessons</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rich Content List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredRichTexts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Rich Content Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? "No content matches your search."
                  : "No rich text content found. Go to a course to add text content."}
              </p>
              <Button asChild>
                <Link href="/instructor/courses">Go to Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRichTexts.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {getContentPreview(item.content)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">Rich Text</Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                      <Link href={`/instructor/courses?item=${item.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </InstructorLayout>
  );
}
