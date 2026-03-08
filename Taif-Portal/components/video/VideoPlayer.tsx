"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  videoService,
  VideoPlaybackInfo,
  VideoAssetStatus,
  VideoProvider,
} from "@/services/video.service";

interface VideoPlayerProps {
  videoId?: string;
  lessonItemId?: string;
  playbackId?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

export function VideoPlayer({
  videoId,
  lessonItemId,
  playbackId: initialPlaybackId,
  autoPlay = false,
  muted = false,
  loop = false,
  className = "",
  onTimeUpdate,
  onEnded,
  onError,
}: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoPlaybackInfo | null>(null);
  const [playbackId, setPlaybackId] = useState<string | null>(
    initialPlaybackId || null
  );

  useEffect(() => {
    const loadVideoInfo = async () => {
      if (initialPlaybackId) {
        setPlaybackId(initialPlaybackId);
        setLoading(false);
        return;
      }

      if (!videoId && !lessonItemId) {
        setError("No video ID or lesson item ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let info: VideoPlaybackInfo;

        if (videoId) {
          info = await videoService.getVideo(videoId);
        } else if (lessonItemId) {
          info = await videoService.getVideoByLessonItem(lessonItemId);
        } else {
          throw new Error("No video identifier provided");
        }

        setVideoInfo(info);

        if (info.status !== VideoAssetStatus.Ready) {
          setError(
            `Video is ${videoService.getStatusLabel(info.status).toLowerCase()}. Please wait...`
          );
          return;
        }

        if (!info.playbackId) {
          setError("Video playback ID not available");
          return;
        }

        setPlaybackId(info.playbackId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load video";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    loadVideoInfo();
  }, [videoId, lessonItemId, initialPlaybackId, onError]);

  useEffect(() => {
    if (!playbackId) return;

    const loadMuxPlayer = async () => {
      if (typeof window !== "undefined" && !customElements.get("mux-player")) {
        try {
          await import("@mux/mux-player");
        } catch (err) {
          console.error("Failed to load Mux Player:", err);
          setError("Failed to load video player");
        }
      }
    };

    loadMuxPlayer();
  }, [playbackId]);

  const handleTimeUpdate = (event: Event) => {
    const player = event.target as HTMLVideoElement;
    onTimeUpdate?.(player.currentTime, player.duration);
  };

  const handleEnded = () => {
    onEnded?.();
  };

  const handleError = (event: Event) => {
    const errorMessage = "Video playback error";
    setError(errorMessage);
    onError?.(new Error(errorMessage));
  };

  if (loading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading video...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted flex items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playbackId) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Video className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No video available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative aspect-video">
          {/* @ts-ignore - mux-player is a web component */}
          <mux-player
            playback-id={playbackId}
            metadata-video-title={videoInfo?.title || "Video"}
            metadata-viewer-user-id="anonymous"
            accent-color="#3b82f6"
            autoplay={autoPlay ? "true" : undefined}
            muted={muted ? "true" : undefined}
            loop={loop ? "true" : undefined}
            style={{ width: "100%", height: "100%" }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleError}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default VideoPlayer;
