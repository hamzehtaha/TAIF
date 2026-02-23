/**
 * Content Store - Zustand store for content state management (Videos, RichText, Questions)
 * Uses lessonItemService for CRUD operations
 */

import { create } from 'zustand';
import { LessonItem } from '@/models/lesson-item.model';
import { CreateLessonItemRequest, UpdateLessonItemRequest } from '@/dtos/lesson-item.dto';
import { lessonItemService } from '@/services/lesson-item.service';

interface ContentState {
  items: LessonItem[];
  isLoading: boolean;
  error: string | null;
}

interface ContentActions {
  loadItemsByLesson: (lessonId: string) => Promise<void>;
  createItem: (request: CreateLessonItemRequest) => Promise<LessonItem | null>;
  updateItem: (id: string, request: UpdateLessonItemRequest) => Promise<LessonItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  getItemById: (id: string) => LessonItem | undefined;
  getVideoItems: () => LessonItem[];
  getRichTextItems: () => LessonItem[];
  getQuestionItems: () => LessonItem[];
  reset: () => void;
}

type ContentStore = ContentState & ContentActions;

const initialState: ContentState = {
  items: [],
  isLoading: false,
  error: null,
};

export const useContentStore = create<ContentStore>((set, get) => ({
  ...initialState,

  loadItemsByLesson: async (lessonId: string) => {
    set({ isLoading: true, error: null });
    try {
      const items = await lessonItemService.getItemsByLesson(lessonId);
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load content items', isLoading: false });
    }
  },

  createItem: async (request: CreateLessonItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const item = await lessonItemService.createLessonItem(request);
      set(state => ({
        items: [...state.items, item],
        isLoading: false,
      }));
      return item;
    } catch (error) {
      set({ error: 'Failed to create content item', isLoading: false });
      return null;
    }
  },

  updateItem: async (id: string, request: UpdateLessonItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await lessonItemService.updateLessonItem(id, request);
      set(state => ({
        items: state.items.map(item => item.id === id ? updatedItem : item),
        isLoading: false,
      }));
      return updatedItem;
    } catch (error) {
      set({ error: 'Failed to update content item', isLoading: false });
      return null;
    }
  },

  deleteItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await lessonItemService.deleteLessonItem(id);
      set(state => ({
        items: state.items.filter(item => item.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to delete content item', isLoading: false });
      return false;
    }
  },

  getItemById: (id: string) => get().items.find(item => item.id === id),
  getVideoItems: () => get().items.filter(item => item.type === "video"),
  getRichTextItems: () => get().items.filter(item => item.type === "text"),
  getQuestionItems: () => get().items.filter(item => item.type === "question"),
  reset: () => set(initialState),
}));
