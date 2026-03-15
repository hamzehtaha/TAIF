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
