/**
 * Content Service - Handles all content-related API calls (Videos, RichText, Questions)
 * Groups all standalone content operations in one service
 */

import { apiClient, ApiResponse, PagedResult, PaginationFilter } from '../client';
import { LessonItem, LessonItemType, CreateLessonItemRequest, UpdateLessonItemRequest } from '../types';
import { mockDataStore } from '../mock/data';

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
    if (apiClient.isMockMode()) {
      const items = await mockDataStore.getLessonItems();
      const videos = items.filter(i => i.type === LessonItemType.Video);
      return { success: true, message: 'Success', data: videos };
    }
    return apiClient.get<LessonItem[]>('/lesson-item', { type: LessonItemType.Video, ...filter });
  },

  async getVideoById(id: string): Promise<ApiResponse<LessonItem | null>> {
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.getLessonItemById(id);
      if (item && item.type !== LessonItemType.Video) return { success: false, message: 'Not a video', data: null };
      return { success: true, message: 'Success', data: item };
    }
    return apiClient.get<LessonItem>(`/lesson-item/${id}`);
  },

  async createVideo(request: Omit<CreateLessonItemRequest, 'type'>): Promise<ApiResponse<LessonItem>> {
    const data = { ...request, type: LessonItemType.Video };
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.createLessonItem({
        name: data.name,
        type: data.type,
        content: data.content,
        order: data.order || 1,
        durationInSeconds: data.durationInSeconds || 0,
      });
      return { success: true, message: 'Created', data: item };
    }
    return apiClient.post<LessonItem>('/lesson-item', data);
  },

  async updateVideo(id: string, request: UpdateLessonItemRequest): Promise<ApiResponse<LessonItem | null>> {
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.updateLessonItem(id, request);
      return { success: true, message: 'Updated', data: item };
    }
    return apiClient.put<LessonItem>(`/lesson-item/${id}`, request);
  },

  async deleteVideo(id: string): Promise<ApiResponse<boolean>> {
    if (apiClient.isMockMode()) {
      const result = await mockDataStore.deleteLessonItem(id);
      return { success: true, message: 'Deleted', data: result };
    }
    return apiClient.delete<boolean>(`/lesson-item/${id}`);
  },

  // ==================== RICH TEXT ====================
  async getRichContents(filter?: ContentFilter): Promise<ApiResponse<LessonItem[]>> {
    if (apiClient.isMockMode()) {
      const items = await mockDataStore.getLessonItems();
      const richTexts = items.filter(i => i.type === LessonItemType.RichText);
      return { success: true, message: 'Success', data: richTexts };
    }
    return apiClient.get<LessonItem[]>('/lesson-item', { type: LessonItemType.RichText, ...filter });
  },

  async getRichContentById(id: string): Promise<ApiResponse<LessonItem | null>> {
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.getLessonItemById(id);
      if (item && item.type !== LessonItemType.RichText) return { success: false, message: 'Not rich content', data: null };
      return { success: true, message: 'Success', data: item };
    }
    return apiClient.get<LessonItem>(`/lesson-item/${id}`);
  },

  async createRichContent(request: Omit<CreateLessonItemRequest, 'type'>): Promise<ApiResponse<LessonItem>> {
    const data = { ...request, type: LessonItemType.RichText };
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.createLessonItem({
        name: data.name,
        type: data.type,
        content: data.content,
        order: data.order || 1,
        durationInSeconds: data.durationInSeconds || 0,
      });
      return { success: true, message: 'Created', data: item };
    }
    return apiClient.post<LessonItem>('/lesson-item', data);
  },

  async updateRichContent(id: string, request: UpdateLessonItemRequest): Promise<ApiResponse<LessonItem | null>> {
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.updateLessonItem(id, request);
      return { success: true, message: 'Updated', data: item };
    }
    return apiClient.put<LessonItem>(`/lesson-item/${id}`, request);
  },

  async deleteRichContent(id: string): Promise<ApiResponse<boolean>> {
    if (apiClient.isMockMode()) {
      const result = await mockDataStore.deleteLessonItem(id);
      return { success: true, message: 'Deleted', data: result };
    }
    return apiClient.delete<boolean>(`/lesson-item/${id}`);
  },

  // ==================== QUESTIONS ====================
  async getQuestions(filter?: ContentFilter): Promise<ApiResponse<LessonItem[]>> {
    if (apiClient.isMockMode()) {
      const items = await mockDataStore.getLessonItems();
      const questions = items.filter(i => i.type === LessonItemType.Question);
      return { success: true, message: 'Success', data: questions };
    }
    return apiClient.get<LessonItem[]>('/lesson-item', { type: LessonItemType.Question, ...filter });
  },

  async getQuestionById(id: string): Promise<ApiResponse<LessonItem | null>> {
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.getLessonItemById(id);
      if (item && item.type !== LessonItemType.Question) return { success: false, message: 'Not a question', data: null };
      return { success: true, message: 'Success', data: item };
    }
    return apiClient.get<LessonItem>(`/lesson-item/${id}`);
  },

  async createQuestion(request: Omit<CreateLessonItemRequest, 'type'>): Promise<ApiResponse<LessonItem>> {
    const data = { ...request, type: LessonItemType.Question };
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.createLessonItem({
        name: data.name,
        type: data.type,
        content: data.content,
        order: data.order || 1,
        durationInSeconds: data.durationInSeconds || 0,
      });
      return { success: true, message: 'Created', data: item };
    }
    return apiClient.post<LessonItem>('/lesson-item', data);
  },

  async updateQuestion(id: string, request: UpdateLessonItemRequest): Promise<ApiResponse<LessonItem | null>> {
    if (apiClient.isMockMode()) {
      const item = await mockDataStore.updateLessonItem(id, request);
      return { success: true, message: 'Updated', data: item };
    }
    return apiClient.put<LessonItem>(`/lesson-item/${id}`, request);
  },

  async deleteQuestion(id: string): Promise<ApiResponse<boolean>> {
    if (apiClient.isMockMode()) {
      const result = await mockDataStore.deleteLessonItem(id);
      return { success: true, message: 'Deleted', data: result };
    }
    return apiClient.delete<boolean>(`/lesson-item/${id}`);
  },

  // ==================== GENERIC ====================
  async getAllContent(): Promise<ApiResponse<LessonItem[]>> {
    if (apiClient.isMockMode()) {
      const items = await mockDataStore.getLessonItems();
      return { success: true, message: 'Success', data: items };
    }
    return apiClient.get<LessonItem[]>('/lesson-item');
  },
};
