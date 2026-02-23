/**
 * Instructor Store - Zustand store for instructor profile and dashboard
 */

import { create } from 'zustand';
import { instructorProfileService, InstructorProfileResponse } from '@/services/instructor-profile.service';
import { courseService } from '@/services/course.service';

interface DashboardStats {
  totalCourses: number;
  totalEnrollments: number;
}

interface InstructorState {
  instructor: InstructorProfileResponse | null;
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
      // Use getOrCreateCurrentProfile to auto-create profile if it doesn't exist
      const instructor = await instructorProfileService.getOrCreateCurrentProfile();
      set({ instructor, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load instructor profile', isLoading: false });
    }
  },

  loadDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await courseService.getMyCourses();
      const totalEnrollments = courses.reduce((sum, c) => sum + (c.totalEnrolled || 0), 0);
      set({ 
        dashboardStats: { 
          totalCourses: courses.length, 
          totalEnrollments 
        }, 
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to load dashboard stats', isLoading: false });
    }
  },

  reset: () => set(initialState),
}));
