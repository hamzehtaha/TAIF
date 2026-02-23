/**
 * LearningPath Models - Frontend models for learning paths
 */

export interface LearningPath {
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

export interface LearningPathDetails extends LearningPath {
  sections: LearningPathSection[];
}

export interface LearningPathSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  courses: LearningPathCourse[];
}

export interface LearningPathCourse {
  id: string;
  order: number;
  isRequired: boolean;
  courseId: string;
  courseName: string;
  courseDescription?: string;
  coursePhoto?: string;
  courseDurationInSeconds: number;
}

export interface LearningPathProgress {
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
  sections: LearningPathSectionProgress[];
}

export interface LearningPathSectionProgress {
  id: string;
  name: string;
  description?: string;
  order: number;
  isCurrentSection: boolean;
  courses: LearningPathCourseProgress[];
}

export interface LearningPathCourseProgress {
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

export interface LearningPathEnrollmentStatus {
  isEnrolled: boolean;
  enrolledAt?: string;
}
