/**
 * Category Store - Zustand store for category state management
 */

import { create } from 'zustand';
import { Category } from '@/lib/api/types';
import { categoryService } from '@/lib/api/services';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

interface CategoryActions {
  loadCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  reset: () => void;
}

type CategoryStore = CategoryState & CategoryActions;

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  ...initialState,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryService.getAll();
      if (response.success) {
        set({ categories: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load categories', isLoading: false });
    }
  },

  getCategoryById: (id: string) => {
    return get().categories.find(c => c.id === id);
  },

  reset: () => set(initialState),
}));
