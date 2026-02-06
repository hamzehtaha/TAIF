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
export interface QuizQuestion {
  id: string;
  text?: string;
  question?: string;
  options: string[];
  correctIndex?: number;
  correctAnswerIndex?: number;
}

export interface QuestionContent {
  questions?: QuizQuestion[];
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
}

// =============================================================================
// QUIZ SUBMISSION & RESPONSE
// =============================================================================
export interface QuizAnswerRequest {
  questionId: string;
  answerIndex: number;
}

export interface SubmitQuizRequest {
  lessonItemId: string;
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

// =============================================================================
// LESSON ITEM TYPE MAPPING
// =============================================================================
export type LessonItemType = "video" | "text" | "question";

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
