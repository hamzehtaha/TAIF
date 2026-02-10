/**
 * Instructor Store - Zustand store for instructor profile and dashboard
 */

import { create } from 'zustand';
import { Instructor, DashboardStats } from '@/lib/api/types';
import { instructorService } from '@/lib/api/services';

interface InstructorState {
  instructor: Instructor | null;
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

interface InstructorActions {
  loadInstructor: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  reset: () => void;
}

type InstructorStore = InstructorState & InstructorActions;

const initialState: InstructorState = {
  instructor: null,
  dashboardStats: null,
  isLoading: false,
  error: null,
};

export const useInstructorStore = create<InstructorStore>((set) => ({
  ...initialState,

  loadInstructor: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await instructorService.getProfile();
      if (response.success) {
        set({ instructor: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load instructor profile', isLoading: false });
    }
  },

  loadDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await instructorService.getDashboardStats();
      if (response.success) {
        set({ dashboardStats: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load dashboard stats', isLoading: false });
    }
  },

  reset: () => set(initialState),
}));
