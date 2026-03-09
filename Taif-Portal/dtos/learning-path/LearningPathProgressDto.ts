import { LearningPathSectionProgressDto } from './index';

export interface LearningPathProgressDto {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  durationInSeconds: number;
  createdAt: string;
  enrolledAt: string;
  completedDuration: number;
  currentSectionId?: string;
  currentCourseId?: string;
  isCompleted: boolean;
  completedAt?: string;
  sections: LearningPathSectionProgressDto[];
}
