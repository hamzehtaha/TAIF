export interface LearningPathCourseProgressDto {
  id: string;
  order: number;
  isRequired: boolean;
  courseId: string;
  courseName: string;
  courseDescription?: string;
  coursePhoto?: string;
  courseDurationInSeconds: number;
  isEnrolled: boolean;
  isCurrentCourse: boolean;
}
