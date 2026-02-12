import { LessonItemType } from "@/enums/lesson-item-type.enum";

export interface LessonItem {
  id: string;
  lessonId: string;
  name: string;
  url: string;
  content: string | object;
  type: LessonItemType;
  durationInSeconds: number;
  order: number;
  isCompleted: boolean;
}