export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  isCompleted?: boolean;
  photo?: string;
  courseId: string;
}