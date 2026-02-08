/**
 * Course Store - Zustand store for course state management
 */

import { create } from 'zustand';
import {
  Course,
  CourseWithDetails,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '@/lib/api/types';
import { courseService } from '@/lib/api/services';

interface CourseState {
  courses: Course[];
  currentCourse: CourseWithDetails | null;
  isLoading: boolean;
  error: string | null;
}

interface CourseActions {
  loadCourses: () => Promise<void>;
  loadCourseWithDetails: (id: string) => Promise<CourseWithDetails | null>;
  createCourse: (request: CreateCourseRequest) => Promise<Course | null>;
  updateCourse: (id: string, request: UpdateCourseRequest) => Promise<Course | null>;
  deleteCourse: (id: string) => Promise<boolean>;
  publishCourse: (id: string) => Promise<boolean>;
  unpublishCourse: (id: string) => Promise<boolean>;
  archiveCourse: (id: string) => Promise<boolean>;
  addLessonsToCourse: (courseId: string, lessonIds: string[]) => Promise<CourseWithDetails | null>;
  removeLessonFromCourse: (courseId: string, lessonId: string) => Promise<CourseWithDetails | null>;
  reorderCourseLessons: (courseId: string, lessonIds: string[]) => Promise<CourseWithDetails | null>;
  setCurrentCourse: (course: CourseWithDetails | null) => void;
  getCourseById: (id: string) => Course | undefined;
  reset: () => void;
}

type CourseStore = CourseState & CourseActions;

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  isLoading: false,
  error: null,
};

export const useCourseStore = create<CourseStore>((set, get) => ({
  ...initialState,

  loadCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.getAll();
      if (response.success) {
        set({ courses: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load courses', isLoading: false });
    }
  },

  loadCourseWithDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.getWithDetails(id);
      if (response.success && response.data) {
        set({ currentCourse: response.data, isLoading: false });
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to load course', isLoading: false });
      return null;
    }
  },

  createCourse: async (request: CreateCourseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.create(request);
      if (response.success) {
        set(state => ({
          courses: [...state.courses, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to create course', isLoading: false });
      return null;
    }
  },

  updateCourse: async (id: string, request: UpdateCourseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.update(id, request);
      if (response.success && response.data) {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === id ? { ...course, ...response.data } : course
          ),
          currentCourse: state.currentCourse?.id === id
            ? { ...state.currentCourse, ...response.data }
            : state.currentCourse,
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to update course', isLoading: false });
      return null;
    }
  },

  deleteCourse: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.delete(id);
      if (response.success) {
        set(state => ({
          courses: state.courses.filter(course => course.id !== id),
          currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete course', isLoading: false });
      return false;
    }
  },

  publishCourse: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.publish(id);
      if (response.success && response.data) {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === id ? { ...course, status: response.data!.status } : course
          ),
          currentCourse: state.currentCourse?.id === id
            ? { ...state.currentCourse, status: response.data!.status }
            : state.currentCourse,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to publish course', isLoading: false });
      return false;
    }
  },

  unpublishCourse: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.unpublish(id);
      if (response.success && response.data) {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === id ? { ...course, status: response.data!.status } : course
          ),
          currentCourse: state.currentCourse?.id === id
            ? { ...state.currentCourse, status: response.data!.status }
            : state.currentCourse,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to unpublish course', isLoading: false });
      return false;
    }
  },

  archiveCourse: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.archive(id);
      if (response.success && response.data) {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === id ? { ...course, status: response.data!.status } : course
          ),
          currentCourse: state.currentCourse?.id === id
            ? { ...state.currentCourse, status: response.data!.status }
            : state.currentCourse,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to archive course', isLoading: false });
      return false;
    }
  },

  addLessonsToCourse: async (courseId: string, lessonIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.addLessons(courseId, { lessonIds });
      if (response.success && response.data) {
        set({ currentCourse: response.data, isLoading: false });
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to add lessons to course', isLoading: false });
      return null;
    }
  },

  removeLessonFromCourse: async (courseId: string, lessonId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.removeLesson(courseId, lessonId);
      if (response.success && response.data) {
        set({ currentCourse: response.data, isLoading: false });
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to remove lesson from course', isLoading: false });
      return null;
    }
  },

  reorderCourseLessons: async (courseId: string, lessonIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await courseService.reorderLessons(courseId, { lessonIds });
      if (response.success && response.data) {
        set({ currentCourse: response.data, isLoading: false });
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to reorder course lessons', isLoading: false });
      return null;
    }
  },

  setCurrentCourse: (course: CourseWithDetails | null) => {
    set({ currentCourse: course });
  },

  getCourseById: (id: string) => {
    return get().courses.find(course => course.id === id);
  },

  reset: () => set(initialState),
}));
