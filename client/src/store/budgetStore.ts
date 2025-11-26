import { create } from 'zustand';
import type { BudgetItem } from '../types';
import * as api from '../lib/api';

interface BudgetStore {
  items: BudgetItem[];
  loading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, item: Partial<BudgetItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getTotalBudget: () => number;
  getTotalActual: () => number;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchBudgetItems();
      set({ items: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch budget items:', error);
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    set({ loading: true });
    try {
      const newItem = await api.createBudgetItem(item);
      set((state) => ({ 
        items: [...state.items, newItem],
        loading: false 
      }));
    } catch (error) {
      console.error('Failed to add budget item:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateItem: async (id, updatedData) => {
    set({ loading: true });
    try {
      const updated = await api.updateBudgetItem(id, updatedData);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updated : item
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to update budget item:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ loading: true });
    try {
      await api.deleteBudgetItem(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to delete budget item:', error);
      set({ loading: false });
      throw error;
    }
  },

  getTotalBudget: () => {
    return get().items.reduce((sum, item) => sum + (item.budgetAmount || 0), 0);
  },

  getTotalActual: () => {
    return get().items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
  },
}));
