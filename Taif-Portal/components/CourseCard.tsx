"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@/services/courseService";
import { useTranslation } from "@/hooks/useTranslation";
import { Star, Users, Clock, Badge } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  const t = useTranslation();

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    onEnroll?.();
  };

  return (
    <Link href={`/dashboard/courses/${course.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
        {/* Course Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 aspect-video">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          <Badge className="absolute top-3 right-3 bg-primary">
            {t.courses[course.difficulty as keyof typeof t.courses] ||
              course.difficulty}
          </Badge>
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          {/* Instructor */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium">{course.instructor.name}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-medium">
                {course.rating.toFixed(1)}
              </span>
              <span>({course.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollmentCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}h</span>
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {course.isEnrolled && course.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs mb-1">
                <span>{t.courses.progress}</span>
                <span>{Math.round(course.progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            variant={course.isEnrolled ? "outline" : "default"}
            onClick={handleEnroll}
            disabled={course.isEnrolled}
          >
            {course.isEnrolled
              ? t.common.enrolled
              : t.common.enroll}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
