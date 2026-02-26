/**
 * Course Store - Zustand store for course state management
 * For instructor portal - uses my-courses endpoint
 */

import { create } from 'zustand';
import { Course } from '@/models/course.model';
import { CreateCourseRequest, UpdateCourseRequest } from '@/dtos/course.dto';
import { courseService } from '@/services/course.service';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;
}

interface CourseActions {
  loadCourses: () => Promise<void>;
  loadMyCourses: () => Promise<void>;
  loadCourseById: (id: string) => Promise<Course | null>;
  createCourse: (request: CreateCourseRequest) => Promise<Course | null>;
  updateCourse: (id: string, request: UpdateCourseRequest) => Promise<Course | null>;
  deleteCourse: (id: string) => Promise<boolean>;
  setCurrentCourse: (course: Course | null) => void;
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
      const courses = await courseService.getCourses();
      console.log('Loaded courses:', courses, 'Count:', courses?.length);
      set({ courses: courses || [], isLoading: false });
    } catch (error) {
      console.error('Failed to load courses:', error);
      set({ error: 'Failed to load courses', isLoading: false });
    }
  },

  loadMyCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await courseService.getMyCourses();
      set({ courses, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load my courses', isLoading: false });
    }
  },

  loadCourseById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const course = await courseService.getCourseById(id);
      set({ currentCourse: course, isLoading: false });
      return course;
    } catch (error) {
      set({ error: 'Failed to load course', isLoading: false });
      return null;
    }
  },

  createCourse: async (request: CreateCourseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const course = await courseService.createCourse(request);
      set(state => ({
        courses: [...state.courses, course],
        isLoading: false,
      }));
      return course;
    } catch (error) {
      set({ error: 'Failed to create course', isLoading: false });
      return null;
    }
  },

  updateCourse: async (id: string, request: UpdateCourseRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCourse = await courseService.updateCourse(id, request);
      set(state => ({
        courses: state.courses.map(course =>
          course.id === id ? updatedCourse : course
        ),
        currentCourse: state.currentCourse?.id === id
          ? updatedCourse
          : state.currentCourse,
        isLoading: false,
      }));
      return updatedCourse;
    } catch (error) {
      set({ error: 'Failed to update course', isLoading: false });
      return null;
    }
  },

  deleteCourse: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await courseService.deleteCourse(id);
      set(state => ({
        courses: state.courses.filter(course => course.id !== id),
        currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to delete course', isLoading: false });
      return false;
    }
  },

  setCurrentCourse: (course: Course | null) => {
    set({ currentCourse: course });
  },

  getCourseById: (id: string) => {
    return get().courses.find(course => course.id === id);
  },

  reset: () => set(initialState),
}));
