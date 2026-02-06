/**
 * Backend DTO - Matches backend Course entity
 */
export interface CourseDto {
  id: string;
  name: string;
  description: string;
  photo: string;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  rating?: number;
  reviewCount?: number;
  durationInMinutes?: number;
  isRecommended?: boolean;
  progress?: number;
}

export interface CoursesResponseDto {
  courses: CourseDto[];
}

export interface CreateCourseRequest {
  name: string;
  description: string;
  photo: string;
  categoryId: string;
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  photo?: string;
}
