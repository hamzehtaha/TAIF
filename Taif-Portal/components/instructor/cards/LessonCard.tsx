"use client";

/**
 * LessonCard - Reusable card component for displaying lesson information
 */

import { forwardRef } from "react";
import Link from "next/link";
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
  GripVertical,
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonWithItems, LessonItem, LessonItemType } from "@/lib/api/types";

interface LessonCardProps {
  lesson: LessonWithItems;
  index: number;
  courseId?: string;
  showDragHandle?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onDelete?: () => void;
  className?: string;
}

const getItemTypeIcon = (type: LessonItemType) => {
  switch (type) {
    case LessonItemType.Video:
      return <Video className="h-3 w-3 text-primary" />;
    case LessonItemType.RichText:
      return <FileText className="h-3 w-3 text-secondary" />;
    case LessonItemType.Question:
      return <HelpCircle className="h-3 w-3 text-warning" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
};

export const LessonCard = forwardRef<HTMLDivElement, LessonCardProps>(
  (
    {
      lesson,
      index,
      courseId,
      showDragHandle = true,
      onEdit,
      onRemove,
      onDelete,
      className,
    },
    ref
  ) => {
    const items = lesson.lessonItems || [];
    const editUrl = courseId
      ? `/instructor/courses/${courseId}/lessons?lessonId=${lesson.id}`
      : `/instructor/lessons?lessonId=${lesson.id}`;

    return (
      <Card
        ref={ref}
        className={cn(
          "hover:shadow-md transition-shadow",
          showDragHandle && "cursor-grab active:cursor-grabbing",
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {showDragHandle && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="h-5 w-5" />
                <span className="text-sm font-medium w-6">{index + 1}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Link
                  href={editUrl}
                  className="font-medium hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {lesson.title}
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {items.length} items
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Lesson
                        </DropdownMenuItem>
                      )}
                      {onRemove && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={onRemove}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove from Course
                          </DropdownMenuItem>
                        </>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={onDelete}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {lesson.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {lesson.description}
                </p>
              )}
              {items.length > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  {items.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      {getItemTypeIcon(item.type)}
                      <span className="truncate max-w-24">{item.name}</span>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{items.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }
);

LessonCard.displayName = "LessonCard";
