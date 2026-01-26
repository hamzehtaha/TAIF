/**
 * Backend DTO - Minimal fields from API
 * Only what backend actually provides
 */
export interface CourseDto {
  id: string;
  name: string;
}

export interface CoursesResponseDto {
  courses: CourseDto[];
}
