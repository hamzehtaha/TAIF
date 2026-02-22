/**
 * Course Service - Handles all course-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import {
  Course,
  CourseWithDetails,
  CreateCourseRequest,
  UpdateCourseRequest,
  AddLessonsToCourseRequest,
  ReorderLessonsRequest,
} from '../types';

export const courseService = {
  async getAll(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/course');
  },

  async getById(id: string): Promise<ApiResponse<Course | null>> {
    return apiClient.get<Course>(`/course/${id}`);
  },

  async getWithDetails(id: string): Promise<ApiResponse<CourseWithDetails | null>> {
    return apiClient.get<CourseWithDetails>(`/course/${id}/details`);
  },

  async create(request: CreateCourseRequest): Promise<ApiResponse<Course>> {
    return apiClient.post<Course>('/course', request);
  },

  async update(id: string, request: UpdateCourseRequest): Promise<ApiResponse<Course | null>> {
    return apiClient.put<Course>(`/course/${id}`, request);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/course/${id}`);
  },

  async publish(id: string): Promise<ApiResponse<Course | null>> {
    return apiClient.put<Course>(`/course/${id}/publish`, {});
  },

  async unpublish(id: string): Promise<ApiResponse<Course | null>> {
    return apiClient.put<Course>(`/course/${id}/unpublish`, {});
  },

  async archive(id: string): Promise<ApiResponse<Course | null>> {
    return apiClient.put<Course>(`/course/${id}/archive`, {});
  },

  async addLessons(courseId: string, request: AddLessonsToCourseRequest): Promise<ApiResponse<CourseWithDetails | null>> {
    return apiClient.post<CourseWithDetails>(`/course/${courseId}/lessons`, request);
  },

  async removeLesson(courseId: string, lessonId: string): Promise<ApiResponse<CourseWithDetails | null>> {
    return apiClient.delete<CourseWithDetails>(`/course/${courseId}/lessons/${lessonId}`);
  },

  async reorderLessons(courseId: string, request: ReorderLessonsRequest): Promise<ApiResponse<CourseWithDetails | null>> {
    return apiClient.put<CourseWithDetails>(`/course/${courseId}/lessons/reorder`, request);
  },
};
