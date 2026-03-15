"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mediaStreamingService, UploadResult } from "@/services/media-streaming.service";
import { fileUploadService } from "@/services/file-upload.service";

interface ThumbnailUploadProps {
  /** Current thumbnail URL */
  value?: string;
  /** Called when thumbnail changes */
  onChange?: (url: string) => void;
  /** Called when file is selected (for deferred upload) */
  onFileSelect?: (file: File | null) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Whether to upload immediately or defer */
  deferUpload?: boolean;
  /** Custom class name */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Show compact mode */
  compact?: boolean;
}

export function ThumbnailUpload({
  value,
  onChange,
  onFileSelect,
  onError,
  deferUpload = false,
  className,
  disabled = false,
  placeholder = "Upload thumbnail",
  compact = false,
}: ThumbnailUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || value;

  const handleFile = useCallback(async (file: File) => {
    if (!mediaStreamingService.isValidImageFile(file)) {
      onError?.("Invalid file type. Please select JPG, PNG, GIF or WebP.");
      return;
    }

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    onFileSelect?.(file);

    if (!deferUpload) {
      setIsUploading(true);
      try {
        const result = await mediaStreamingService.uploadThumbnail(file);
        onChange?.(result.url);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  }, [previewUrl, deferUpload, onChange, onFileSelect, onError]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    onChange?.("");
    onFileSelect?.(null);
  }, [previewUrl, onChange, onFileSelect]);

  // Method to trigger upload for deferred mode
  const triggerUpload = useCallback(async (): Promise<string | null> => {
    if (!selectedFile) return value || null;
    
    setIsUploading(true);
    try {
      const result = await mediaStreamingService.uploadThumbnail(selectedFile);
      onChange?.(result.url);
      return result.url;
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed");
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, value, onChange, onError]);

  if (compact) {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-primary",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
      >
        <CardContent className="p-4 flex items-center gap-4">
          {displayUrl ? (
            <img 
              src={displayUrl.startsWith('blob:') ? displayUrl : fileUploadService.getFullUrl(displayUrl)} 
              alt="Thumbnail" 
              className="w-24 h-14 object-cover rounded" 
            />
          ) : (
            <div className="w-24 h-14 bg-muted rounded flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{placeholder}</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 2MB</p>
          </div>
          {displayUrl && !disabled && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
        <input 
          ref={inputRef} 
          type="file" 
          accept="image/jpeg,image/png,image/gif,image/webp" 
          className="hidden" 
          onChange={handleInputChange}
          disabled={disabled || isUploading}
        />
      </Card>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg overflow-hidden cursor-pointer transition-colors aspect-video",
          "hover:border-primary hover:bg-muted/50",
          displayUrl && "border-transparent",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl.startsWith('blob:') ? displayUrl : fileUploadService.getFullUrl(displayUrl)}
              alt="Thumbnail"
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
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin mb-2" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-muted mb-2">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-sm text-center">{placeholder}</span>
                <span className="text-xs text-muted-foreground/70 mt-1">
                  JPG, PNG, GIF, WebP (max 2MB)
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ThumbnailUpload;
