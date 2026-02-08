"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useInstructor } from "@/contexts/InstructorContext";
import { mockInstructorService } from "@/services/instructor/mockInstructorService";
import { CourseReview, ReviewStats } from "@/types/instructor";
import { cn } from "@/lib/utils";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { formatDistanceToNow } from "date-fns";

export default function CourseReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { currentCourse, loadCourse, isLoading } = useInstructor();
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    loadCourse(courseId);
  }, [courseId, loadCourse]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const [reviewsData, statsData] = await Promise.all([
          mockInstructorService.getReviewsByCourse(courseId),
          mockInstructorService.getReviewStats(courseId),
        ]);
        setReviews(reviewsData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [courseId]);

  if (isLoading || !currentCourse) {
    return (
      <InstructorLayout>
        <PuzzleLoader />
      </InstructorLayout>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-warning text-warning"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const getRatingPercentage = (ratingValue: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    const count = stats.ratingDistribution[ratingValue as 1 | 2 | 3 | 4 | 5];
    return (count / stats.totalReviews) * 100;
  };

  return (
    <InstructorLayout
      breadcrumbs={[
        { label: "Courses", href: "/instructor/courses" },
        { label: currentCourse.title, href: `/instructor/courses/${courseId}` },
        { label: "Reviews" },
      ]}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/instructor/courses/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reviews & Ratings</h1>
            <p className="text-muted-foreground">{currentCourse.title}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rating Summary */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Overall Rating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-5xl font-bold">
                  {stats?.averageRating?.toFixed(1) || "0.0"}
                </p>
                <div className="flex justify-center mt-2">
                  {renderStars(Math.round(stats?.averageRating || 0))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {stats?.totalReviews || 0} reviews
                </p>
              </div>

              <Separator />

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-3">{rating}</span>
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <Progress
                      value={getRatingPercentage(rating)}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {stats?.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Review Insights</CardTitle>
              <CardDescription>
                Key metrics from student feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Star className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats?.ratingDistribution[5] || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">5-Star Reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {currentCourse.stats.totalStudents}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats && stats.totalReviews > 0
                        ? Math.round(
                            ((stats.ratingDistribution[4] + stats.ratingDistribution[5]) /
                              stats.totalReviews) *
                              100
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground">Positive Feedback</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Student Reviews</CardTitle>
            <CardDescription>
              What students are saying about your course
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReviews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-16 w-full bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.studentAvatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.studentName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(review.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No reviews yet</h3>
                <p className="text-sm text-muted-foreground">
                  Reviews will appear here once students start rating your course
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}
