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
    answers: QuizAnswerRequest[],
    lessonId?: string,
    courseId?: string
  ): Promise<QuizResultResponse> {
    const request: SubmitQuizRequest = { lessonItemId, lessonId, courseId, answers };
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

  /**
   * Helper to get option ID from an option (handles both string[] and QuizOption[] formats)
   */
  getOptionId(option: string | { id: string; text: string }, index: number): string {
    if (typeof option === 'string') {
      // Legacy format - use index as ID
      return `opt_${index}`;
    }
    return option.id;
  }

  /**
   * Helper to get option text from an option
   */
  getOptionText(option: string | { id: string; text: string }): string {
    if (typeof option === 'string') {
      return option;
    }
    return option.text;
  }
}

export const quizService = new QuizService();
