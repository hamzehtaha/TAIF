"use client";

import { X } from "lucide-react";
import { LessonItem } from "@/models/lesson-item.model";
import { LessonItemRow } from "./LessonItemRow";
import { ProgressIndicator } from "./ProgressIndicator";
import { cn } from "@/lib/utils";

interface LearningSidebarProps {
  title: string;
  items: LessonItem[];
  currentItemId: string | null;
  onItemClick: (itemId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function LearningSidebar({
  title,
  items,
  currentItemId,
  onItemClick,
  isOpen,
  onClose,
}: LearningSidebarProps) {
  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;

  return (
    <div
      className={cn(
        "fixed lg:static right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-lg lg:shadow-none transition-transform lg:translate-x-0 z-40 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded lg:hidden flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ProgressIndicator
          completed={completedCount}
          total={totalCount}
          showLabel
        />
      </div>

      {/* Items List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {items.map((item) => (
            <LessonItemRow
              key={item.id}
              item={item}
              isActive={currentItemId === item.id}
              onClick={() => onItemClick(item.id)}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No items in this lesson</p>
          </div>
        )}
      </div>
    </div>
  );
}
