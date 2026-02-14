/**
 * Backend DTOs - Matches backend Quiz submission endpoints
 */

export interface QuizAnswerRequest {
  questionId: string;
  answerIndex: number;
}

export interface SubmitQuizRequest {
  lessonItemId: string;
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
  answerIndex: number;
  isCorrect: boolean;
}
