import { create } from 'zustand';
import type { EventCategory } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

interface EventCategoryState {
  categories: EventCategory[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useEventCategoryStore = create<EventCategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest('GET', '/api/event-categories');
      const data = await response.json();
      set({ categories: data, isLoading: false });
    } catch (error) {
      set({ error: '카테고리를 불러오는데 실패했습니다', isLoading: false });
    }
  },

  addCategory: async (name: string, color: string) => {
    try {
      const response = await apiRequest('POST', '/api/event-categories', { 
        name, 
        color
      });
      const newCategory = await response.json();
      set((state) => ({ categories: [...state.categories, newCategory] }));
    } catch (error) {
      set({ error: '카테고리 추가에 실패했습니다' });
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/event-categories/${id}`);
      set((state) => ({ 
        categories: state.categories.filter(c => c.id !== id) 
      }));
    } catch (error) {
      set({ error: '카테고리 삭제에 실패했습니다' });
    }
  },
}));
