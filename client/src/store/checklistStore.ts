import { create } from 'zustand';
import type { ChecklistItem } from '../types';
import * as api from '../lib/api';

interface ChecklistStore {
  items: ChecklistItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<ChecklistItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (id: string, item: Partial<ChecklistItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}

export const useChecklistStore = create<ChecklistStore>((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchChecklistItems();
      set({ items: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch checklist items:', error);
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    set({ loading: true });
    try {
      const newItem = await api.createChecklistItem(item);
      set((state) => ({ 
        items: [...state.items, newItem],
        loading: false 
      }));
    } catch (error) {
      console.error('Failed to add checklist item:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateItem: async (id, updatedData) => {
    set({ loading: true });
    try {
      const updated = await api.updateChecklistItem(id, updatedData);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updated : item
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to update checklist item:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ loading: true });
    try {
      await api.deleteChecklistItem(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to delete checklist item:', error);
      set({ loading: false });
      throw error;
    }
  },

  toggleComplete: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      await get().updateItem(id, { completed: !item.completed });
    }
  },
}));
