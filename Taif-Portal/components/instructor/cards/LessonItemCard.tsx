"use client";

/**
 * LessonItemCard - Reusable card component for displaying lesson item information
 */

import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, X, Video, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonItem, LessonItemType } from "@/lib/api/types";

interface LessonItemCardProps {
  item: LessonItem;
  showDragHandle?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const getItemTypeIcon = (type: LessonItemType) => {
  switch (type) {
    case LessonItemType.Video:
      return <Video className="h-4 w-4 text-primary" />;
    case LessonItemType.RichText:
      return <FileText className="h-4 w-4 text-secondary" />;
    case LessonItemType.Question:
      return <HelpCircle className="h-4 w-4 text-warning" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getItemTypeLabel = (type: LessonItemType): string => {
  switch (type) {
    case LessonItemType.Video:
      return "Video";
    case LessonItemType.RichText:
      return "Rich Text";
    case LessonItemType.Question:
      return "Question";
    default:
      return "Unknown";
  }
};

export const LessonItemCard = forwardRef<HTMLDivElement, LessonItemCardProps>(
  ({ item, showDragHandle = true, onRemove, onClick, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
          showDragHandle && "cursor-grab active:cursor-grabbing",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {showDragHandle && (
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        {getItemTypeIcon(item.type)}
        <span className="flex-1 text-sm truncate">{item.name}</span>
        <Badge variant="outline" className="text-xs capitalize shrink-0">
          {getItemTypeLabel(item.type)}
        </Badge>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }
);

LessonItemCard.displayName = "LessonItemCard";
