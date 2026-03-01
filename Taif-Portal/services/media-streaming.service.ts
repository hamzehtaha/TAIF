/**
 * Mock Media Streaming Service
 * Simulates video and image upload functionality
 * Returns mock URLs after a simulated upload delay
 */

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  duration?: number;
  mimeType: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  thumbnailUrl?: string;
}

class MediaStreamingService {
  private baseUrl = "https://media.taif-platform.com";

  /**
   * Simulates uploading a video file
   * Returns a mock streaming URL after simulated processing
   */
  async uploadVideo(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const duration = await this.getVideoDuration(file);
    
    await this.simulateUpload(file.size, onProgress);

    const fileId = this.generateFileId();
    const extension = file.name.split('.').pop() || 'mp4';
    
    return {
      url: `${this.baseUrl}/stream/videos/${fileId}.${extension}`,
      filename: file.name,
      size: file.size,
      duration: duration,
      mimeType: file.type || 'video/mp4',
    };
  }

  /**
   * Simulates uploading a thumbnail image
   * Returns a mock CDN URL after simulated processing
   */
  async uploadThumbnail(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    await this.simulateUpload(file.size, onProgress);

    const fileId = this.generateFileId();
    const extension = file.name.split('.').pop() || 'jpg';
    
    return {
      url: `${this.baseUrl}/thumbnails/${fileId}.${extension}`,
      filename: file.name,
      size: file.size,
      mimeType: file.type || 'image/jpeg',
    };
  }

  /**
   * Gets video duration from file
   */
  async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
      
      video.onerror = () => {
        resolve(0);
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Gets video metadata including dimensions
   */
  async getVideoMetadata(file: File): Promise<VideoMetadata> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          duration: Math.round(video.duration),
          width: video.videoWidth,
          height: video.videoHeight,
        };
        window.URL.revokeObjectURL(video.src);
        resolve(metadata);
      };
      
      video.onerror = () => {
        resolve({ duration: 0, width: 0, height: 0 });
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generates a thumbnail from a video file at a specific time
   */
  async generateThumbnailFromVideo(file: File, timeInSeconds: number = 1): Promise<Blob | null> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      
      video.onloadeddata = () => {
        video.currentTime = Math.min(timeInSeconds, video.duration);
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            window.URL.revokeObjectURL(video.src);
            resolve(blob);
          }, 'image/jpeg', 0.8);
        } else {
          resolve(null);
        }
      };
      
      video.onerror = () => {
        resolve(null);
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validates if a file is a valid video
   */
  isValidVideoFile(file: File): boolean {
    const validTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ];
    return validTypes.includes(file.type) || /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(file.name);
  }

  /**
   * Validates if a file is a valid image
   */
  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type) || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formats duration in seconds to MM:SS or HH:MM:SS
   */
  formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Simulates upload progress
   */
  private async simulateUpload(
    fileSize: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    const chunkSize = fileSize / 20;
    let loaded = 0;
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        loaded += chunkSize;
        if (loaded >= fileSize) {
          loaded = fileSize;
          clearInterval(interval);
          
          if (onProgress) {
            onProgress({ loaded, total: fileSize, percentage: 100 });
          }
          
          setTimeout(resolve, 200);
        } else if (onProgress) {
          onProgress({
            loaded,
            total: fileSize,
            percentage: Math.round((loaded / fileSize) * 100),
          });
        }
      }, 100);
    });
  }

  /**
   * Generates a unique file ID
   */
  private generateFileId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  }
}

export const mediaStreamingService = new MediaStreamingService();
