"use client";

import { useState, useEffect, useRef } from "react";
import {
  Video,
  Loader2,
  Upload,
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { contentService, LessonItemType, Content, VideoContent } from "@/services/content.service";
import {
  mediaStreamingService,
  UploadProgress,
  UploadResult,
} from "@/services/media-streaming.service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EditVideoDialogProps {
  content: Content | null;
  videoData: VideoContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type UploadState = "idle" | "uploading" | "processing" | "complete" | "error";

export function EditVideoDialog({ content, videoData, open, onOpenChange, onSuccess }: EditVideoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form data
  const [formData, setFormData] = useState({ title: "", description: "" });

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoUploadState, setVideoUploadState] = useState<UploadState>("idle");
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadResult, setVideoUploadResult] = useState<UploadResult | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState(0);

  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [thumbnailUploadResult, setThumbnailUploadResult] = useState<UploadResult | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string>("");

  const [copiedUrl, setCopiedUrl] = useState(false);

  // Refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (videoData && open) {
      setFormData({ title: videoData.title || "", description: videoData.description || "" });
      setExistingVideoUrl(videoData.url || "");
      setExistingThumbnailUrl(videoData.thumbnailUrl || "");
      setVideoDuration(videoData.durationInSeconds || 0);
      // Mark as complete since we have existing data
      if (videoData.url) {
        setVideoUploadState("complete");
        setVideoUploadResult({ url: videoData.url, filename: "existing-video", size: 0, mimeType: "video/mp4" });
      }
    }
  }, [videoData, open]);

  const resetForm = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setVideoUploadState("idle");
    setVideoUploadProgress(0);
    setVideoUploadResult(null);
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    setThumbnailUploadResult(null);
    setFormData({ title: "", description: "" });
    setExistingVideoUrl("");
    setExistingThumbnailUrl("");
    setVideoDuration(0);
    setCopiedUrl(false);
  };

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
      setExistingVideoUrl(result.url);
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

    try {
      const result = await mediaStreamingService.uploadThumbnail(file);
      setThumbnailUploadResult(result);
      setExistingThumbnailUrl(result.url);
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

      const metadata = await mediaStreamingService.getVideoMetadata(file);
      setVideoDuration(metadata.duration);
      await uploadVideo(file);
    }
  };

  const handleCopyUrl = () => {
    const url = videoUploadResult?.url || existingVideoUrl;
    if (url) {
      navigator.clipboard.writeText(url);
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
    setExistingVideoUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content || !formData.title.trim()) {
      toast({ title: "Validation Error", description: "Video title is required", variant: "destructive" });
      return;
    }

    const finalVideoUrl = videoUploadResult?.url || existingVideoUrl;
    if (!finalVideoUrl) {
      toast({ title: "Validation Error", description: "Please upload a video first", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalThumbnailUrl = thumbnailUploadResult?.url || existingThumbnailUrl || undefined;

      await contentService.updateContent(content.id, {
        type: LessonItemType.Video,
        video: {
          title: formData.title,
          description: formData.description || undefined,
          url: finalVideoUrl,
          thumbnailUrl: finalThumbnailUrl,
          durationInSeconds: videoDuration,
        },
      });

      toast({ title: "Success", description: "Video content updated successfully" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update video content", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) resetForm();
    onOpenChange(newOpen);
  };

  const currentVideoUrl = videoUploadResult?.url || existingVideoUrl;
  const currentThumbnailUrl = thumbnailPreviewUrl || existingThumbnailUrl;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0 px-6 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Edit Video Content
            </DialogTitle>
            <DialogDescription>
              Update the video details or upload a new video file.
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
                    className="cursor-pointer transition-all hover:border-primary"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      {currentThumbnailUrl ? (
                        <img src={currentThumbnailUrl} alt="Thumbnail" className="w-24 h-14 object-cover rounded" />
                      ) : (
                        <div className="w-24 h-14 bg-muted rounded flex items-center justify-center">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{currentThumbnailUrl ? "Change thumbnail" : "Upload thumbnail"}</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 2MB</p>
                      </div>
                    </CardContent>
                  </Card>

                  <input ref={thumbnailInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleThumbnailSelect} />
                </div>
              </div>

              {/* Right Column - Video Upload/Preview */}
              <div className="space-y-4">
                {!videoFile && !existingVideoUrl ? (
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
                        {videoPreviewUrl ? (
                          <video src={videoPreviewUrl} className="w-full h-full object-contain" controls={videoUploadState === "complete"} muted />
                        ) : existingVideoUrl ? (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <div className="text-center">
                              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Current video</p>
                            </div>
                          </div>
                        ) : null}
                        {videoUploadState === "uploading" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Uploading... {videoUploadProgress}%</p>
                            </div>
                          </div>
                        )}
                        {videoUploadState === "processing" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Processing video...</p>
                            </div>
                          </div>
                        )}
                        <Button type="button" variant="secondary" size="icon" className="absolute top-2 right-2" onClick={removeVideo}>
                          <X className="h-4 w-4" />
                        </Button>
                        {videoDuration > 0 && (
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

                      {currentVideoUrl && (
                        <div className="p-3 border-t space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Video link</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyUrl}>
                              {copiedUrl ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <a href={currentVideoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block truncate">
                            {currentVideoUrl}
                          </a>
                          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => videoInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-2" />
                            Replace video
                          </Button>
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
            <Button type="submit" disabled={isSubmitting || !currentVideoUrl || !formData.title.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
