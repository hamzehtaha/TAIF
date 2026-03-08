"use client";

import React, { useState } from "react";
import { X, ZoomIn, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { fileUploadService } from "@/services/file-upload.service";

interface ImagePreviewProps {
  /** Image URL to display */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Custom class name */
  className?: string;
  /** Aspect ratio variant */
  aspectRatio?: "video" | "square" | "banner" | "auto";
  /** Whether to show zoom on click */
  zoomable?: boolean;
  /** Fallback content when no image */
  fallback?: React.ReactNode;
  /** Whether image is loading */
  loading?: boolean;
  /** Called when remove button is clicked */
  onRemove?: () => void;
  /** Whether remove button is shown */
  removable?: boolean;
  /** Object fit style */
  objectFit?: "cover" | "contain" | "fill";
}

export function ImagePreview({
  src,
  alt = "Image",
  className,
  aspectRatio = "video",
  zoomable = true,
  fallback,
  loading = false,
  onRemove,
  removable = false,
  objectFit = "cover",
}: ImagePreviewProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const aspectRatioClass = {
    video: "aspect-video",
    square: "aspect-square",
    banner: "aspect-[3/1]",
    auto: "",
  }[aspectRatio];

  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
  }[objectFit];

  const fullSrc = src ? (src.startsWith('http') || src.startsWith('blob:') ? src : fileUploadService.getFullUrl(src)) : null;

  const renderImage = (inDialog = false) => {
    if (!fullSrc || imageError) {
      return (
        <div className={cn(
          "bg-muted flex items-center justify-center",
          !inDialog && aspectRatioClass,
          inDialog && "w-full h-full"
        )}>
          {fallback || (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={cn(
        "relative overflow-hidden",
        !inDialog && aspectRatioClass,
        inDialog && "max-h-[80vh]"
      )}>
        {(loading || imageLoading) && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <img
          src={fullSrc}
          alt={alt}
          className={cn(
            "w-full h-full transition-opacity",
            objectFitClass,
            (loading || imageLoading) && "opacity-0"
          )}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
      </div>
    );
  };

  const imageContent = (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {renderImage()}
      
      {removable && onRemove && fullSrc && !imageError && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {zoomable && fullSrc && !imageError && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <ZoomIn className="h-3 w-3" />
            Click to zoom
          </div>
        </div>
      )}
    </div>
  );

  if (!zoomable || !fullSrc || imageError) {
    return imageContent;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer group">
          {imageContent}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <img
          src={fullSrc}
          alt={alt}
          className="w-full h-auto max-h-[80vh] object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}

export default ImagePreview;
