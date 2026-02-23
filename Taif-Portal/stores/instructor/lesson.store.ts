/**
 * Lesson Store - Zustand store for lesson state management
 * Matches backend LessonController endpoints
 */

import { create } from 'zustand';
import { Lesson } from '@/models/lesson.model';
import { CreateLessonRequest, UpdateLessonRequest } from '@/dtos/lesson.dto';
import { lessonService } from '@/services/lesson.service';

interface LessonState {
  lessons: Lesson[];
  selectedLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;
}

interface LessonActions {
  loadLessonsByCourseId: (courseId: string) => Promise<void>;
  loadLessonById: (id: string) => Promise<Lesson | null>;
  createLesson: (request: CreateLessonRequest) => Promise<Lesson | null>;
  updateLesson: (id: string, request: UpdateLessonRequest) => Promise<Lesson | null>;
  deleteLesson: (id: string) => Promise<boolean>;
  selectLesson: (lesson: Lesson | null) => void;
  getLessonById: (id: string) => Lesson | undefined;
  reset: () => void;
}

type LessonStore = LessonState & LessonActions;

const initialState: LessonState = {
  lessons: [],
  selectedLesson: null,
  isLoading: false,
  error: null,
};

export const useLessonStore = create<LessonStore>((set, get) => ({
  ...initialState,

  loadLessonsByCourseId: async (courseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const lessons = await lessonService.getLessonsByCourse(courseId);
      set({ lessons, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load lessons', isLoading: false });
    }
  },

  loadLessonById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const lesson = await lessonService.getLessonById(id);
      set({ selectedLesson: lesson, isLoading: false });
      return lesson;
    } catch (error) {
      set({ error: 'Failed to load lesson', isLoading: false });
      return null;
    }
  },

  createLesson: async (request: CreateLessonRequest) => {
    set({ isLoading: true, error: null });
    try {
      const lesson = await lessonService.createLesson(request);
      set(state => ({
        lessons: [...state.lessons, lesson],
        isLoading: false,
      }));
      return lesson;
    } catch (error) {
      set({ error: 'Failed to create lesson', isLoading: false });
      return null;
    }
  },

  updateLesson: async (id: string, request: UpdateLessonRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedLesson = await lessonService.updateLesson(id, request);
      set(state => ({
        lessons: state.lessons.map(lesson => 
          lesson.id === id ? updatedLesson : lesson
        ),
        selectedLesson: state.selectedLesson?.id === id 
          ? updatedLesson 
          : state.selectedLesson,
        isLoading: false,
      }));
      return updatedLesson;
    } catch (error) {
      set({ error: 'Failed to update lesson', isLoading: false });
      return null;
    }
  },

  deleteLesson: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await lessonService.deleteLesson(id);
      set(state => ({
        lessons: state.lessons.filter(lesson => lesson.id !== id),
        selectedLesson: state.selectedLesson?.id === id ? null : state.selectedLesson,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to delete lesson', isLoading: false });
      return false;
    }
  },

  selectLesson: (lesson: Lesson | null) => {
    set({ selectedLesson: lesson });
  },

  getLessonById: (id: string) => {
    return get().lessons.find(lesson => lesson.id === id);
  },

  reset: () => set(initialState),
}));
