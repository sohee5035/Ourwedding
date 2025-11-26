import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChecklistItem } from '../types';

interface ChecklistStore {
  items: ChecklistItem[];
  addItem: (item: Omit<ChecklistItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, item: Partial<ChecklistItem>) => void;
  deleteItem: (id: string) => void;
  toggleComplete: (id: string) => void;
}

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) => {
        const newItem: ChecklistItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, updatedData) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updatedData } : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        }));
      },
    }),
    {
      name: 'wedding-checklist',
    }
  )
);
