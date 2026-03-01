"use client";

import { useState, useRef, useCallback } from "react";
import {
  Video,
  Upload,
  Loader2,
  X,
  Copy,
  Check,
  FileVideo,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { contentService, LessonItemType } from "@/services/content.service";
import {
  mediaStreamingService,
  UploadProgress,
  UploadResult,
} from "@/services/media-streaming.service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface VideoContentData {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  durationInSeconds: number;
}

interface CreateVideoDialogProps {
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: 'api' | 'local';
  onDataReady?: (data: VideoContentData) => void;
}

type UploadState = "idle" | "uploading" | "processing" | "complete" | "error";
type ThumbnailMode = "upload" | "none";

export function CreateVideoDialog({
  onSuccess,
  triggerButton,
  open: controlledOpen,
  onOpenChange,
  mode = 'api',
  onDataReady,
}: CreateVideoDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoUploadState, setVideoUploadState] = useState<UploadState>("idle");
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadResult, setVideoUploadResult] = useState<UploadResult | null>(null);

  // Thumbnail state
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailMode>("none");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [thumbnailUploadResult, setThumbnailUploadResult] = useState<UploadResult | null>(null);

  // Form data
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [videoDuration, setVideoDuration] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoUploadState("idle");
    setVideoUploadProgress(0);
    setVideoUploadResult(null);
    setThumbnailMode("none");
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setThumbnailUploadResult(null);
    setFormData({ title: "", description: "" });
    setVideoDuration(0);
    setCopiedUrl(false);
  }, [videoPreviewUrl, thumbnailPreviewUrl]);

  const uploadVideo = async (file: File) => {
    setVideoUploadState("uploading");
    setVideoUploadProgress(0);

    try {
      const result = await mediaStreamingService.uploadVideo(file, (progress: UploadProgress) => {
        setVideoUploadProgress(progress.percentage);
      });

      setVideoUploadState("processing");
      setVideoUploadResult(result);
      setVideoDuration(result.duration || 0);
      setVideoUploadState("complete");
    } catch (error) {
      setVideoUploadState("error");
      toast({ title: "Upload failed", description: "Failed to upload video.", variant: "destructive" });
    }
  };

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!mediaStreamingService.isValidVideoFile(file)) {
      toast({ title: "Invalid file type", description: "Please select a valid video file.", variant: "destructive" });
      return;
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));

    const titleFromFile = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    if (!formData.title) setFormData((prev) => ({ ...prev, title: titleFromFile }));

    const metadata = await mediaStreamingService.getVideoMetadata(file);
    setVideoDuration(metadata.duration);
    await uploadVideo(file);
  };

  const handleThumbnailSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!mediaStreamingService.isValidImageFile(file)) {
      toast({ title: "Invalid file type", description: "Please select a valid image file.", variant: "destructive" });
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
    setThumbnailMode("upload");

    try {
      const result = await mediaStreamingService.uploadThumbnail(file);
      setThumbnailUploadResult(result);
    } catch (error) {
      toast({ title: "Upload failed", description: "Failed to upload thumbnail.", variant: "destructive" });
    }
  };

  const handleVideoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && mediaStreamingService.isValidVideoFile(file)) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));

      const titleFromFile = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      if (!formData.title) setFormData((prev) => ({ ...prev, title: titleFromFile }));

      const metadata = await mediaStreamingService.getVideoMetadata(file);
      setVideoDuration(metadata.duration);
      await uploadVideo(file);
    }
  };

  const handleCopyUrl = () => {
    if (videoUploadResult?.url) {
      navigator.clipboard.writeText(videoUploadResult.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const removeVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoUploadState("idle");
    setVideoUploadProgress(0);
    setVideoUploadResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({ title: "Validation Error", description: "Video title is required", variant: "destructive" });
      return;
    }

    if (!videoUploadResult?.url) {
      toast({ title: "Validation Error", description: "Please upload a video first", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let thumbnailUrl: string | undefined;
      if (thumbnailMode === "upload" && thumbnailUploadResult?.url) {
        thumbnailUrl = thumbnailUploadResult.url;
      }

      const videoData: VideoContentData = {
        title: formData.title,
        description: formData.description || undefined,
        url: videoUploadResult.url,
        thumbnailUrl: thumbnailUrl,
        durationInSeconds: videoDuration,
      };

      if (mode === 'local') {
        onDataReady?.(videoData);
        resetForm();
        setOpen(false);
        return;
      }

      await contentService.createContent({
        type: LessonItemType.Video,
        video: videoData,
      });

      toast({ title: "Success", description: "Video content created successfully" });
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create video content", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) resetForm();
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {triggerButton || (
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Create Video Content
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0 px-6 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Upload Video Content
            </DialogTitle>
            <DialogDescription>
              Upload a video file and customize its details. The video will be processed for streaming.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Details Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Title (required)</Label>
                  <Input
                    id="title"
                    placeholder="Add a title that describes your video"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell viewers about your video"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Separator />

                {/* Thumbnail Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Thumbnail</Label>
                  <p className="text-xs text-muted-foreground">
                    Set a thumbnail that stands out and draws viewers&apos; attention.
                  </p>

                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      thumbnailMode === "upload" && "border-primary ring-1 ring-primary"
                    )}
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      {thumbnailPreviewUrl ? (
                        <img src={thumbnailPreviewUrl} alt="Thumbnail" className="w-24 h-14 object-cover rounded" />
                      ) : (
                        <div className="w-24 h-14 bg-muted rounded flex items-center justify-center">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Upload thumbnail</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 2MB</p>
                      </div>
                    </CardContent>
                  </Card>

                  <input ref={thumbnailInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleThumbnailSelect} />
                </div>
              </div>

              {/* Right Column - Video Upload/Preview */}
              <div className="space-y-4">
                {!videoFile ? (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={handleVideoDrop}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Drag and drop video files to upload</p>
                        <p className="text-sm text-muted-foreground mt-1">Your video will be processed for streaming</p>
                      </div>
                      <Button type="button" variant="outline">
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
                        <video src={videoPreviewUrl || undefined} className="w-full h-full object-contain" controls={videoUploadState === "complete"} muted />
                        {videoUploadState !== "complete" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="text-center text-white">
                              {videoUploadState === "uploading" && (
                                <>
                                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                  <p className="text-sm">Uploading... {videoUploadProgress}%</p>
                                </>
                              )}
                              {videoUploadState === "processing" && (
                                <>
                                  <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
                                  <p className="text-sm">Processing video...</p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        <Button type="button" variant="secondary" size="icon" className="absolute top-2 right-2" onClick={removeVideo}>
                          <X className="h-4 w-4" />
                        </Button>
                        {videoUploadState === "complete" && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {mediaStreamingService.formatDuration(videoDuration)}
                          </div>
                        )}
                      </div>

                      {videoUploadState === "uploading" && (
                        <div className="p-3 border-t">
                          <Progress value={videoUploadProgress} className="h-1" />
                        </div>
                      )}

                      {videoUploadState === "complete" && videoUploadResult && (
                        <div className="p-3 border-t space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Video link</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyUrl}>
                              {copiedUrl ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <a href={videoUploadResult.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block truncate">
                            {videoUploadResult.url}
                          </a>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Filename: {videoUploadResult.filename}</span>
                            <span>Size: {mediaStreamingService.formatFileSize(videoUploadResult.size)}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" className="hidden" onChange={handleVideoSelect} />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t p-6">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || videoUploadState !== "complete" || !formData.title.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
