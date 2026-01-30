"use client";

import { Video, Play, Pause } from "lucide-react";
import { LessonItem } from "@/services/lessonItemService";
import { cn } from "@/lib/utils";

interface VideoPlayerSectionProps {
  item: LessonItem | null;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
  className?: string;
}

export function VideoPlayerSection({
  item,
  isPlaying = false,
  onPlayToggle,
  className,
}: VideoPlayerSectionProps) {
  if (!item) {
    return (
      <div className={cn("bg-black aspect-video flex items-center justify-center", className)}>
        <div className="text-center">
          <Video className="w-16 h-16 text-white/30 mx-auto mb-2" />
          <p className="text-white/50 text-sm">Select a lesson item to begin</p>
        </div>
      </div>
    );
  }

  // If item has a video URL, show iframe
  if (item.type === "video" && item.url) {
    return (
      <div className={cn("bg-black aspect-video", className)}>
        <iframe
          src={item.url}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  // Placeholder for video content
  if (item.type === "video") {
    return (
      <div className={cn("bg-black aspect-video relative", className)}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary/30 via-accent/20 to-black/50">
          <Video className="w-20 h-20 text-white/40 mb-4" />
          <p className="text-white/70 font-medium text-lg">{item.name}</p>
          <p className="text-white/50 text-sm mt-2">Video content</p>
          
          {onPlayToggle && (
            <button
              onClick={onPlayToggle}
              className="mt-6 w-16 h-16 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center text-white transition"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // For non-video items, show a smaller header
  return (
    <div className={cn("bg-gradient-to-r from-primary/20 to-accent/20 p-8", className)}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
          <h2 className="text-2xl font-bold">{item.name}</h2>
        </div>
      </div>
    </div>
  );
}
