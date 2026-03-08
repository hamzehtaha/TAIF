import { LearningPathCourseProgressDto } from './index';

export interface LearningPathSectionProgressDto {
  id: string;
  name: string;
  description?: string;
  order: number;
  isCurrentSection: boolean;
  courses: LearningPathCourseProgressDto[];
}
