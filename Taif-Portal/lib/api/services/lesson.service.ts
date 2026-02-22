/**
 * Lesson Service - Handles all lesson-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import {
  Lesson,
  LessonWithItems,
  CreateLessonRequest,
  UpdateLessonRequest,
  ReorderLessonItemsRequest,
  AddItemsToLessonRequest,
} from '../types';

export const lessonService = {
  async getAll(): Promise<ApiResponse<Lesson[]>> {
    return apiClient.get<Lesson[]>('/lesson');
  },

  async getById(id: string): Promise<ApiResponse<Lesson | null>> {
    return apiClient.get<Lesson>(`/lesson/${id}`);
  },

  async getWithItems(id: string): Promise<ApiResponse<LessonWithItems | null>> {
    return apiClient.get<LessonWithItems>(`/lesson/${id}/items`);
  },

  async getByCourseId(courseId: string): Promise<ApiResponse<LessonWithItems[]>> {
    return apiClient.get<LessonWithItems[]>(`/lesson/course/${courseId}`);
  },

  async create(request: CreateLessonRequest): Promise<ApiResponse<Lesson>> {
    return apiClient.post<Lesson>('/lesson', request);
  },

  async update(id: string, request: UpdateLessonRequest): Promise<ApiResponse<Lesson | null>> {
    return apiClient.put<Lesson>(`/lesson/${id}`, request);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/lesson/${id}`);
  },

  async addItems(lessonId: string, request: AddItemsToLessonRequest): Promise<ApiResponse<LessonWithItems | null>> {
    return apiClient.post<LessonWithItems>(`/lesson/${lessonId}/items`, request);
  },

  async removeItem(lessonId: string, itemId: string): Promise<ApiResponse<LessonWithItems | null>> {
    return apiClient.delete<LessonWithItems>(`/lesson/${lessonId}/items/${itemId}`);
  },

  async reorderItems(lessonId: string, request: ReorderLessonItemsRequest): Promise<ApiResponse<LessonWithItems | null>> {
    return apiClient.put<LessonWithItems>(`/lesson/${lessonId}/items/reorder`, request);
  },
};
