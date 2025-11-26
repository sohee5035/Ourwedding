import { create } from 'zustand';
import type { Guest } from '../types';
import * as api from '../lib/api';

interface GuestStore {
  guests: Guest[];
  loading: boolean;
  fetchGuests: () => Promise<void>;
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => Promise<void>;
  updateGuest: (id: string, guest: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  getGuestsBySide: (side: 'groom' | 'bride') => Guest[];
  getAttendingCount: () => number;
}

export const useGuestStore = create<GuestStore>((set, get) => ({
  guests: [],
  loading: false,

  fetchGuests: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchGuests();
      set({ guests: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      set({ loading: false });
    }
  },

  addGuest: async (guest) => {
    set({ loading: true });
    try {
      const newGuest = await api.createGuest(guest);
      set((state) => ({ 
        guests: [...state.guests, newGuest],
        loading: false 
      }));
    } catch (error) {
      console.error('Failed to add guest:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateGuest: async (id, updatedData) => {
    set({ loading: true });
    try {
      const updated = await api.updateGuest(id, updatedData);
      set((state) => ({
        guests: state.guests.map((guest) =>
          guest.id === id ? updated : guest
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to update guest:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteGuest: async (id) => {
    set({ loading: true });
    try {
      await api.deleteGuest(id);
      set((state) => ({
        guests: state.guests.filter((guest) => guest.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to delete guest:', error);
      set({ loading: false });
      throw error;
    }
  },

  getGuestsBySide: (side) => {
    return get().guests.filter((guest) => guest.side === side);
  },

  getAttendingCount: () => {
    return get().guests.filter((guest) => guest.attendance === 'attending').length;
  },
}));
