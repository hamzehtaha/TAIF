/**
 * Backend DTOs - Matches backend Enrollment endpoints
 */

export interface EnrollmentDto {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  isFavourite: boolean;
  lastLessonItemId?: string;
  completedDurationInSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface EnrollRequest {
  courseId: string;
}

export interface ToggleFavouriteRequest {
  courseId: string;
}
