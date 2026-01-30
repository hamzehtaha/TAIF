"use client";

import { ChevronRight, CheckCircle, BookOpen } from "lucide-react";
import { Lesson } from "@/services/lessonService";
import { LessonItem } from "@/services/lessonItemService";

import { cn } from "@/lib/utils";
import { LessonItemRow } from "./LessonItemRow";

interface LessonWithItems extends Lesson {
  items: LessonItem[];
}

interface LessonListProps {
  lessons: LessonWithItems[];
  expandedLessonId: string | null;
  onLessonToggle: (lessonId: string) => void;
  onItemClick: (lessonId: string, itemId: string) => void;
  activeLessonId?: string;
  activeItemId?: string;
  isEnrolled?: boolean;
}

export function LessonList({
  lessons,
  expandedLessonId,
  onLessonToggle,
  onItemClick,
  activeLessonId,
  activeItemId,
  isEnrolled = false,
}: LessonListProps) {
  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No lessons available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lessons.map((lesson, index) => {
        const isExpanded = expandedLessonId === lesson.id;
        const completedItems = lesson.items.filter(item => item.isCompleted).length;
        const totalItems = lesson.items.length;
        const isLessonComplete = totalItems > 0 && completedItems === totalItems;

        return (
          <div
            key={lesson.id}
            className="border border-border rounded-lg overflow-hidden"
          >
            {/* Lesson Header */}
            <button
              onClick={() => onLessonToggle(lesson.id)}
              className={cn(
                "w-full p-4 flex items-center justify-between text-left transition",
                isExpanded ? "bg-muted/50" : "hover:bg-muted/30",
                activeLessonId === lesson.id && "bg-primary/5 border-l-4 border-l-primary"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  isLessonComplete
                    ? "bg-success/20 text-success"
                    : "bg-primary/10 text-primary"
                )}>
                  {isLessonComplete ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalItems} items • {completedItems}/{totalItems} completed
                  </p>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                  isExpanded && "rotate-90"
                )}
              />
            </button>

            {/* Lesson Items */}
            {isExpanded && (
              <div className="bg-background border-t border-border">
                {lesson.items.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {lesson.items.map((item) => (
                      <LessonItemRow
                        key={item.id}
                        item={item}
                        isActive={activeItemId === item.id}
                        onClick={() => isEnrolled && onItemClick(lesson.id, item.id)}
                        disabled={!isEnrolled}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No items in this lesson
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
