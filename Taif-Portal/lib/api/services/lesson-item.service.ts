/**
 * Lesson Item Service - Handles all lesson item-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import { LessonItem, CreateLessonItemRequest, UpdateLessonItemRequest } from '../types';

export const lessonItemService = {
  async getAll(): Promise<ApiResponse<LessonItem[]>> {
    return apiClient.get<LessonItem[]>('/lessonitem');
  },

  async getById(id: string): Promise<ApiResponse<LessonItem | null>> {
    return apiClient.get<LessonItem>(`/lessonitem/${id}`);
  },

  async getByLessonId(lessonId: string): Promise<ApiResponse<LessonItem[]>> {
    return apiClient.get<LessonItem[]>(`/lessonitem/lesson/${lessonId}`);
  },

  async create(request: CreateLessonItemRequest): Promise<ApiResponse<LessonItem>> {
    return apiClient.post<LessonItem>('/lessonitem', request);
  },

  async update(id: string, request: UpdateLessonItemRequest): Promise<ApiResponse<LessonItem | null>> {
    return apiClient.put<LessonItem>(`/lessonitem/${id}`, request);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/lessonitem/${id}`);
  },
};
