/**
 * API Types - Aligned with Server-API entities
 * These types match the backend C# entities for seamless integration
 */

// Enums matching backend
export enum LessonItemType {
  Video = 0,
  RichText = 1,
  Question = 2,
}

export enum CourseStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum UserRole {
  Student = 'student',
  Instructor = 'instructor',
  Admin = 'admin',
}

// Base entity matching backend Base.cs
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Category
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  photo?: string;
}

// Course - aligned with backend Course.cs
export interface Course extends BaseEntity {
  name: string;
  description?: string;
  photo?: string;
  categoryId: string;
  category?: Category;
  tags: string[];
  status?: CourseStatus;
  instructorId?: string;
}

// Lesson - aligned with backend Lesson.cs
export interface Lesson extends BaseEntity {
  title: string;
  courseId?: string;
  course?: Course;
  photo?: string;
  order: number;
  description?: string;
  lessonItems?: LessonItem[];
}

// LessonItem - aligned with backend LessonItem.cs
export interface LessonItem extends BaseEntity {
  name: string;
  type: LessonItemType;
  content: string;
  lessonId?: string;
  lesson?: Lesson;
  order: number;
  durationInSeconds: number;
}

// User - aligned with backend User.cs
export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  birthday?: string;
  isActive: boolean;
  interests: string[];
  role?: UserRole;
  avatar?: string;
}

// Instructor (extended User for instructor portal)
export interface Instructor extends User {
  bio?: string;
  specialization?: string;
  totalCourses?: number;
  totalStudents?: number;
}

// Review
export interface Review extends BaseEntity {
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
  user?: User;
}

// Enrollment
export interface Enrollment extends BaseEntity {
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
}

// Stats
export interface CourseStats {
  totalEnrollments: number;
  totalLessons: number;
  totalItems: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  totalReviews: number;
  averageRating: number;
  recentEnrollments: number;
}

// Request DTOs - matching backend DTOs
export interface CreateCourseRequest {
  name: string;
  description?: string;
  photo?: string;
  categoryId: string;
  tags?: string[];
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  photo?: string;
  categoryId?: string;
  tags?: string[];
  status?: CourseStatus;
}

export interface CreateLessonRequest {
  title: string;
  courseId?: string;
  photo?: string;
  description?: string;
  order?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  photo?: string;
  description?: string;
  order?: number;
}

export interface CreateLessonItemRequest {
  name: string;
  type: LessonItemType;
  content: string;
  lessonId?: string;
  order?: number;
  durationInSeconds?: number;
}

export interface UpdateLessonItemRequest {
  name?: string;
  type?: LessonItemType;
  content?: string;
  order?: number;
  durationInSeconds?: number;
}

// Reorder requests (new - to be added to backend)
export interface ReorderLessonsRequest {
  lessonIds: string[];
}

export interface ReorderLessonItemsRequest {
  lessonItemIds: string[];
}

export interface AddLessonsToCourseRequest {
  lessonIds: string[];
}

export interface AddItemsToLessonRequest {
  lessonItemIds: string[];
}

// Course with full details (for instructor portal)
export interface CourseWithDetails extends Course {
  lessons: LessonWithItems[];
  stats: CourseStats;
}

export interface LessonWithItems extends Lesson {
  lessonItems: LessonItem[];
}
