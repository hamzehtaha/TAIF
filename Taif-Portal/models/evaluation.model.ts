export interface EvaluationAnswer {
  id: string;
  evaluationQuestionId?: string;
  text: string;
  score: number;
}

export interface EvaluationQuestion {
  id: string;
  text: string;
  answers: EvaluationAnswer[];
}

export interface QuestionMapping {
  questionId: string;
  order: number;
}

export interface Evaluation {
  id: string;
  name: string;
  description?: string;
  interestId?: string;
  questionMappings: QuestionMapping[];
  organizationId?: string;
}

export interface CreateEvaluationQuestionRequest {
  text: string;
  answers: Omit<EvaluationAnswer, 'id' | 'evaluationQuestionId'>[];
}

export interface UpdateEvaluationQuestionRequest {
  text?: string;
}

export interface CreateEvaluationAnswerRequest {
  evaluationQuestionId: string;
  text: string;
  score: number;
}

export interface UpdateEvaluationAnswerRequest {
  text?: string;
  score?: number;
}

export interface CreateEvaluationRequest {
  name: string;
  description?: string;
  interestId?: string;
  questionMappings?: QuestionMapping[];
}

export interface UpdateEvaluationRequest {
  name?: string;
  description?: string;
  interestId?: string;
  questionMappings?: QuestionMapping[];
}

export interface QuestionEvaluationResult {
  questionId: string;
  selectedAnswerId: string;
  percentage: number;
}

export interface EvaluationJsonResult {
  questions: QuestionEvaluationResult[];
  totalPercentage: number;
  strengthSkillIds: string[];
  weaknessSkillIds: string[];
}

export interface UserEvaluation {
  id: string;
  userId: string;
  result: EvaluationJsonResult;
  organizationId?: string;
}

export interface EvaluationAnswerSubmission {
  questionId: string;
  answerId: string;
}

export interface SubmitEvaluationRequest {
  answers: EvaluationAnswerSubmission[];
}

export interface SubmitEvaluationResponse {
  evaluationId: string;
  totalPercentage: number;
  completedAt: string;
  strengthSkillIds: string[];
  weaknessSkillIds: string[];
  questions: QuestionEvaluationResult[];
}

export interface UserEvaluationResponse {
  id: string;
  userId: string;
  organizationId?: string;
  totalPercentage: number;
  completedAt: string;
}
