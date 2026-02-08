/**
 * Course Service - Handles all course-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import {
  Course,
  CourseWithDetails,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseStatus,
  AddLessonsToCourseRequest,
  ReorderLessonsRequest,
} from '../types';
import { mockDataStore } from '../mock/data';

export const courseService = {
  async getAll(): Promise<ApiResponse<Course[]>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getCourses();
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<Course[]>('/course');
  },

  async getById(id: string): Promise<ApiResponse<Course | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getCourseById(id);
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<Course>(`/course/${id}`);
  },

  async getWithDetails(id: string): Promise<ApiResponse<CourseWithDetails | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getCourseWithDetails(id);
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<CourseWithDetails>(`/course/${id}/details`);
  },

  async create(request: CreateCourseRequest): Promise<ApiResponse<Course>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.createCourse({
        name: request.name,
        description: request.description,
        photo: request.photo,
        categoryId: request.categoryId,
        tags: request.tags || [],
        status: CourseStatus.Draft,
      });
      return { success: true, message: 'Created', data };
    }
    return apiClient.post<Course>('/course', request);
  },

  async update(id: string, request: UpdateCourseRequest): Promise<ApiResponse<Course | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.updateCourse(id, request);
      return { success: true, message: 'Updated', data };
    }
    return apiClient.put<Course>(`/course/${id}`, request);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.deleteCourse(id);
      return { success: true, message: 'Deleted', data };
    }
    return apiClient.delete<boolean>(`/course/${id}`);
  },

  async publish(id: string): Promise<ApiResponse<Course | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.updateCourse(id, { status: CourseStatus.Published });
      return { success: true, message: 'Published', data };
    }
    return apiClient.put<Course>(`/course/${id}/publish`, {});
  },

  async unpublish(id: string): Promise<ApiResponse<Course | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.updateCourse(id, { status: CourseStatus.Draft });
      return { success: true, message: 'Unpublished', data };
    }
    return apiClient.put<Course>(`/course/${id}/unpublish`, {});
  },

  async archive(id: string): Promise<ApiResponse<Course | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.updateCourse(id, { status: CourseStatus.Archived });
      return { success: true, message: 'Archived', data };
    }
    return apiClient.put<Course>(`/course/${id}/archive`, {});
  },

  async addLessons(courseId: string, request: AddLessonsToCourseRequest): Promise<ApiResponse<CourseWithDetails | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.addLessonsToCourse(courseId, request.lessonIds);
      return { success: true, message: 'Lessons added', data };
    }
    return apiClient.post<CourseWithDetails>(`/course/${courseId}/lessons`, request);
  },

  async removeLesson(courseId: string, lessonId: string): Promise<ApiResponse<CourseWithDetails | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.removeLessonFromCourse(courseId, lessonId);
      return { success: true, message: 'Lesson removed', data };
    }
    return apiClient.delete<CourseWithDetails>(`/course/${courseId}/lessons/${lessonId}`);
  },

  async reorderLessons(courseId: string, request: ReorderLessonsRequest): Promise<ApiResponse<CourseWithDetails | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.reorderCourseLessons(courseId, request.lessonIds);
      return { success: true, message: 'Reordered', data };
    }
    return apiClient.put<CourseWithDetails>(`/course/${courseId}/lessons/reorder`, request);
  },
};
