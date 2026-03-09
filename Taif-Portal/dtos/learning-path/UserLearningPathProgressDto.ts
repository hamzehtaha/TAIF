export interface UserLearningPathProgressDto {
  id: string;
  userId: string;
  learningPathId: string;
  enrolledAt: string;
  completedDuration: number;
  currentSectionId?: string;
  currentCourseId?: string;
  isCompleted: boolean;
  completedAt?: string;
}
