/**
 * Course Service - Handles all course-related API calls
 * Matches backend CourseController endpoints
 */

import { apiClient, ApiResponse } from '../client';
import {
  Course,
  CourseWithDetails,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '../types';
import { Category } from '@/models/category.model';

export const courseService = {
  // GET /api/course - Get all courses
  async getAll(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/course');
  },

  // GET /api/course/{id} - Get course by ID
  async getById(id: string): Promise<ApiResponse<Course | null>> {
    return apiClient.get<Course>(`/course/${id}`);
  },

  // GET /api/course/category/{categoryId} - Get courses by category
  async getByCategoryId(categoryId: string): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>(`/course/category/${categoryId}`);
  },

  // GET /api/course/recommended - Get recommended courses for user
  async getRecommended(limit: number = 10): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>(`/course/recommended?limit=${limit}`);
  },

  // GET /api/course/my-courses - Get instructor's own courses
  async getMyCourses(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('/course/my-courses');
  },

  // GET /api/course/my-courses/count - Get count of instructor's courses
  async getMyCoursesCount(): Promise<ApiResponse<number>> {
    return apiClient.get<number>('/course/my-courses/count');
  },

  // POST /api/course - Create a new course
  async create(request: CreateCourseRequest): Promise<ApiResponse<Course>> {
    return apiClient.post<Course>('/course', request);
  },

  // PUT /api/course/{id} - Update a course
  async update(id: string, request: UpdateCourseRequest): Promise<ApiResponse<Course | null>> {
    return apiClient.put<Course>(`/course/${id}`, request);
  },

  // DELETE /api/course/{id} - Delete a course
  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/course/${id}`);
  },

  // Utility: Enrich courses with category names
  async enrichCoursesWithCategories(courses: Course[], categories: Category[]): Promise<Course[]> {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    return courses.map(course => ({
      ...course,
      categoryName: categoryMap.get(course.categoryId) || 'Unknown',
    }));
  },
};
