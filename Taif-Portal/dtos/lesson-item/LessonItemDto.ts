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
