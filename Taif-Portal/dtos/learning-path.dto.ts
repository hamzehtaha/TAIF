/**
 * LearningPath DTOs - Matches backend LearningPath endpoints
 */

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

export interface LearningPathDetailsDto {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  totalEnrolled: number;
  durationInSeconds: number;
  createdAt: string;
  isEnrolled: boolean;
  sections: LearningPathSectionDto[];
}

export interface LearningPathSectionDto {
  id: string;
  name: string;
  description?: string;
  order: number;
  courses: LearningPathCourseDto[];
}

export interface LearningPathCourseDto {
  id: string;
  order: number;
  isRequired: boolean;
  courseId: string;
  courseName: string;
  courseDescription?: string;
  coursePhoto?: string;
  courseDurationInSeconds: number;
}

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

export interface LearningPathSectionProgressDto {
  id: string;
  name: string;
  description?: string;
  order: number;
  isCurrentSection: boolean;
  courses: LearningPathCourseProgressDto[];
}

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

export interface LearningPathEnrollmentStatusDto {
  isEnrolled: boolean;
  enrolledAt?: string;
}

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
