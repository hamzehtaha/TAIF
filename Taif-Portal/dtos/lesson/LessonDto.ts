/**
 * Backend DTO - Minimal fields from API
 * Only what backend actually provides
 */
export interface LessonDto {
  id: string;
  name: string;
}

export interface LessonsResponseDto {
  lessons: LessonDto[];
}
