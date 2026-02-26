"use client";

import { useState } from "react";
import { Video, Upload, Loader2 } from "lucide-react";
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
import { contentService, LessonItemType } from "@/services/content.service";
import { useToast } from "@/hooks/use-toast";

interface CreateVideoDialogProps {
  onSuccess?: () => void;
}

export function CreateVideoDialog({ onSuccess }: CreateVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    thumbnailUrl: "",
    durationInSeconds: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Video title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.url) {
      toast({
        title: "Validation Error",
        description: "Video URL is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await contentService.createContent({
        type: LessonItemType.Video,
        video: {
          title: formData.title,
          url: formData.url,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          durationInSeconds: formData.durationInSeconds,
        },
      });

      toast({
        title: "Success",
        description: "Video content created successfully",
      });

      setFormData({
        title: "",
        url: "",
        thumbnailUrl: "",
        durationInSeconds: 0,
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create video content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Video className="h-4 w-4 mr-2" />
          Create Video Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Video Content</DialogTitle>
            <DialogDescription>
              Add a new video to your content library. This will be stored in the Content table.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Introduction to React"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Video URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com/video.mp4"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://example.com/thumbnail.jpg"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                placeholder="0"
                value={formData.durationInSeconds}
                onChange={(e) => setFormData({ ...formData, durationInSeconds: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Enter the video duration in seconds (e.g., 300 for 5 minutes)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
