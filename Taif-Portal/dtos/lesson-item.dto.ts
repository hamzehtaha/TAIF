/**
 * Backend DTO - Matches backend LessonItem entity
 */
export interface LessonItemDto {
  id: string;
  name: string;
  description?: string;
  contentId?: string;
  content?: object;
  type: number; // 0 = Video, 1 = RichText, 2 = Quiz (LessonItemType enum)
  lessonId: string;
  order: number;
  durationInSeconds: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface CreateLessonItemRequest {
  name: string;
  description?: string;
  contentId: string;
  type: number;
  lessonId: string;
  durationInSeconds?: number;
}

export interface UpdateLessonItemRequest {
  name?: string;
  description?: string;
  contentId?: string;
  type?: number;
  lessonId?: string;
  durationInSeconds?: number;
}

export interface LessonItemWithProgressDto {
  id: string;
  name: string;
  description?: string;
  contentId?: string;
  content?: object;
  type: number;
  order: number;
  durationInSeconds: number;
  isCompleted: boolean;
}