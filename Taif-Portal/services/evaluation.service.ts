import { httpService } from "./http.service";
import {
  Evaluation,
  EvaluationQuestion,
  EvaluationAnswer,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  CreateEvaluationQuestionRequest,
  UpdateEvaluationQuestionRequest,
  CreateEvaluationAnswerRequest,
  UpdateEvaluationAnswerRequest,
  UserEvaluation,
  EvaluationJsonResult,
  SubmitEvaluationRequest,
  SubmitEvaluationResponse,
  UserEvaluationResponse,
} from "@/models/evaluation.model";

class EvaluationService {
  private readonly evaluationPath = "/api/evaluation";
  private readonly questionPath = "/api/evaluationquestion";
  private readonly answerPath = "/api/evaluationanswer";
  private readonly userEvaluationPath = "/api/userevaluations";

  // ==================== EVALUATIONS ====================

  async getAllEvaluations(): Promise<Evaluation[]> {
    return httpService.get<Evaluation[]>(this.evaluationPath);
  }

  async getEvaluationById(id: string): Promise<Evaluation> {
    return httpService.get<Evaluation>(`${this.evaluationPath}/${id}`);
  }

  async createEvaluation(data: CreateEvaluationRequest): Promise<Evaluation> {
    return httpService.post<Evaluation>(this.evaluationPath, data);
  }

  async updateEvaluation(id: string, data: UpdateEvaluationRequest): Promise<Evaluation> {
    return httpService.put<Evaluation>(`${this.evaluationPath}/${id}`, data);
  }

  async deleteEvaluation(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`${this.evaluationPath}/${id}`);
  }

  async getEvaluationByInterest(interestId: string): Promise<Evaluation | null> {
    try {
      return await httpService.get<Evaluation>(`${this.evaluationPath}/interest/${interestId}`);
    } catch {
      return null;
    }
  }

  async getEvaluationsByInterests(interestIds: string[]): Promise<Evaluation[]> {
    if (interestIds.length === 0) return [];
    const params = interestIds.map((id) => `interestIds=${id}`).join("&");
    try {
      return await httpService.get<Evaluation[]>(`${this.evaluationPath}/by-interests?${params}`);
    } catch {
      return [];
    }
  }

  // ==================== EVALUATION QUESTIONS ====================

  async getAllQuestionsWithAnswers(): Promise<EvaluationQuestion[]> {
    return httpService.get<EvaluationQuestion[]>(this.questionPath);
  }

  async getQuestionById(id: string): Promise<EvaluationQuestion> {
    return httpService.get<EvaluationQuestion>(`${this.questionPath}/${id}`);
  }

  async createQuestion(data: CreateEvaluationQuestionRequest): Promise<EvaluationQuestion> {
    return httpService.post<EvaluationQuestion>(this.questionPath, data);
  }

  async updateQuestion(id: string, data: UpdateEvaluationQuestionRequest): Promise<EvaluationQuestion> {
    return httpService.put<EvaluationQuestion>(`${this.questionPath}/${id}`, data);
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`${this.questionPath}/${id}`);
  }

  // ==================== EVALUATION ANSWERS ====================

  async getAnswersByQuestionId(questionId: string): Promise<EvaluationAnswer[]> {
    return httpService.get<EvaluationAnswer[]>(`${this.answerPath}/question/${questionId}`);
  }

  async createAnswer(data: CreateEvaluationAnswerRequest): Promise<EvaluationAnswer> {
    return httpService.post<EvaluationAnswer>(this.answerPath, data);
  }

  async updateAnswer(id: string, data: UpdateEvaluationAnswerRequest): Promise<EvaluationAnswer> {
    return httpService.put<EvaluationAnswer>(`${this.answerPath}/${id}`, data);
  }

  async deleteAnswer(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`${this.answerPath}/${id}`);
  }

  // ==================== USER EVALUATIONS ====================

  async getAllUserEvaluations(): Promise<UserEvaluation[]> {
    return httpService.get<UserEvaluation[]>(this.userEvaluationPath);
  }

  async getUserEvaluationById(id: string): Promise<UserEvaluationResponse> {
    return httpService.get<UserEvaluationResponse>(`${this.userEvaluationPath}/${id}`);
  }

  async getUserEvaluationsByUserId(userId: string): Promise<UserEvaluationResponse[]> {
    return httpService.get<UserEvaluationResponse[]>(`${this.userEvaluationPath}/user/${userId}`);
  }

  async submitEvaluation(data: SubmitEvaluationRequest): Promise<SubmitEvaluationResponse> {
    return httpService.post<SubmitEvaluationResponse>(`${this.userEvaluationPath}/submit`, data);
  }

  async hasUserTakenEvaluation(userId: string): Promise<boolean> {
    try {
      const evaluations = await this.getUserEvaluationsByUserId(userId);
      return evaluations.length > 0;
    } catch {
      return false;
    }
  }
}

export const evaluationService = new EvaluationService();
