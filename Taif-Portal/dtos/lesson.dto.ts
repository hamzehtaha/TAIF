/**
 * Backend DTO - Matches backend Lesson entity
 */
export interface LessonDto {
  id: string;
  title: string;
  photo?: string;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  order?: number;
  duration?: number;
}

export interface LessonsResponseDto {
  lessons: LessonDto[];
}

export interface CreateLessonRequest {
  title: string;
  photo?: string;
  courseId: string;
}

export interface UpdateLessonRequest {
  title?: string;
  photo?: string;
}
