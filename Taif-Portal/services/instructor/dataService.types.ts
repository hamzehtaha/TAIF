/**
 * Data Service Types for Instructor Portal
 * 
 * Shared types and interfaces used by both mock and real data services.
 */

import {
  Instructor,
  InstructorCourse,
  InstructorLesson,
  InstructorLessonItem,
  DashboardStats,
  Category,
  CourseReview,
  ReviewStats,
  VideoContent,
  RichContent,
  QuestionWithAnswers,
  Answer,
  CourseStatus,
  LessonItemType,
} from '@/types/instructor';

// ============================================
// Input Types for Create/Update Operations
// ============================================

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

export interface CreateAnswerInput {
  text: string;
  isCorrect: boolean;
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

export interface CreateLessonItemInput {
  title: string;
  description?: string;
  type: LessonItemType;
  lessonId?: string;
  videoContentId?: string;
  richContentId?: string;
  questionId?: string;
}

export interface UpdateLessonItemInput {
  title?: string;
  description?: string;
  order?: number;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  courseId?: string;
  itemIds?: string[];
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
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

export interface UpdateInstructorInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  expertise?: string[];
}

// ============================================
// Data Service Interface
// ============================================

export interface IDataService {
  // Instructor
  getInstructor(): Promise<Instructor>;
  updateInstructor(input: UpdateInstructorInput): Promise<Instructor>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  
  // Courses
  getCourses(): Promise<InstructorCourse[]>;
  getCourseById(id: string): Promise<InstructorCourse | null>;
  createCourse(input: CreateCourseInput): Promise<InstructorCourse>;
  updateCourse(id: string, input: UpdateCourseInput): Promise<InstructorCourse | null>;
  deleteCourse(id: string): Promise<boolean>;
  publishCourse(id: string): Promise<InstructorCourse | null>;
  archiveCourse(id: string): Promise<InstructorCourse | null>;
  unpublishCourse(id: string): Promise<InstructorCourse | null>;
  addLessonsToCourse(courseId: string, lessonIds: string[]): Promise<InstructorCourse | null>;
  removeLessonFromCourse(courseId: string, lessonId: string): Promise<InstructorCourse | null>;
  reorderCourseLessons(courseId: string, lessonIds: string[]): Promise<InstructorCourse | null>;
  
  // Lessons
  getLessons(): Promise<InstructorLesson[]>;
  getLessonById(id: string): Promise<InstructorLesson | null>;
  createLesson(input: CreateLessonInput): Promise<InstructorLesson>;
  updateLesson(id: string, input: UpdateLessonInput): Promise<InstructorLesson | null>;
  deleteLesson(id: string): Promise<boolean>;
  addItemsToLesson(lessonId: string, itemIds: string[]): Promise<InstructorLesson | null>;
  removeItemFromLesson(lessonId: string, itemId: string): Promise<InstructorLesson | null>;
  reorderLessonItems(lessonId: string, itemIds: string[]): Promise<InstructorLesson | null>;
  
  // Lesson Items
  getLessonItems(): Promise<InstructorLessonItem[]>;
  getLessonItemById(id: string): Promise<InstructorLessonItem | null>;
  createLessonItem(input: CreateLessonItemInput): Promise<InstructorLessonItem>;
  updateLessonItem(id: string, input: UpdateLessonItemInput): Promise<InstructorLessonItem | null>;
  deleteLessonItem(id: string): Promise<boolean>;
  
  // Videos
  getVideos(): Promise<VideoContent[]>;
  getVideoById(id: string): Promise<VideoContent | null>;
  createVideo(input: CreateVideoInput): Promise<VideoContent>;
  updateVideo(id: string, input: UpdateVideoInput): Promise<VideoContent | null>;
  deleteVideo(id: string): Promise<boolean>;
  
  // Rich Content
  getRichContents(): Promise<RichContent[]>;
  getRichContentById(id: string): Promise<RichContent | null>;
  createRichContent(input: CreateRichContentInput): Promise<RichContent>;
  updateRichContent(id: string, input: UpdateRichContentInput): Promise<RichContent | null>;
  deleteRichContent(id: string): Promise<boolean>;
  
  // Questions
  getQuestions(): Promise<QuestionWithAnswers[]>;
  getQuestionById(id: string): Promise<QuestionWithAnswers | null>;
  createQuestion(input: CreateQuestionInput): Promise<QuestionWithAnswers>;
  updateQuestion(id: string, input: UpdateQuestionInput): Promise<QuestionWithAnswers | null>;
  deleteQuestion(id: string): Promise<boolean>;
  
  // Reviews
  getReviewsByCourse(courseId: string): Promise<CourseReview[]>;
  getReviewStats(courseId: string): Promise<ReviewStats>;
}
