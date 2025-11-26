import { create } from 'zustand';
import type { WeddingInfo } from '../types';
import * as api from '../lib/api';

interface WeddingInfoStore extends WeddingInfo {
  loading: boolean;
  fetchInfo: () => Promise<void>;
  updateInfo: (info: Partial<WeddingInfo>) => Promise<void>;
  getDaysUntilWedding: () => number | null;
}

export const useWeddingInfoStore = create<WeddingInfoStore>((set, get) => ({
  weddingDate: undefined,
  groomName: undefined,
  brideName: undefined,
  totalBudget: undefined,
  loading: false,

  fetchInfo: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchWeddingInfo();
      set({
        weddingDate: data.weddingDate || undefined,
        groomName: data.groomName || undefined,
        brideName: data.brideName || undefined,
        totalBudget: data.totalBudget || undefined,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch wedding info:', error);
      set({ loading: false });
    }
  },

  updateInfo: async (info) => {
    set({ loading: true });
    try {
      const data = await api.updateWeddingInfo(info);
      set({
        weddingDate: data.weddingDate || undefined,
        groomName: data.groomName || undefined,
        brideName: data.brideName || undefined,
        totalBudget: data.totalBudget || undefined,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to update wedding info:', error);
      set({ loading: false });
      throw error;
    }
  },

  getDaysUntilWedding: () => {
    const { weddingDate } = get();
    if (!weddingDate) return null;

    const today = new Date();
    const wedding = new Date(weddingDate);
    today.setHours(0, 0, 0, 0);
    wedding.setHours(0, 0, 0, 0);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },
}));
