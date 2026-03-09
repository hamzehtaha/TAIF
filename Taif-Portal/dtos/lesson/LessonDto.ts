/**
 * Backend DTO - Matches backend Lesson entity
 */
export interface LessonDto {
  id: string;
  title: string;
  description?: string;
  photo?: string;
  courseId: string;
  instructorId?: string;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    bio?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  order?: number;
  duration?: number;
}
