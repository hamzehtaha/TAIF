/**
 * Lesson Item Content Types
 * 
 * This file contains all content type definitions for lesson items.
 * When the backend updates the structure of any lesson item type,
 * only update the corresponding interface here.
 * 
 * The frontend components and parsing logic are designed to handle
 * these types automatically via the lessonItemService.parseContent() helper.
 */

import { LessonItemType } from "@/enums/lesson-item-type.enum";

// =============================================================================
// VIDEO CONTENT (type: 0 / "video")
// =============================================================================
export interface VideoContent {
  url: string;
  description?: string;
}

// =============================================================================
// RICH TEXT CONTENT (type: 1 / "text")
// =============================================================================
export interface RichTextContent {
  text?: string;
  html?: string;
}

// =============================================================================
// QUIZ/QUESTION CONTENT (type: 2 / "question")
// =============================================================================
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText?: string;
  question?: string;
  text?: string;
  options: QuizOption[] | string[];
  correctAnswerId?: string;
  correctIndex?: number;
  correctAnswerIndex?: number;
  shuffleOptions?: boolean;
  explanation?: string;
}

export interface QuestionContent {
  title?: string;
  questions?: QuizQuestion[];
  question?: string;
  options?: QuizOption[] | string[];
  correctAnswerId?: string;
  correctAnswerIndex?: number;
}

// =============================================================================
// QUIZ SUBMISSION & RESPONSE
// =============================================================================
export interface QuizAnswerRequest {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmitQuizRequest {
  lessonItemId: string;
  lessonId?: string;
  courseId?: string;
  answers: QuizAnswerRequest[];
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
}

export interface QuizResultResponse {
  results: QuestionResult[];
  score: number;
}


/**
 * Maps backend numeric type to frontend string type
 * Backend: 0 = Video, 1 = RichText, 2 = Question
 */
export function mapLessonItemType(type: number): LessonItemType {
  switch (type) {
    case 0: return "video";
    case 1: return "text";
    case 2: return "question";
    default: return "text";
  }
}

// =============================================================================
// CONTENT PARSER
// =============================================================================
/**
 * Generic content parser that handles both string and object content.
 * Use this to safely parse lesson item content.
 */
export function parseContent<T>(content: string | object | null | undefined): T | null {
  if (!content) return null;
  
  // If already an object, return as-is
  if (typeof content === "object") {
    return content as T;
  }
  
  // If string, try to parse as JSON
  if (typeof content === "string") {
    try {
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }
  
  return null;
}
