/**
 * Backend DTOs - Matches backend Quiz submission endpoints
 */

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

export interface QuestionAnswerResult {
  questionId: string;
  isCorrect: boolean;
}

export interface QuizResultResponse {
  results: QuestionAnswerResult[];
  score: number;
}

export interface QuizSubmissionDto {
  id: string;
  userId: string;
  lessonItemId: string;
  answersJson: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAnswerPayload {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}
