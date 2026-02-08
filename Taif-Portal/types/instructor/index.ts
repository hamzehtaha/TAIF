/**
 * Instructor Portal Types
 * Phase 1: Frontend-only implementation
 * TODO: API Integration - Align with backend DTOs in Phase 2
 */

// ============================================
// Instructor Profile
// ============================================

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
  totalCourses?: number;
  totalStudents?: number;
  averageRating?: number;
  createdAt: string;
}

// ============================================
// Course
// ============================================

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface CourseStats {
  totalLessons: number;
  totalItems: number;
  totalEnrollments: number;
  averageRating: number;
  totalReviews: number;
}

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  categoryId: string;
  categoryName: string;
  status: CourseStatus;
  instructorId: string;
  lessons: InstructorLesson[];
  stats: CourseStats;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  thumbnail?: string;
  categoryId: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  thumbnail?: string;
  categoryId?: string;
  status?: CourseStatus;
}

// ============================================
// Lesson
// ============================================

export interface InstructorLesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId?: string; // Optional - lessons can be standalone
  items: InstructorLessonItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  courseId?: string; // Optional for standalone lessons
  itemIds?: string[]; // Pre-select items when creating
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
}

// ============================================
// Standalone Content Items (Created First)
// ============================================

// Video Content - created independently, then linked to lessons
export interface VideoContent {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration?: number;
  thumbnailUrl?: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoInput {
  title: string;
  description?: string;
  videoUrl: string;
  duration?: number;
  thumbnailUrl?: string;
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  thumbnailUrl?: string;
}

// Rich Content - created independently, then linked to lessons
export interface RichContent {
  id: string;
  title: string;
  description?: string;
  htmlContent: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRichContentInput {
  title: string;
  description?: string;
  htmlContent: string;
}

export interface UpdateRichContentInput {
  title?: string;
  description?: string;
  htmlContent?: string;
}

// Question with Answers - created independently, then linked to lessons
export interface QuestionWithAnswers {
  id: string;
  text: string;
  description?: string;
  type: 'multiple-choice' | 'true-false';
  answers: Answer[];
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface CreateQuestionInput {
  text: string;
  description?: string;
  type?: 'multiple-choice' | 'true-false';
  answers: CreateAnswerInput[];
}

export interface UpdateQuestionInput {
  text?: string;
  description?: string;
  type?: 'multiple-choice' | 'true-false';
  answers?: Answer[];
}

export interface CreateAnswerInput {
  text: string;
  isCorrect: boolean;
}

// ============================================
// Lesson Items (References to Content)
// ============================================

export type LessonItemType = 'video' | 'rich-content' | 'question';

export interface BaseLessonItem {
  id: string;
  title: string;
  description?: string;
  type: LessonItemType;
  order: number;
  lessonId?: string; // Optional - items can be standalone
  createdAt: string;
  updatedAt: string;
}

export interface VideoLessonItem extends BaseLessonItem {
  type: 'video';
  videoContentId: string;
  videoContent?: VideoContent;
}

export interface RichContentLessonItem extends BaseLessonItem {
  type: 'rich-content';
  richContentId: string;
  richContent?: RichContent;
}

export interface QuestionLessonItem extends BaseLessonItem {
  type: 'question';
  questionId: string;
  question?: QuestionWithAnswers;
}

export type InstructorLessonItem = 
  | VideoLessonItem 
  | RichContentLessonItem 
  | QuestionLessonItem;

export interface CreateLessonItemInput {
  title: string;
  description?: string;
  type: LessonItemType;
  lessonId?: string; // Optional for standalone items
  videoContentId?: string;
  richContentId?: string;
  questionId?: string;
}

export interface UpdateLessonItemInput {
  title?: string;
  order?: number;
}

// ============================================
// Reviews
// ============================================

export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  totalReviews: number;
  averageRating: number;
  recentActivity: ActivityItem[];
  popularCourses: { courseId: string; courseName: string; enrollments: number }[];
}

export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'review' | 'course_published' | 'lesson_added';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Category (for course creation)
// ============================================

export interface Category {
  id: string;
  name: string;
  description?: string;
}
