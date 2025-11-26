import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeddingInfo } from '../types';

interface WeddingInfoStore extends WeddingInfo {
  updateInfo: (info: Partial<WeddingInfo>) => void;
  getDaysUntilWedding: () => number | null;
}

export const useWeddingInfoStore = create<WeddingInfoStore>()(
  persist(
    (set, get) => ({
      weddingDate: undefined,
      groomName: undefined,
      brideName: undefined,
      totalBudget: undefined,

      updateInfo: (info) => {
        set((state) => ({ ...state, ...info }));
      },

      getDaysUntilWedding: () => {
        const { weddingDate } = get();
        if (!weddingDate) return null;

        const today = new Date();
        const wedding = new Date(weddingDate);
        const diffTime = wedding.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
      },
    }),
    {
      name: 'wedding-info',
    }
  )
);
