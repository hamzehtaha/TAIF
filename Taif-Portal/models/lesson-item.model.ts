import { LessonItemType } from "@/enums/lesson-item-type.enum";

export interface LessonItem {
  id: string;
  lessonId?: string;
  name: string;
  description?: string;
  contentId?: string;
  content?: object;
  type: LessonItemType;
  durationInSeconds: number;
  order: number;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}