/**
 * Instructor Service - Handles instructor-related API calls
 */

import { apiClient, ApiResponse } from '../client';
import { Instructor, DashboardStats } from '../types';

export const instructorService = {
  async getProfile(): Promise<ApiResponse<Instructor>> {
    return apiClient.get<Instructor>('/instructor/profile');
  },

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/instructor/dashboard/stats');
  },
};
