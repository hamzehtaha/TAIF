"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fileUploadService, ImageFolder } from "@/services/file-upload.service";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  folder?: ImageFolder;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  aspectRatio?: "video" | "square" | "banner";
}

export function ImageUpload({
  value,
  onChange,
  onError,
  folder,
  className,
  disabled = false,
  placeholder = "Click or drag to upload image",
  aspectRatio = "video",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    video: "aspect-video",
    square: "aspect-square",
    banner: "aspect-[3/1]",
  }[aspectRatio];

  const handleFile = useCallback(async (file: File) => {
    const validation = fileUploadService.validateImageFile(file);
    if (!validation.valid) {
      onError?.(validation.error || "Invalid file");
      return;
    }

    setIsUploading(true);
    try {
      const result = await fileUploadService.uploadImage(file, folder);
      // Store relative path in DB, not full URL
      onChange(result.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      onError?.(message);
    } finally {
      setIsUploading(false);
    }
  }, [folder, onChange, onError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, isUploading, handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg overflow-hidden cursor-pointer transition-colors",
          aspectRatioClass,
          dragActive && "border-primary bg-primary/5",
          !dragActive && !value && "border-muted-foreground/25 hover:border-muted-foreground/50",
          value && "border-transparent",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "cursor-wait"
        )}
      >
        {value ? (
          <>
            <img
              src={fileUploadService.getFullUrl(value)}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin mb-2" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-muted mb-2">
                  {dragActive ? (
                    <Upload className="h-6 w-6" />
                  ) : (
                    <ImageIcon className="h-6 w-6" />
                  )}
                </div>
                <span className="text-sm text-center px-4">{placeholder}</span>
                <span className="text-xs text-muted-foreground/70 mt-1">
                  JPG, PNG, GIF, WebP (max 10MB)
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;
