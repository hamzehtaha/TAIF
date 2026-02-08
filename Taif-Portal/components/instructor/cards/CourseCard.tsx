"use client";

/**
 * CourseCard - Reusable card component for displaying course information
 * Supports both grid and list view modes
 */

import { forwardRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Globe,
  Archive,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course, CourseStatus, CourseWithDetails } from "@/lib/api/types";
import { formatDistanceToNow } from "date-fns";

interface CourseCardProps {
  course: Course | CourseWithDetails;
  viewMode?: "grid" | "list";
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onArchive?: () => void;
  onDuplicate?: () => void;
  className?: string;
}

const getStatusBadge = (status?: CourseStatus) => {
  switch (status) {
    case CourseStatus.Published:
      return <Badge className="bg-green-500/10 text-green-600 border-green-200">Published</Badge>;
    case CourseStatus.Archived:
      return <Badge variant="secondary">Archived</Badge>;
    case CourseStatus.Draft:
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
};

export const CourseCard = forwardRef<HTMLDivElement, CourseCardProps>(
  (
    {
      course,
      viewMode = "grid",
      onEdit,
      onDelete,
      onPublish,
      onUnpublish,
      onArchive,
      onDuplicate,
      className,
    },
    ref
  ) => {
    const detailsUrl = `/instructor/courses/${course.id}`;
    const lessonsCount = 'lessons' in course ? course.lessons?.length || 0 : 0;

    if (viewMode === "list") {
      return (
        <Card ref={ref} className={cn("hover:shadow-md transition-shadow", className)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-24 rounded-md overflow-hidden bg-muted shrink-0">
                {course.photo ? (
                  <Image
                    src={course.photo}
                    alt={course.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={detailsUrl}
                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {course.name}
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {course.description || "No description"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getStatusBadge(course.status)}
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={detailsUrl}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </DropdownMenuItem>
                  )}
                  {onDuplicate && (
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {course.status !== CourseStatus.Published && onPublish && (
                    <DropdownMenuItem onClick={onPublish}>
                      <Globe className="mr-2 h-4 w-4" />
                      Publish
                    </DropdownMenuItem>
                  )}
                  {course.status === CourseStatus.Published && onUnpublish && (
                    <DropdownMenuItem onClick={onUnpublish}>
                      <Globe className="mr-2 h-4 w-4" />
                      Unpublish
                    </DropdownMenuItem>
                  )}
                  {course.status !== CourseStatus.Archived && onArchive && (
                    <DropdownMenuItem onClick={onArchive}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Grid view (default)
    return (
      <Card ref={ref} className={cn("hover:shadow-md transition-shadow overflow-hidden", className)}>
        <Link href={detailsUrl}>
          <div className="relative h-40 bg-muted">
            {course.photo ? (
              <Image
                src={course.photo}
                alt={course.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              {getStatusBadge(course.status)}
            </div>
          </div>
        </Link>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={detailsUrl}
                className="font-semibold hover:text-primary transition-colors line-clamp-1"
              >
                {course.name}
              </Link>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {course.description || "No description"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={detailsUrl}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {course.status !== CourseStatus.Published && onPublish && (
                  <DropdownMenuItem onClick={onPublish}>
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </DropdownMenuItem>
                )}
                {course.status === CourseStatus.Published && onUnpublish && (
                  <DropdownMenuItem onClick={onUnpublish}>
                    <Globe className="mr-2 h-4 w-4" />
                    Unpublish
                  </DropdownMenuItem>
                )}
                {course.status !== CourseStatus.Archived && onArchive && (
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {lessonsCount} lessons
            </span>
            {course.tags && course.tags.length > 0 && (
              <div className="flex gap-1">
                {course.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{course.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

CourseCard.displayName = "CourseCard";
