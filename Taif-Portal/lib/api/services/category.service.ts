/**
 * Category Service - Handles all category-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import { Category } from '../types';

export const categoryService = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/category');
  },

  async getById(id: string): Promise<ApiResponse<Category | null>> {
    return apiClient.get<Category>(`/category/${id}`);
  },
};
