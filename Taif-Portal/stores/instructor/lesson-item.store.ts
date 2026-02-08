/**
 * Lesson Item Store - Zustand store for lesson item state management
 */

import { create } from 'zustand';
import { LessonItem, CreateLessonItemRequest, UpdateLessonItemRequest } from '@/lib/api/types';
import { lessonItemService } from '@/lib/api/services';

interface LessonItemState {
  lessonItems: LessonItem[];
  selectedItem: LessonItem | null;
  isLoading: boolean;
  error: string | null;
}

interface LessonItemActions {
  loadLessonItems: () => Promise<void>;
  loadByLessonId: (lessonId: string) => Promise<LessonItem[]>;
  createLessonItem: (request: CreateLessonItemRequest) => Promise<LessonItem | null>;
  updateLessonItem: (id: string, request: UpdateLessonItemRequest) => Promise<LessonItem | null>;
  deleteLessonItem: (id: string) => Promise<boolean>;
  selectItem: (item: LessonItem | null) => void;
  getItemById: (id: string) => LessonItem | undefined;
  reset: () => void;
}

type LessonItemStore = LessonItemState & LessonItemActions;

const initialState: LessonItemState = {
  lessonItems: [],
  selectedItem: null,
  isLoading: false,
  error: null,
};

export const useLessonItemStore = create<LessonItemStore>((set, get) => ({
  ...initialState,

  loadLessonItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonItemService.getAll();
      if (response.success) {
        set({ lessonItems: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load lesson items', isLoading: false });
    }
  },

  loadByLessonId: async (lessonId: string) => {
    try {
      const response = await lessonItemService.getByLessonId(lessonId);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  createLessonItem: async (request: CreateLessonItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonItemService.create(request);
      if (response.success) {
        set(state => ({
          lessonItems: [...state.lessonItems, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to create lesson item', isLoading: false });
      return null;
    }
  },

  updateLessonItem: async (id: string, request: UpdateLessonItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonItemService.update(id, request);
      if (response.success && response.data) {
        set(state => ({
          lessonItems: state.lessonItems.map(item => 
            item.id === id ? response.data! : item
          ),
          selectedItem: state.selectedItem?.id === id ? response.data : state.selectedItem,
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to update lesson item', isLoading: false });
      return null;
    }
  },

  deleteLessonItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await lessonItemService.delete(id);
      if (response.success) {
        set(state => ({
          lessonItems: state.lessonItems.filter(item => item.id !== id),
          selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete lesson item', isLoading: false });
      return false;
    }
  },

  selectItem: (item: LessonItem | null) => {
    set({ selectedItem: item });
  },

  getItemById: (id: string) => {
    return get().lessonItems.find(item => item.id === id);
  },

  reset: () => set(initialState),
}));
