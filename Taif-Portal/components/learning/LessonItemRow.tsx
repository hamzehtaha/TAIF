"use client";

import { Video, FileText, HelpCircle, CheckCircle, Play } from "lucide-react";
import { LessonItem } from "@/services/lessonItemService";
import { cn } from "@/lib/utils";

interface LessonItemRowProps {
  item: LessonItem;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const getItemIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video;
    case "text":
      return FileText;
    case "question":
      return HelpCircle;
    default:
      return FileText;
  }
};

export function LessonItemRow({
  item,
  isActive = false,
  onClick,
  disabled = false,
}: LessonItemRowProps) {
  const Icon = getItemIcon(item.type);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left p-3 rounded-lg transition text-sm flex items-center gap-3",
        isActive
          ? "bg-primary text-white"
          : "hover:bg-muted",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isActive
            ? "bg-white/20"
            : "bg-muted"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.name}</p>
        <p className="text-xs opacity-75 capitalize">{item.type}</p>
      </div>
      {item.isCompleted && !isActive && (
        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
      )}
      {isActive && (
        <Play className="w-4 h-4 flex-shrink-0" />
      )}
    </button>
  );
}
