"use client";

import { useState, useEffect } from "react";
import { Layers, Search, Filter, Eye, ChevronLeft, ChevronRight, Video, FileText, HelpCircle } from "lucide-react";
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

const typeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-5 w-5" />,
  text: <FileText className="h-5 w-5" />,
  question: <HelpCircle className="h-5 w-5" />,
};

const typeColors: Record<string, string> = {
  video: "bg-blue-500/10 text-blue-500",
  text: "bg-green-500/10 text-green-500",
  question: "bg-purple-500/10 text-purple-500",
};

export default function LessonItemsPage() {
  const [items, setItems] = useState<LessonItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LessonItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

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
      loadItemsForLesson(selectedLessonId);
    } else if (selectedCourseId !== "all") {
      loadAllItemsForCourse(selectedCourseId);
    } else {
      loadAllItems();
    }
  }, [selectedCourseId, selectedLessonId]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, selectedType]);

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

  const loadItemsForLesson = async (lessonId: string) => {
    setIsLoading(true);
    try {
      const data = await lessonItemService.getItemsByLesson(lessonId);
      setItems(data);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllItemsForCourse = async (courseId: string) => {
    setIsLoading(true);
    try {
      const filter: LessonItemFilter = { courseId, pageSize: 1000 };
      const result = await lessonItemService.getPagedItems(filter);
      setItems(result.items);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllItems = async () => {
    setIsLoading(true);
    try {
      const filter: LessonItemFilter = { pageSize: 1000 };
      const result = await lessonItemService.getPagedItems(filter);
      setItems(result.items);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let result = [...items];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(query));
    }
    if (selectedType !== "all") {
      result = result.filter(item => item.type === selectedType);
    }
    setFilteredItems(result);
  };

  const getLessonTitle = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson?.title || "Unknown Lesson";
  };

  return (
    <InstructorLayout breadcrumbs={[{ label: "Lesson Items" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Lesson Items</h1>
            <p className="text-muted-foreground">
              View all content items across your courses ({filteredItems.length} items)
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
                  placeholder="Search items..."
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
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full lg:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Rich Text</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || selectedType !== "all"
                  ? "No items match your filters."
                  : "No lesson items found. Go to a course to create content."}
              </p>
              <Button asChild>
                <Link href="/instructor/courses">Go to Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type] || "bg-gray-100"}`}>
                        {typeIcons[item.type] || <Layers className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="capitalize">{item.type}</Badge>
                          {item.durationInSeconds && item.durationInSeconds > 0 && (
                            <>
                              <span>•</span>
                              <span>{Math.round(item.durationInSeconds / 60)} min</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
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
