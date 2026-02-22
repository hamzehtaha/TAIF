/**
 * Content Service - Handles all content-related API calls (Videos, RichText, Questions)
 * Groups all standalone content operations in one service
 */

import { apiClient, ApiResponse, PaginationFilter } from '../client';
import { LessonItem, LessonItemType, CreateLessonItemRequest, UpdateLessonItemRequest } from '../types';

// Content-specific types
export interface VideoContent extends LessonItem {
  type: LessonItemType.Video;
  thumbnailUrl?: string;
}

export interface RichTextContent extends LessonItem {
  type: LessonItemType.RichText;
}

export interface QuestionContent extends LessonItem {
  type: LessonItemType.Question;
  questionData?: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
}

export interface ContentFilter extends PaginationFilter {
  type?: LessonItemType;
  lessonId?: string;
  isStandalone?: boolean;
}

export const contentService = {
  // ==================== VIDEOS ====================
  async getVideos(filter?: ContentFilter): Promise<ApiResponse<LessonItem[]>> {
    return apiClient.get<LessonItem[]>('/lessonitem', { type: LessonItemType.Video, ...filter });
  },

  async getVideoById(id: string): Promise<ApiResponse<LessonItem | null>> {
    return apiClient.get<LessonItem>(`/lessonitem/${id}`);
  },

  async createVideo(request: Omit<CreateLessonItemRequest, 'type'>): Promise<ApiResponse<LessonItem>> {
    const data = { ...request, type: LessonItemType.Video };
    return apiClient.post<LessonItem>('/lessonitem', data);
  },

  async updateVideo(id: string, request: UpdateLessonItemRequest): Promise<ApiResponse<LessonItem | null>> {
    return apiClient.put<LessonItem>(`/lessonitem/${id}`, request);
  },

  async deleteVideo(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/lessonitem/${id}`);
  },

  // ==================== RICH TEXT ====================
  async getRichContents(filter?: ContentFilter): Promise<ApiResponse<LessonItem[]>> {
    return apiClient.get<LessonItem[]>('/lessonitem', { type: LessonItemType.RichText, ...filter });
  },

  async getRichContentById(id: string): Promise<ApiResponse<LessonItem | null>> {
    return apiClient.get<LessonItem>(`/lessonitem/${id}`);
  },

  async createRichContent(request: Omit<CreateLessonItemRequest, 'type'>): Promise<ApiResponse<LessonItem>> {
    const data = { ...request, type: LessonItemType.RichText };
    return apiClient.post<LessonItem>('/lessonitem', data);
  },

  async updateRichContent(id: string, request: UpdateLessonItemRequest): Promise<ApiResponse<LessonItem | null>> {
    return apiClient.put<LessonItem>(`/lessonitem/${id}`, request);
  },

  async deleteRichContent(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/lessonitem/${id}`);
  },

  // ==================== QUESTIONS ====================
  async getQuestions(filter?: ContentFilter): Promise<ApiResponse<LessonItem[]>> {
    return apiClient.get<LessonItem[]>('/lessonitem', { type: LessonItemType.Question, ...filter });
  },

  async getQuestionById(id: string): Promise<ApiResponse<LessonItem | null>> {
    return apiClient.get<LessonItem>(`/lessonitem/${id}`);
  },

  async createQuestion(request: Omit<CreateLessonItemRequest, 'type'>): Promise<ApiResponse<LessonItem>> {
    const data = { ...request, type: LessonItemType.Question };
    return apiClient.post<LessonItem>('/lessonitem', data);
  },

  async updateQuestion(id: string, request: UpdateLessonItemRequest): Promise<ApiResponse<LessonItem | null>> {
    return apiClient.put<LessonItem>(`/lessonitem/${id}`, request);
  },

  async deleteQuestion(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/lessonitem/${id}`);
  },

  // ==================== GENERIC ====================
  async getAllContent(): Promise<ApiResponse<LessonItem[]>> {
    return apiClient.get<LessonItem[]>('/lessonitem');
  },
};
