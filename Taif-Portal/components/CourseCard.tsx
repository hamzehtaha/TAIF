"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/models/course.model";
import { useTranslation } from "@/hooks/useTranslation";
import { BookOpen, Heart, CheckCircle, Star, Clock, Sparkles } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  onToggleFavourite?: () => void;
  showRecommendedBadge?: boolean;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function CourseCard({ course, onEnroll, onToggleFavourite, showRecommendedBadge }: CourseCardProps) {
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
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover hover:scale-105 transition-transform"
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
          {/* Bottom badges row: Rating + Duration */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {/* Rating Badge */}
            {(course.rating !== undefined && course.rating > 0) ? (
              <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating?.toFixed(1)}</span>
                <span className="text-white/80">({course.reviewCount || 0})</span>
              </div>
            ) : <div />}
            
            {/* Duration Badge */}
            {course.durationInMinutes && course.durationInMinutes > 0 && (
              <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{formatDuration(course.durationInMinutes)}</span>
              </div>
            )}
          </div>
          
          {/* Top right badges: Enrolled or Recommended */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {course.isEnrolled && (
              <div className="flex items-center gap-1 bg-success text-white px-2 py-1 rounded-full text-xs">
                <CheckCircle className="w-3 h-3" />
                Enrolled
              </div>
            )}
            {(showRecommendedBadge || course.isRecommended) && !course.isEnrolled && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs">
                <Sparkles className="w-3 h-3" />
                Recommended
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {course.description || "No description available"}
          </p>

          {/* Progress Bar for enrolled courses */}
          {course.isEnrolled && course.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-primary">{course.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

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
                {t.learning.continueLearning}
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
