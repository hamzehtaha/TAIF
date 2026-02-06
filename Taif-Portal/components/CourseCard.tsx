"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/services/courseService";
import { useTranslation } from "@/hooks/useTranslation";
import { BookOpen, Heart, CheckCircle, Star } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  onToggleFavourite?: () => void;
}

export function CourseCard({ course, onEnroll, onToggleFavourite }: CourseCardProps) {
  const t = useTranslation();

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEnroll?.();
  };

  const handleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavourite?.();
  };

  return (
    <Link href={`/dashboard/courses/${course.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
        {/* Course Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 aspect-video">
          {course.imageUrl && course.imageUrl !== "/placeholder-course.jpg" ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          {course.categoryName && (
            <Badge className="absolute top-3 left-3 bg-primary">
              {course.categoryName}
            </Badge>
          )}
          {/* Rating and Review Count Badge */}
          {(course.rating !== undefined && course.rating > 0) || (course.reviewCount !== undefined && course.reviewCount > 0) ? (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-white/80">({course.reviewCount || 0})</span>
            </div>
          ) : null}
          
          {course.isEnrolled && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-success text-white px-2 py-1 rounded-full text-xs">
              <CheckCircle className="w-3 h-3" />
              Enrolled
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description || "No description available"}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {!course.isEnrolled ? (
              <Button
                className="flex-1"
                onClick={handleEnroll}
              >
                {t.common.enroll}
              </Button>
            ) : (
              <Button
                className="flex-1"
                variant="outline"
              >
                Continue Learning
              </Button>
            )}
            {course.isEnrolled && onToggleFavourite && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavourite}
                className={course.isFavourite ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`w-4 h-4 ${course.isFavourite ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
