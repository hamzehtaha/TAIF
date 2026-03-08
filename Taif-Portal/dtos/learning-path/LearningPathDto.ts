export interface LearningPathDto {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  totalEnrolled: number;
  durationInSeconds: number;
  totalSections: number;
  totalCourses: number;
  createdAt: string;
  isEnrolled: boolean;
}
