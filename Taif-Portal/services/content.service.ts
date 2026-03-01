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

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizContent {
  title: string;
  questions: QuizQuestion[];
}

export interface CreateContentRequest {
  type: LessonItemType;
  video?: VideoContent;
  richText?: RichTextContent;
  quiz?: QuizContent;
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
    const response = await httpService.post<Content>(this.serviceBaseUrl, request);
    return response;
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
    const response = await httpService.put<Content>(`${this.serviceBaseUrl}/${id}`, request);
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
}

export const contentService = new ContentService();
