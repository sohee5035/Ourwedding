import { create } from 'zustand';
import type { Guest, GroupGuest } from '../types';
import * as api from '../lib/api';

interface GuestStore {
  guests: Guest[];
  groupGuests: GroupGuest[];
  guestLoading: boolean;
  groupGuestLoading: boolean;
  fetchGuests: () => Promise<void>;
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => Promise<void>;
  updateGuest: (id: string, guest: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  fetchGroupGuests: () => Promise<void>;
  addGroupGuest: (groupGuest: Omit<GroupGuest, 'id' | 'createdAt'>) => Promise<void>;
  updateGroupGuest: (id: string, groupGuest: Partial<GroupGuest>) => Promise<void>;
  deleteGroupGuest: (id: string) => Promise<void>;
  getGuestsBySide: (side: 'groom' | 'bride') => Guest[];
  getGroupGuestsBySide: (side: 'groom' | 'bride') => GroupGuest[];
  getAttendingCount: () => number;
  getTotalEstimatedCount: () => number;
}

export const useGuestStore = create<GuestStore>((set, get) => ({
  guests: [],
  groupGuests: [],
  guestLoading: false,
  groupGuestLoading: false,

  fetchGuests: async () => {
    set({ guestLoading: true });
    try {
      const data = await api.fetchGuests();
      set({ guests: data, guestLoading: false });
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      set({ guestLoading: false });
    }
  },

  addGuest: async (guest) => {
    set({ guestLoading: true });
    try {
      const newGuest = await api.createGuest(guest);
      set((state) => ({ 
        guests: [...state.guests, newGuest],
        guestLoading: false 
      }));
    } catch (error) {
      console.error('Failed to add guest:', error);
      set({ guestLoading: false });
      throw error;
    }
  },

  updateGuest: async (id, updatedData) => {
    set({ guestLoading: true });
    try {
      const updated = await api.updateGuest(id, updatedData);
      set((state) => ({
        guests: state.guests.map((guest) =>
          guest.id === id ? updated : guest
        ),
        guestLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update guest:', error);
      set({ guestLoading: false });
      throw error;
    }
  },

  deleteGuest: async (id) => {
    set({ guestLoading: true });
    try {
      await api.deleteGuest(id);
      set((state) => ({
        guests: state.guests.filter((guest) => guest.id !== id),
        guestLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete guest:', error);
      set({ guestLoading: false });
      throw error;
    }
  },

  fetchGroupGuests: async () => {
    set({ groupGuestLoading: true });
    try {
      const data = await api.fetchGroupGuests();
      set({ groupGuests: data, groupGuestLoading: false });
    } catch (error) {
      console.error('Failed to fetch group guests:', error);
      set({ groupGuestLoading: false });
    }
  },

  addGroupGuest: async (groupGuest) => {
    set({ groupGuestLoading: true });
    try {
      const newGroupGuest = await api.createGroupGuest(groupGuest);
      set((state) => ({ 
        groupGuests: [...state.groupGuests, newGroupGuest],
        groupGuestLoading: false 
      }));
    } catch (error) {
      console.error('Failed to add group guest:', error);
      set({ groupGuestLoading: false });
      throw error;
    }
  },

  updateGroupGuest: async (id, updatedData) => {
    set({ groupGuestLoading: true });
    try {
      const updated = await api.updateGroupGuest(id, updatedData);
      set((state) => ({
        groupGuests: state.groupGuests.map((groupGuest) =>
          groupGuest.id === id ? updated : groupGuest
        ),
        groupGuestLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update group guest:', error);
      set({ groupGuestLoading: false });
      throw error;
    }
  },

  deleteGroupGuest: async (id) => {
    set({ groupGuestLoading: true });
    try {
      await api.deleteGroupGuest(id);
      set((state) => ({
        groupGuests: state.groupGuests.filter((groupGuest) => groupGuest.id !== id),
        groupGuestLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete group guest:', error);
      set({ groupGuestLoading: false });
      throw error;
    }
  },

  getGuestsBySide: (side) => {
    return get().guests.filter((guest) => guest.side === side);
  },

  getGroupGuestsBySide: (side) => {
    return get().groupGuests.filter((groupGuest) => groupGuest.side === side);
  },

  getAttendingCount: () => {
    return get().guests.filter((guest) => guest.attendance === 'attending').length;
  },

  getTotalEstimatedCount: () => {
    const individualCount = get().guests.length;
    const groupCount = get().groupGuests.reduce((sum, g) => sum + g.estimatedCount, 0);
    return individualCount + groupCount;
  },
}));
