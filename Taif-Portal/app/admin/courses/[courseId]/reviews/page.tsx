"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Info,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { courseService } from "@/services/course.service";
import { Course } from "@/types/course";
import { PuzzleLoader } from "@/components/PuzzleLoader";

export default function CourseReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCourse = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getCourse(courseId);
      setCourse(data);
    } catch (error) {
      console.error("Failed to load course:", error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  if (isLoading) {
    return (
      <AdminLayout>
        <PuzzleLoader />
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Course not found</p>
          <Button className="mt-4" onClick={() => router.push("/admin/courses")}>
            Back to Courses
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Courses", href: "/admin/courses" },
        { label: course.title, href: `/admin/courses/${courseId}` },
        { label: "Reviews" },
      ]}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/courses/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reviews & Ratings</h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>

        {/* Placeholder for Reviews */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Course Reviews
            </CardTitle>
            <CardDescription>
              Student feedback and ratings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Reviews Coming Soon</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              The reviews feature is being developed. Student ratings and feedback 
              will be available here once the feature is completed.
            </p>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-left">
                  Reviews will show student ratings, comments, and overall course feedback 
                  to help you improve your course content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
