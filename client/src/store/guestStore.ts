import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Guest } from '../types';

interface GuestStore {
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => void;
  updateGuest: (id: string, guest: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  getGuestsBySide: (side: 'groom' | 'bride') => Guest[];
  getAttendingCount: () => number;
}

export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      guests: [],

      addGuest: (guest) => {
        const newGuest: Guest = {
          ...guest,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ guests: [...state.guests, newGuest] }));
      },

      updateGuest: (id, updatedData) => {
        set((state) => ({
          guests: state.guests.map((guest) =>
            guest.id === id ? { ...guest, ...updatedData } : guest
          ),
        }));
      },

      deleteGuest: (id) => {
        set((state) => ({
          guests: state.guests.filter((guest) => guest.id !== id),
        }));
      },

      getGuestsBySide: (side) => {
        return get().guests.filter((guest) => guest.side === side);
      },

      getAttendingCount: () => {
        return get().guests.filter((guest) => guest.attendance === 'attending').length;
      },
    }),
    {
      name: 'wedding-guests',
    }
  )
);
