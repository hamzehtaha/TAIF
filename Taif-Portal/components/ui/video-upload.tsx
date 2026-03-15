"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Loader2, FileVideo, Settings, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { mediaStreamingService } from "@/services/media-streaming.service";
import { videoService, VideoUploadResponse, VideoAssetStatus } from "@/services/video.service";

export type VideoUploadState = "idle" | "uploading" | "processing" | "complete" | "error";

export interface VideoUploadResult {
  videoAssetId: string;
  playbackId: string | null;
  duration: number;
  thumbnailUrl?: string;
  url?: string;
  filename?: string;
  size?: number;
}

interface VideoUploadProps {
  /** Current video file (for controlled component) */
  file?: File | null;
  /** Called when file is selected */
  onFileSelect?: (file: File | null) => void;
  /** Called when upload completes successfully */
  onUploadComplete?: (result: VideoUploadResult) => void;
  /** Called on upload error */
  onError?: (error: string) => void;
  /** Called when video is removed */
  onRemove?: () => void;
  /** Whether to upload immediately on file select or defer to manual trigger */
  deferUpload?: boolean;
  /** Initial title for the upload (used in Mux metadata) */
  title?: string;
  /** Initial description for the upload */
  description?: string;
  /** Custom class name */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Existing playback ID to show preview */
  existingPlaybackId?: string;
  /** Existing video asset ID */
  existingVideoAssetId?: string;
}

export function VideoUpload({
  file: controlledFile,
  onFileSelect,
  onUploadComplete,
  onError,
  onRemove,
  deferUpload = false,
  title = "",
  description = "",
  className,
  disabled = false,
  existingPlaybackId,
  existingVideoAssetId,
}: VideoUploadProps) {
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<VideoUploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [uploadResult, setUploadResult] = useState<VideoUploadResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const file = controlledFile !== undefined ? controlledFile : internalFile;

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Set complete state if existing video
  useEffect(() => {
    if (existingPlaybackId || existingVideoAssetId) {
      setUploadState("complete");
    }
  }, [existingPlaybackId, existingVideoAssetId]);

  const uploadVideo = useCallback(async (videoFile: File): Promise<VideoUploadResult> => {
    setUploadState("uploading");
    setUploadProgress(0);

    // Step 1: Get Mux direct upload URL from backend
    const uploadResponse = await videoService.createUpload({
      title: title || videoFile.name,
      description: description,
      originalFileName: videoFile.name,
    });

    // Step 2: Upload directly to Mux
    const xhr = new XMLHttpRequest();
    
    await new Promise<void>((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Upload failed")));

      xhr.open("PUT", uploadResponse.uploadUrl);
      xhr.setRequestHeader("Content-Type", videoFile.type);
      xhr.send(videoFile);
    });

    setUploadState("processing");

    // Step 3: Poll for video ready status
    const pollForReady = async (): Promise<VideoUploadResult> => {
      const status = await videoService.getVideoStatus(uploadResponse.videoAssetId);
      
      if (status.isReady) {
        const videoInfo = await videoService.getVideo(uploadResponse.videoAssetId);
        const finalDuration = videoInfo.durationInSeconds > 0 ? videoInfo.durationInSeconds : duration;
        setDuration(finalDuration);
        setUploadState("complete");
        
        const result: VideoUploadResult = {
          videoAssetId: uploadResponse.videoAssetId,
          playbackId: videoInfo.playbackId || null,
          duration: finalDuration,
          thumbnailUrl: videoInfo.thumbnailUrl,
          url: videoInfo.playbackUrl || "",
          filename: videoFile.name,
          size: videoFile.size,
        };
        setUploadResult(result);
        return result;
      } else if (status.status === VideoAssetStatus.Failed) {
        throw new Error(status.errorMessage || "Video processing failed");
      }
      
      // Continue polling
      await new Promise(r => setTimeout(r, 3000));
      return pollForReady();
    };

    return await pollForReady();
  }, [title, description, duration]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!mediaStreamingService.isValidVideoFile(selectedFile)) {
      onError?.("Invalid file type. Please select a valid video file.");
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(objectUrl);
    
    // Get video metadata
    const metadata = await mediaStreamingService.getVideoMetadata(selectedFile);
    setDuration(metadata.duration);

    // Update file state
    if (controlledFile === undefined) {
      setInternalFile(selectedFile);
    }
    onFileSelect?.(selectedFile);

    // Upload immediately or defer
    if (!deferUpload) {
      try {
        const result = await uploadVideo(selectedFile);
        onUploadComplete?.(result);
      } catch (error) {
        setUploadState("error");
        onError?.(error instanceof Error ? error.message : "Upload failed");
      }
    } else {
      setUploadState("idle");
    }
  }, [previewUrl, controlledFile, deferUpload, onFileSelect, onError, onUploadComplete, uploadVideo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadState("idle");
    setUploadProgress(0);
    setUploadResult(null);
    setDuration(0);
    if (controlledFile === undefined) {
      setInternalFile(null);
    }
    onFileSelect?.(null);
    onRemove?.();
  }, [previewUrl, controlledFile, onFileSelect, onRemove]);

  const handleCopyUrl = useCallback(() => {
    const playbackId = uploadResult?.playbackId || existingPlaybackId;
    if (playbackId) {
      const muxUrl = `https://stream.mux.com/${playbackId}.m3u8`;
      navigator.clipboard.writeText(muxUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  }, [uploadResult, existingPlaybackId]);

  // Expose upload trigger for deferred uploads
  const triggerUpload = useCallback(async (): Promise<VideoUploadResult | null> => {
    if (!file) return null;
    try {
      const result = await uploadVideo(file);
      onUploadComplete?.(result);
      return result;
    } catch (error) {
      setUploadState("error");
      onError?.(error instanceof Error ? error.message : "Upload failed");
      throw error;
    }
  }, [file, uploadVideo, onUploadComplete, onError]);

  const hasVideo = file || existingPlaybackId || existingVideoAssetId;
  const showUploadOverlay = uploadState === "uploading" || uploadState === "processing";

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {!hasVideo ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            "hover:border-primary hover:bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Drag and drop video files to upload</p>
              <p className="text-sm text-muted-foreground mt-1">Your video will be processed for streaming</p>
            </div>
            <Button type="button" variant="outline" disabled={disabled}>
              <FileVideo className="h-4 w-4 mr-2" />
              Select file
            </Button>
            <p className="text-xs text-muted-foreground">MP4, WebM, MOV up to 500MB</p>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-black">
              <video 
                src={previewUrl || undefined} 
                className="w-full h-full object-contain" 
                controls={uploadState === "idle" || uploadState === "complete"} 
                muted 
              />
              
              {showUploadOverlay && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center text-white">
                    {uploadState === "uploading" && (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Uploading... {uploadProgress}%</p>
                      </>
                    )}
                    {uploadState === "processing" && (
                      <>
                        <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Processing video...</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <Button 
                type="button" 
                variant="secondary" 
                size="icon" 
                className="absolute top-2 right-2" 
                onClick={handleRemove}
                disabled={disabled || showUploadOverlay}
              >
                <X className="h-4 w-4" />
              </Button>

              {duration > 0 && (uploadState === "idle" || uploadState === "complete") && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {mediaStreamingService.formatDuration(duration)}
                </div>
              )}
            </div>

            {uploadState === "uploading" && (
              <div className="p-3 border-t">
                <Progress value={uploadProgress} className="h-1" />
              </div>
            )}

            {uploadState === "complete" && (uploadResult || existingPlaybackId) && (
              <div className="p-3 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Video link</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyUrl}>
                    {copiedUrl ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                {uploadResult?.url && (
                  <a href={uploadResult.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block truncate">
                    {uploadResult.url}
                  </a>
                )}
                {uploadResult?.filename && uploadResult?.size && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Filename: {uploadResult.filename}</span>
                    <span>Size: {mediaStreamingService.formatFileSize(uploadResult.size)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Export hook for manual upload trigger
export function useVideoUploadRef() {
  const uploadRef = useRef<{ triggerUpload: () => Promise<VideoUploadResult | null> } | null>(null);
  return uploadRef;
}

export default VideoUpload;
