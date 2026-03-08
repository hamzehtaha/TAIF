/**
 * DTOs for the Course Builder bulk course creation
 */

export interface CreateFullCourseRequest {
  name: string;
  description?: string;
  photo?: string;
  categoryId: string;
  tags: string[];
  lessons: CreateFullCourseLessonRequest[];
}

export interface CreateFullCourseLessonRequest {
  title: string;
  description?: string;
  photo?: string;
  instructorId?: string;
  order: number;
  items: CreateFullCourseLessonItemRequest[];
}

export interface CreateFullCourseLessonItemRequest {
  name: string;
  description?: string;
  type: number; // 0=Video, 1=RichContent, 2=Quiz
  order: number;
  durationInSeconds: number;
  contentId?: string; // Use existing content
  content?: CreateFullCourseContentRequest; // Create new content inline
}

export interface CreateFullCourseContentRequest {
  video?: CreateFullCourseVideoContent;
  richText?: CreateFullCourseRichTextContent;
  quiz?: CreateFullCourseQuizContent;
}

export interface CreateFullCourseVideoContent {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationInSeconds: number;
  videoAssetId?: string;
  playbackId?: string;
  provider?: string;
}

export interface CreateFullCourseRichTextContent {
  title: string;
  htmlContent: string;
}

export interface CreateFullCourseQuizContent {
  title: string;
  description?: string;
  questions: CreateFullCourseQuizQuestion[];
}

export interface CreateFullCourseQuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface CreateFullCourseResponse {
  courseId: string;
  courseName: string;
  lessonsCreated: number;
  lessonItemsCreated: number;
  contentsCreated: number;
  createdAt: string;
}
