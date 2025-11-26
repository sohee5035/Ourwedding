import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BudgetItem } from '../types';

interface BudgetStore {
  items: BudgetItem[];
  addItem: (item: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, item: Partial<BudgetItem>) => void;
  deleteItem: (id: string) => void;
  getTotalBudget: () => number;
  getTotalActual: () => number;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const newItem: BudgetItem = {
          ...item,
          id: Math.random().toString(36).substring(2, 9), // Simple ID generator
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, updatedData) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updatedData, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      getTotalBudget: () => {
        return get().items.reduce((sum, item) => sum + item.budgetAmount, 0);
      },

      getTotalActual: () => {
        return get().items.reduce((sum, item) => sum + item.actualAmount, 0);
      },
    }),
    {
      name: 'wedding-budget-storage', // Changed storage name to reset potential bad state
    }
  )
);
