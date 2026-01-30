"use client";

import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressIndicator({
  completed,
  total,
  showLabel = false,
  size = "md",
  className,
}: ProgressIndicatorProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{percent}%</span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", heights[size])}>
        <div
          className="bg-success h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground mt-1">
          {completed} of {total} completed
        </p>
      )}
    </div>
  );
}
