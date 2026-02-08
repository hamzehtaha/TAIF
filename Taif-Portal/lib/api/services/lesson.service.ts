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
import { mockDataStore } from '../mock/data';

export const lessonService = {
  async getAll(): Promise<ApiResponse<Lesson[]>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getLessons();
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<Lesson[]>('/lesson');
  },

  async getById(id: string): Promise<ApiResponse<Lesson | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getLessonById(id);
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<Lesson>(`/lesson/${id}`);
  },

  async getWithItems(id: string): Promise<ApiResponse<LessonWithItems | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getLessonWithItems(id);
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<LessonWithItems>(`/lesson/${id}/items`);
  },

  async getByCourseId(courseId: string): Promise<ApiResponse<LessonWithItems[]>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getLessonsByCourseId(courseId);
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<LessonWithItems[]>(`/lesson/course/${courseId}`);
  },

  async create(request: CreateLessonRequest): Promise<ApiResponse<Lesson>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.createLesson({
        title: request.title,
        courseId: request.courseId,
        photo: request.photo,
        description: request.description,
        order: request.order || 1,
      });
      return { success: true, message: 'Created', data };
    }
    return apiClient.post<Lesson>('/lesson', request);
  },

  async update(id: string, request: UpdateLessonRequest): Promise<ApiResponse<Lesson | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.updateLesson(id, request);
      return { success: true, message: 'Updated', data };
    }
    return apiClient.put<Lesson>(`/lesson/${id}`, request);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.deleteLesson(id);
      return { success: true, message: 'Deleted', data };
    }
    return apiClient.delete<boolean>(`/lesson/${id}`);
  },

  async addItems(lessonId: string, request: AddItemsToLessonRequest): Promise<ApiResponse<LessonWithItems | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.addItemsToLesson(lessonId, request.lessonItemIds);
      return { success: true, message: 'Items added', data };
    }
    return apiClient.post<LessonWithItems>(`/lesson/${lessonId}/items`, request);
  },

  async removeItem(lessonId: string, itemId: string): Promise<ApiResponse<LessonWithItems | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.removeItemFromLesson(lessonId, itemId);
      return { success: true, message: 'Item removed', data };
    }
    return apiClient.delete<LessonWithItems>(`/lesson/${lessonId}/items/${itemId}`);
  },

  async reorderItems(lessonId: string, request: ReorderLessonItemsRequest): Promise<ApiResponse<LessonWithItems | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.reorderLessonItems(lessonId, request.lessonItemIds);
      return { success: true, message: 'Reordered', data };
    }
    return apiClient.put<LessonWithItems>(`/lesson/${lessonId}/items/reorder`, request);
  },
};
