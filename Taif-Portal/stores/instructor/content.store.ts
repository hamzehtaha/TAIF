/**
 * Content Store - Zustand store for content state management (Videos, RichText, Questions)
 */

import { create } from 'zustand';
import { LessonItem, LessonItemType, CreateLessonItemRequest, UpdateLessonItemRequest } from '@/lib/api/types';
import { contentService } from '@/lib/api/services';

interface ContentState {
  videos: LessonItem[];
  richContents: LessonItem[];
  questions: LessonItem[];
  isLoading: boolean;
  error: string | null;
}

interface ContentActions {
  // Videos
  loadVideos: () => Promise<void>;
  createVideo: (request: Omit<CreateLessonItemRequest, 'type'>) => Promise<LessonItem | null>;
  updateVideo: (id: string, request: UpdateLessonItemRequest) => Promise<LessonItem | null>;
  deleteVideo: (id: string) => Promise<boolean>;

  // Rich Content
  loadRichContents: () => Promise<void>;
  createRichContent: (request: Omit<CreateLessonItemRequest, 'type'>) => Promise<LessonItem | null>;
  updateRichContent: (id: string, request: UpdateLessonItemRequest) => Promise<LessonItem | null>;
  deleteRichContent: (id: string) => Promise<boolean>;

  // Questions
  loadQuestions: () => Promise<void>;
  createQuestion: (request: Omit<CreateLessonItemRequest, 'type'>) => Promise<LessonItem | null>;
  updateQuestion: (id: string, request: UpdateLessonItemRequest) => Promise<LessonItem | null>;
  deleteQuestion: (id: string) => Promise<boolean>;

  // Utilities
  getVideoById: (id: string) => LessonItem | undefined;
  getRichContentById: (id: string) => LessonItem | undefined;
  getQuestionById: (id: string) => LessonItem | undefined;
  reset: () => void;
}

type ContentStore = ContentState & ContentActions;

const initialState: ContentState = {
  videos: [],
  richContents: [],
  questions: [],
  isLoading: false,
  error: null,
};

export const useContentStore = create<ContentStore>((set, get) => ({
  ...initialState,

  // ==================== VIDEOS ====================
  loadVideos: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.getVideos();
      if (response.success) {
        set({ videos: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load videos', isLoading: false });
    }
  },

  createVideo: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.createVideo(request);
      if (response.success) {
        set(state => ({
          videos: [...state.videos, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to create video', isLoading: false });
      return null;
    }
  },

  updateVideo: async (id, request) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.updateVideo(id, request);
      if (response.success && response.data) {
        set(state => ({
          videos: state.videos.map(v => v.id === id ? response.data! : v),
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to update video', isLoading: false });
      return null;
    }
  },

  deleteVideo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.deleteVideo(id);
      if (response.success) {
        set(state => ({
          videos: state.videos.filter(v => v.id !== id),
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete video', isLoading: false });
      return false;
    }
  },

  // ==================== RICH CONTENT ====================
  loadRichContents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.getRichContents();
      if (response.success) {
        set({ richContents: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load rich content', isLoading: false });
    }
  },

  createRichContent: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.createRichContent(request);
      if (response.success) {
        set(state => ({
          richContents: [...state.richContents, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to create rich content', isLoading: false });
      return null;
    }
  },

  updateRichContent: async (id, request) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.updateRichContent(id, request);
      if (response.success && response.data) {
        set(state => ({
          richContents: state.richContents.map(r => r.id === id ? response.data! : r),
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to update rich content', isLoading: false });
      return null;
    }
  },

  deleteRichContent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.deleteRichContent(id);
      if (response.success) {
        set(state => ({
          richContents: state.richContents.filter(r => r.id !== id),
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete rich content', isLoading: false });
      return false;
    }
  },

  // ==================== QUESTIONS ====================
  loadQuestions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.getQuestions();
      if (response.success) {
        set({ questions: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load questions', isLoading: false });
    }
  },

  createQuestion: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.createQuestion(request);
      if (response.success) {
        set(state => ({
          questions: [...state.questions, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to create question', isLoading: false });
      return null;
    }
  },

  updateQuestion: async (id, request) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.updateQuestion(id, request);
      if (response.success && response.data) {
        set(state => ({
          questions: state.questions.map(q => q.id === id ? response.data! : q),
          isLoading: false,
        }));
        return response.data;
      }
      set({ error: response.message, isLoading: false });
      return null;
    } catch (error) {
      set({ error: 'Failed to update question', isLoading: false });
      return null;
    }
  },

  deleteQuestion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentService.deleteQuestion(id);
      if (response.success) {
        set(state => ({
          questions: state.questions.filter(q => q.id !== id),
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message, isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Failed to delete question', isLoading: false });
      return false;
    }
  },

  // ==================== UTILITIES ====================
  getVideoById: (id) => get().videos.find(v => v.id === id),
  getRichContentById: (id) => get().richContents.find(r => r.id === id),
  getQuestionById: (id) => get().questions.find(q => q.id === id),
  reset: () => set(initialState),
}));
