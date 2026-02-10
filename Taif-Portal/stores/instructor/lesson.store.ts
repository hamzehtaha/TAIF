/**
 * Lesson Store - Zustand store for lesson state management
 */

import { create } from 'zustand';
import { Lesson, LessonWithItems, CreateLessonRequest, UpdateLessonRequest } from '@/lib/api/types';
import { lessonService } from '@/lib/api/services';

interface LessonState {
  lessons: Lesson[];
  selectedLesson: LessonWithItems | null;
  isLoading: boolean;
  error: string | null;
}

interface LessonActions {
  loadLessons: () => Promise<void>;
  loadLessonWithItems: (id: string) => Promise<LessonWithItems | null>;
  createLesson: (request: CreateLessonRequest) => Promise<Lesson | null>;
  updateLesson: (id: string, request: UpdateLessonRequest) => Promise<Lesson | null>;
  deleteLesson: (id: string) => Promise<boolean>;
  addItemsToLesson: (lessonId: string, itemIds: string[]) => Promise<LessonWithItems | null>;
  removeItemFromLesson: (lessonId: string, itemId: string) => Promise<LessonWithItems | null>;
  reorderLessonItems: (lessonId: string, itemIds: string[]) => Promise<LessonWithItems | null>;
  selectLesson: (lesson: LessonWithItems | null) => void;
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

  loadLessons: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonService.getAll();
      if (response.success) {
        set({ lessons: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load lessons', isLoading: false });
    }
  },

  loadLessonWithItems: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonService.getWithItems(id);
      if (response.success && response.data) {
        set({ selectedLesson: response.data, isLoading: false });
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to load lesson', isLoading: false });
      return null;
    }
  },

  createLesson: async (request: CreateLessonRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonService.create(request);
      if (response.success) {
        set(state => ({
          lessons: [...state.lessons, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to create lesson', isLoading: false });
      return null;
    }
  },

  updateLesson: async (id: string, request: UpdateLessonRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonService.update(id, request);
      if (response.success && response.data) {
        set(state => ({
          lessons: state.lessons.map(lesson => 
            lesson.id === id ? { ...lesson, ...response.data } : lesson
          ),
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to update lesson', isLoading: false });
      return null;
    }
  },

  deleteLesson: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonService.delete(id);
      if (response.success) {
        set(state => ({
          lessons: state.lessons.filter(lesson => lesson.id !== id),
          selectedLesson: state.selectedLesson?.id === id ? null : state.selectedLesson,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete lesson', isLoading: false });
      return false;
    }
  },

  addItemsToLesson: async (lessonId: string, itemIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonService.addItems(lessonId, { lessonItemIds: itemIds });
      if (response.success && response.data) {
        set({ selectedLesson: response.data, isLoading: false });
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to add items to lesson', isLoading: false });
      return null;
    }
  },

  removeItemFromLesson: async (lessonId: string, itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonService.removeItem(lessonId, itemId);
      if (response.success && response.data) {
        set({ selectedLesson: response.data, isLoading: false });
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to remove item from lesson', isLoading: false });
      return null;
    }
  },

  reorderLessonItems: async (lessonId: string, itemIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonService.reorderItems(lessonId, { lessonItemIds: itemIds });
      if (response.success && response.data) {
        set({ selectedLesson: response.data, isLoading: false });
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to reorder lesson items', isLoading: false });
      return null;
    }
  },

  selectLesson: (lesson: LessonWithItems | null) => {
    set({ selectedLesson: lesson });
  },

  getLessonById: (id: string) => {
    return get().lessons.find(lesson => lesson.id === id);
  },

  reset: () => set(initialState),
}));
