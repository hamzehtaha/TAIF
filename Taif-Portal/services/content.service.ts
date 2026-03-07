import { httpService } from "@/services/http.service";

export enum LessonItemType {
  Video = 0,
  RichText = 1,
  Quiz = 2,
}

export interface VideoContent {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  durationInSeconds: number;
}

export interface RichTextContent {
  title: string;
  html: string;
}

// Frontend format for creating/editing quizzes
export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizContent {
  title: string;
  questions: QuizQuestion[];
}

// Backend stored format (with option IDs)
export interface StoredQuizOption {
  id: string;
  text: string;
}

export interface StoredQuizQuestion {
  id: string;
  questionText: string;
  options: StoredQuizOption[];
  correctAnswerId: string;
  shuffleOptions?: boolean;
  explanation?: string;
}

export interface StoredQuizContent {
  title: string;
  questions: StoredQuizQuestion[];
}

// Backend request format (what the API expects)
export interface QuizOptionDto {
  id?: string;
  text: string;
}

export interface QuizQuestionCreateDto {
  id?: string;
  questionText: string;
  shuffleOptions?: boolean;
  options: QuizOptionDto[];
  correctAnswerId?: string;
  correctAnswerIndex?: number;
  explanation?: string;
}

export interface QuizCreateDto {
  title: string;
  questions: QuizQuestionCreateDto[];
}

export interface CreateContentRequest {
  type: LessonItemType;
  video?: VideoContent;
  richText?: RichTextContent;
  quiz?: QuizContent | QuizCreateDto;
}

export interface Content {
  id: string;
  type: LessonItemType;
  contentJson: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

class ContentService {
  private serviceBaseUrl = "/api/content";

  async createContent(request: CreateContentRequest): Promise<Content> {
    // Convert frontend quiz format to backend format if needed
    const apiRequest = this.convertToApiRequest(request);
    const response = await httpService.post<Content>(this.serviceBaseUrl, apiRequest);
    return response;
  }

  /**
   * Convert frontend QuizContent format to backend QuizCreateDto format
   */
  private convertToApiRequest(request: CreateContentRequest): CreateContentRequest {
    if (request.type !== LessonItemType.Quiz || !request.quiz) {
      return request;
    }

    const quiz = request.quiz as QuizContent;
    
    // Check if options are already in object format (QuizOptionDto[])
    const firstQuestion = quiz.questions?.[0];
    if (firstQuestion && firstQuestion.options?.[0] && typeof firstQuestion.options[0] === 'object') {
      return request; // Already in correct format
    }

    // Convert string[] options to QuizOptionDto[]
    const convertedQuiz: QuizCreateDto = {
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        questionText: q.questionText,
        options: q.options.map(opt => ({ text: opt as string })),
        correctAnswerIndex: q.correctAnswerIndex,
      })),
    };

    return {
      ...request,
      quiz: convertedQuiz,
    };
  }

  async getContent(id: string): Promise<Content> {
    const response = await httpService.get<Content>(`${this.serviceBaseUrl}/${id}`);
    return response;
  }

  async getAllContent(): Promise<Content[]> {
    const response = await httpService.get<Content[]>(this.serviceBaseUrl);
    return response;
  }

  async updateContent(id: string, request: CreateContentRequest): Promise<Content> {
    // Convert frontend quiz format to backend format if needed
    const apiRequest = this.convertToApiRequest(request);
    const response = await httpService.put<Content>(`${this.serviceBaseUrl}/${id}`, apiRequest);
    return response;
  }

  async deleteContent(id: string): Promise<boolean> {
    const response = await httpService.delete<boolean>(`${this.serviceBaseUrl}/${id}`);
    return response;
  }

  parseContentData(content: Content): VideoContent | RichTextContent | QuizContent {
    const data = JSON.parse(content.contentJson);
    return data;
  }

  /**
   * Parse stored quiz content and convert to editable format
   */
  parseQuizForEditing(content: Content): QuizContent {
    const stored = JSON.parse(content.contentJson) as StoredQuizContent;
    return {
      title: stored.title || '',
      questions: (stored.questions || []).map(q => {
        // Find the index of the correct answer
        const correctIdx = q.options.findIndex(opt => opt.id === q.correctAnswerId);
        return {
          questionText: q.questionText || '',
          options: q.options.map(opt => opt.text),
          correctAnswerIndex: correctIdx >= 0 ? correctIdx : 0,
        };
      }),
    };
  }

  /**
   * Parse stored quiz content (returns stored format with option objects)
   */
  parseStoredQuiz(content: Content): StoredQuizContent {
    return JSON.parse(content.contentJson) as StoredQuizContent;
  }
}

export const contentService = new ContentService();
