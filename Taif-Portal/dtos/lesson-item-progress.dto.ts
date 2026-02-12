/**
 * Backend DTOs - Matches backend LessonItemProgress endpoints
 */

export interface LessonItemProgressDto {
  id: string;
  userId: string;
  lessonItemId: string;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetLessonItemAsCompletedRequest {
  courseId: string;
  lessonItemId: string;
}

