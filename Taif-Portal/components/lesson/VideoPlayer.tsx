"use client";

import { Video } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  title: string;
  description?: string;
}

/**
 * Convert YouTube URL to embed URL
 */
function getEmbedUrl(url: string): string {
  if (!url) return "";
  
  // Already an embed URL
  if (url.includes("/embed/")) return url;
  
  // YouTube watch URL
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  // Vimeo URL
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  return url;
}

export function VideoPlayer({ url, title, description }: VideoPlayerProps) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="relative bg-black overflow-hidden w-full aspect-video">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary/30 via-accent/20 to-black/50">
          <Video className="w-20 h-20 text-white/40 mb-4" />
          <p className="text-white/70 font-medium">{title}</p>
          <p className="text-white/50 text-sm mt-2">Video not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0">
      <div className="relative bg-black overflow-hidden w-full aspect-video">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {description && (
        <div className="px-6 py-4 bg-muted/30 border-b">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
    </div>
  );
}
