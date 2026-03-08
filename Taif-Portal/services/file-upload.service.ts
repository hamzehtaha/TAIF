import { httpService } from "./http.service";

export interface FileUploadResult {
  url: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export type ImageFolder = "courses" | "lessons" | "lesson-items";

class FileUploadService {
  private readonly basePath = "/api/files";

  /**
   * Upload an image file
   */
  async uploadImage(file: File, folder?: ImageFolder): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const url = folder 
      ? `${this.basePath}/upload/image?folder=${folder}`
      : `${this.basePath}/upload/image`;

    return httpService.postFormData<FileUploadResult>(url, formData);
  }

  /**
   * Upload a course thumbnail
   */
  async uploadCourseThumbnail(file: File): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    return httpService.postFormData<FileUploadResult>(`${this.basePath}/upload/course-thumbnail`, formData);
  }

  /**
   * Upload a lesson thumbnail
   */
  async uploadLessonThumbnail(file: File): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    return httpService.postFormData<FileUploadResult>(`${this.basePath}/upload/lesson-thumbnail`, formData);
  }

  /**
   * Upload a lesson item image
   */
  async uploadLessonItemImage(file: File): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    return httpService.postFormData<FileUploadResult>(`${this.basePath}/upload/lesson-item-image`, formData);
  }

  /**
   * Delete an uploaded file
   */
  async deleteFile(fileUrl: string): Promise<void> {
    await httpService.delete(`${this.basePath}?fileUrl=${encodeURIComponent(fileUrl)}`);
  }

  /**
   * Get full URL for an uploaded file (handles relative URLs)
   */
  getFullUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // For relative URLs from our server, prepend the API base URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${url}`;
  }

  /**
   * Validate file before upload
   */
  validateImageFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG" };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();
