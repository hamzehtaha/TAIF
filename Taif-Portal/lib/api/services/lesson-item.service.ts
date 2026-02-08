/**
 * Lesson Item Service - Handles all lesson item-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import { LessonItem, CreateLessonItemRequest, UpdateLessonItemRequest } from '../types';
import { mockDataStore } from '../mock/data';

export const lessonItemService = {
  async getAll(): Promise<ApiResponse<LessonItem[]>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getLessonItems();
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<LessonItem[]>('/lessonitem');
  },

  async getById(id: string): Promise<ApiResponse<LessonItem | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getLessonItemById(id);
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<LessonItem>(`/lessonitem/${id}`);
  },

  async getByLessonId(lessonId: string): Promise<ApiResponse<LessonItem[]>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getLessonItemsByLessonId(lessonId);
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<LessonItem[]>(`/lessonitem/lesson/${lessonId}`);
  },

  async create(request: CreateLessonItemRequest): Promise<ApiResponse<LessonItem>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.createLessonItem({
        name: request.name,
        type: request.type,
        content: request.content,
        lessonId: request.lessonId,
        order: request.order || 1,
        durationInSeconds: request.durationInSeconds || 0,
      });
      return { success: true, message: 'Created', data };
    }
    return apiClient.post<LessonItem>('/lessonitem', request);
  },

  async update(id: string, request: UpdateLessonItemRequest): Promise<ApiResponse<LessonItem | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.updateLessonItem(id, request);
      return { success: true, message: 'Updated', data };
    }
    return apiClient.put<LessonItem>(`/lessonitem/${id}`, request);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.deleteLessonItem(id);
      return { success: true, message: 'Deleted', data };
    }
    return apiClient.delete<boolean>(`/lessonitem/${id}`);
  },
};
