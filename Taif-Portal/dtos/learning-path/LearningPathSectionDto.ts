import { LearningPathCourseDto } from './index';

export interface LearningPathSectionDto {
  id: string;
  name: string;
  description?: string;
  order: number;
  courses: LearningPathCourseDto[];
}
