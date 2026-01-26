/**
 * Backend DTO - Minimal fields from API
 * Only what backend actually provides
 */
export interface LessonItemDto {
  id: string;
  name: string;
  type: "video"; // Always video for now as per requirement
}

export interface LessonItemsResponseDto {
  items: LessonItemDto[];
}
