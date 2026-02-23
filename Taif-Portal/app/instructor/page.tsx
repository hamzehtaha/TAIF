"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  MessageSquare,
  UserPlus,
  FileCheck,
} from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { instructorProfileService, InstructorProfileResponse } from "@/services/instructor-profile.service";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  averageRating: number;
  totalReviews: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

interface DashboardCourse {
  id: string;
  title: string;
  status: string;
  stats: {
    totalStudents: number;
    averageRating: number;
    totalLessons: number;
    completionRate: number;
  };
}

export default function InstructorDashboard() {
  const [instructor, setInstructor] = useState<InstructorProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for dashboard (will be replaced with real API later)
  const dashboardStats: DashboardStats = {
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalReviews: 0,
    recentActivity: [],
  };

  const courses: DashboardCourse[] = [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const profile = await instructorProfileService.getCurrentProfile();
        setInstructor(profile);
      } catch (error) {
        console.error("Failed to load instructor profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = [
    {
      title: "Total Courses",
      value: instructor?.coursesCount || 0,
      subtitle: "Your created courses",
      icon: BookOpen,
      color: "bg-primary",
    },
    {
      title: "Average Rating",
      value: instructor?.rating?.toFixed(1) || "0.0",
      subtitle: "Based on student reviews",
      icon: Star,
      color: "bg-warning",
    },
    {
      title: "Years of Experience",
      value: instructor?.yearsOfExperience || 0,
      subtitle: "Teaching experience",
      icon: TrendingUp,
      color: "bg-accent",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "enrollment":
        return <UserPlus className="h-4 w-4 text-secondary" />;
      case "review":
        return <MessageSquare className="h-4 w-4 text-warning" />;
      case "course_published":
        return <FileCheck className="h-4 w-4 text-primary" />;
      case "lesson_added":
        return <BookOpen className="h-4 w-4 text-accent" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const recentCourses = courses.slice(0, 4);

  return (
    <InstructorLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {instructor?.firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your courses today.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/instructor/courses/new">
              <Plus className="mr-2 h-5 w-5" />
              Create New Course
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Courses</CardTitle>
                  <CardDescription>Manage and track your course performance</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/instructor/courses">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentCourses.length > 0 ? (
                  <div className="space-y-4">
                    {recentCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/instructor/courses/${course.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-16 w-24 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary/50" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{course.title}</h4>
                            <Badge
                              variant={
                                course.status === "published"
                                  ? "default"
                                  : course.status === "draft"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="flex-shrink-0"
                            >
                              {course.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.stats.totalStudents} students
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {course.stats.averageRating.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {course.stats.totalLessons} lessons
                            </span>
                          </div>
                          {course.status === "published" && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Completion Rate</span>
                                <span>{course.stats.completionRate}%</span>
                              </div>
                              <Progress value={course.stats.completionRate} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium mb-2">No courses yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first course to start teaching
                    </p>
                    <Button asChild>
                      <Link href="/instructor/courses/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Course
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No recent activity
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/instructor/courses/new">
                  <Plus className="h-5 w-5" />
                  <span>New Course</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/instructor/courses">
                  <BookOpen className="h-5 w-5" />
                  <span>Manage Courses</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/instructor/lessons">
                  <FileCheck className="h-5 w-5" />
                  <span>View Lessons</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link href="/instructor/profile">
                  <Users className="h-5 w-5" />
                  <span>Edit Profile</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}
