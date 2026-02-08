/**
 * Instructor Service - Handles instructor-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import { Instructor, DashboardStats } from '../types';
import { mockDataStore } from '../mock/data';

export const instructorService = {
  async getProfile(): Promise<ApiResponse<Instructor>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getInstructor();
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<Instructor>('/instructor/profile');
  },

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    if (apiClient.isMockMode()) {
      const data = await mockDataStore.getDashboardStats();
      return { success: true, message: 'Success', data };
    }
    return apiClient.get<DashboardStats>('/instructor/dashboard/stats');
  },
};
