import { 
  QuizAnswerRequest, 
  SubmitQuizRequest, 
  QuizResultResponse, 
  QuizSubmissionDto,
  QuizAnswerPayload 
} from "@/dtos/quiz.dto";
import { httpService } from "@/services/http.service";

class QuizService {
  private serviceBaseUrl = "/api/LessonItem";

  async submitQuiz(
    lessonItemId: string,
    answers: QuizAnswerRequest[]
  ): Promise<QuizResultResponse> {
    const request: SubmitQuizRequest = { lessonItemId, answers };
    return httpService.post<QuizResultResponse>(`${this.serviceBaseUrl}/submit-quiz`, request);
  }

  async getLastSubmission(lessonItemId: string): Promise<QuizSubmissionDto | null> {
    try {
      return await httpService.get<QuizSubmissionDto>(
        `${this.serviceBaseUrl}/user-quiz-result/${lessonItemId}`
      );
    } catch {
      return null;
    }
  }

  parseAnswersJson(answersJson: string): QuizAnswerPayload[] {
    try {
      return JSON.parse(answersJson) as QuizAnswerPayload[];
    } catch {
      return [];
    }
  }
}

export const quizService = new QuizService();
