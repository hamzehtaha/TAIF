/**
 * Backend DTO - Matches backend LessonItem entity
 */
export interface LessonItemDto {
  id: string;
  name: string;
  url: string;
  content: string;
  type: number; // 0 = Video, 1 = Quiz, etc. (LessonItemType enum)
  lessonId: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface CreateLessonItemRequest {
  name: string;
  url: string;
  content: string;
  type: number;
  lessonId: string;
}

export interface UpdateLessonItemRequest {
  name?: string;
  url?: string;
  content?: string;
  type?: number;
}

export interface LessonItemWithProgressDto {
  id: string;
  name: string;
  url: string;
  content: string | object;
  type: number;
  order: number;
  durationInSeconds: number;
  isCompleted: boolean;
}