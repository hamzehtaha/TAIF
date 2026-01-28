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

export interface LessonItemsResponseDto {
  items: LessonItemDto[];
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
