import { create } from 'zustand';
import type { WeddingVenue } from '../types';
import * as api from '../lib/api';

interface VenueStore {
  venues: WeddingVenue[];
  loading: boolean;
  fetchVenues: () => Promise<void>;
  addVenue: (venue: Omit<WeddingVenue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateVenue: (id: string, venue: Partial<WeddingVenue>) => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  getVenueById: (id: string) => WeddingVenue | undefined;
}

export const useVenueStore = create<VenueStore>((set, get) => ({
  venues: [],
  loading: false,

  fetchVenues: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchVenues();
      set({ venues: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      set({ loading: false });
    }
  },

  addVenue: async (venue) => {
    set({ loading: true });
    try {
      const newVenue = await api.createVenue(venue);
      set((state) => ({ 
        venues: [...state.venues, newVenue],
        loading: false 
      }));
    } catch (error) {
      console.error('Failed to add venue:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateVenue: async (id, updatedData) => {
    set({ loading: true });
    try {
      const updated = await api.updateVenue(id, updatedData);
      set((state) => ({
        venues: state.venues.map((venue) =>
          venue.id === id ? updated : venue
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to update venue:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteVenue: async (id) => {
    set({ loading: true });
    try {
      await api.deleteVenue(id);
      set((state) => ({
        venues: state.venues.filter((venue) => venue.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to delete venue:', error);
      set({ loading: false });
      throw error;
    }
  },

  getVenueById: (id) => {
    return get().venues.find((venue) => venue.id === id);
  },
}));
