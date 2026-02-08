/**
 * Category Service - Handles all category-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import { Category } from '../types';
import { mockDataStore } from '../mock/data';

export const categoryService = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getCategories();
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<Category[]>('/category');
  },

  async getById(id: string): Promise<ApiResponse<Category | null>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getCategoryById(id);
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<Category>(`/category/${id}`);
  },
};
