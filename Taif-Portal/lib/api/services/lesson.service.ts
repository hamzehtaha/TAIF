/**
 * Lesson Service - Handles all lesson-related API calls
 * Matches backend LessonController endpoints
 */

import { apiClient, ApiResponse } from '../client';
import {
  Lesson,
  CreateLessonRequest,
  UpdateLessonRequest,
} from '../types';

export const lessonService = {
  // GET /api/lesson/{id} - Get lesson by ID
  async getById(id: string): Promise<ApiResponse<Lesson | null>> {
    return apiClient.get<Lesson>(`/lesson/${id}`);
  },

  // GET /api/lesson/course/{courseId} - Get lessons by course ID
  async getByCourseId(courseId: string): Promise<ApiResponse<Lesson[]>> {
    return apiClient.get<Lesson[]>(`/lesson/course/${courseId}`);
  },

  // POST /api/lesson - Create a new lesson
  async create(request: CreateLessonRequest): Promise<ApiResponse<Lesson>> {
    return apiClient.post<Lesson>('/lesson', request);
  },

  // PUT /api/lesson/{id} - Update a lesson
  async update(id: string, request: UpdateLessonRequest): Promise<ApiResponse<Lesson | null>> {
    return apiClient.put<Lesson>(`/lesson/${id}`, request);
  },

  // DELETE /api/lesson/{id} - Delete a lesson
  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/lesson/${id}`);
  },
};
