export interface CreateLessonItemRequest {
  name: string;
  description?: string;
  contentId: string;
  type: number;
  lessonId: string;
  durationInSeconds?: number;
}
