/**
 * Lesson Item Store - Zustand store for lesson item state management
 */

import { create } from 'zustand';
import { LessonItem } from '@/models/lesson-item.model';
import { CreateLessonItemRequest, UpdateLessonItemRequest } from '@/dtos/lesson-item.dto';
import { lessonItemService } from '@/services/lesson-item.service';

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
    // No global getAll in the service - this is a placeholder
    set({ isLoading: false, error: null });
  },

  loadByLessonId: async (lessonId: string) => {
    try {
      const items = await lessonItemService.getItemsByLesson(lessonId);
      return items;
    } catch (error) {
      return [];
    }
  },

  createLessonItem: async (request: CreateLessonItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const item = await lessonItemService.createLessonItem(request);
      set(state => ({
        lessonItems: [...state.lessonItems, item],
        isLoading: false,
      }));
      return item;
    } catch (error) {
      set({ error: 'Failed to create lesson item', isLoading: false });
      return null;
    }
  },

  updateLessonItem: async (id: string, request: UpdateLessonItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await lessonItemService.updateLessonItem(id, request);
      set(state => ({
        lessonItems: state.lessonItems.map(item => 
          item.id === id ? updatedItem : item
        ),
        selectedItem: state.selectedItem?.id === id ? updatedItem : state.selectedItem,
        isLoading: false,
      }));
      return updatedItem;
    } catch (error) {
      set({ error: 'Failed to update lesson item', isLoading: false });
      return null;
    }
  },

  deleteLessonItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await lessonItemService.deleteLessonItem(id);
      set(state => ({
        lessonItems: state.lessonItems.filter(item => item.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        isLoading: false,
      }));
      return true;
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
