import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeddingVenue } from '../types';

interface VenueStore {
  venues: WeddingVenue[];
  addVenue: (venue: Omit<WeddingVenue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateVenue: (id: string, venue: Partial<WeddingVenue>) => void;
  deleteVenue: (id: string) => void;
  getVenueById: (id: string) => WeddingVenue | undefined;
}

export const useVenueStore = create<VenueStore>()(
  persist(
    (set, get) => ({
      venues: [],

      addVenue: (venue) => {
        const newVenue: WeddingVenue = {
          ...venue,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ venues: [...state.venues, newVenue] }));
      },

      updateVenue: (id, updatedData) => {
        set((state) => ({
          venues: state.venues.map((venue) =>
            venue.id === id
              ? { ...venue, ...updatedData, updatedAt: new Date().toISOString() }
              : venue
          ),
        }));
      },

      deleteVenue: (id) => {
        set((state) => ({
          venues: state.venues.filter((venue) => venue.id !== id),
        }));
      },

      getVenueById: (id) => {
        return get().venues.find((venue) => venue.id === id);
      },
    }),
    {
      name: 'wedding-venues',
    }
  )
);
