import { create } from 'zustand';
import type { WeddingVenue, VenueQuote, VenueWithQuotes } from '../types';
import * as api from '../lib/api';

interface VenueStore {
  venues: WeddingVenue[];
  venueQuotes: VenueQuote[];
  loading: boolean;
  fetchVenues: () => Promise<void>;
  fetchVenueQuotes: () => Promise<void>;
  addVenue: (venue: Omit<WeddingVenue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WeddingVenue>;
  updateVenue: (id: string, venue: Partial<WeddingVenue>) => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  addVenueQuote: (quote: Omit<VenueQuote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<VenueQuote>;
  updateVenueQuote: (id: string, quote: Partial<VenueQuote>) => Promise<void>;
  deleteVenueQuote: (id: string) => Promise<void>;
  getVenueById: (id: string) => WeddingVenue | undefined;
  getQuotesByVenueId: (venueId: string) => VenueQuote[];
  getVenuesWithQuotes: () => VenueWithQuotes[];
}

export const useVenueStore = create<VenueStore>((set, get) => ({
  venues: [],
  venueQuotes: [],
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

  fetchVenueQuotes: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchAllVenueQuotes();
      set({ venueQuotes: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch venue quotes:', error);
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
      return newVenue;
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
        venueQuotes: state.venueQuotes.filter((quote) => quote.venueId !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to delete venue:', error);
      set({ loading: false });
      throw error;
    }
  },

  addVenueQuote: async (quote) => {
    set({ loading: true });
    try {
      const newQuote = await api.createVenueQuote(quote);
      set((state) => ({
        venueQuotes: [...state.venueQuotes, newQuote],
        loading: false,
      }));
      return newQuote;
    } catch (error) {
      console.error('Failed to add venue quote:', error);
      set({ loading: false });
      throw error;
    }
  },

  updateVenueQuote: async (id, updatedData) => {
    set({ loading: true });
    try {
      const updated = await api.updateVenueQuote(id, updatedData);
      set((state) => ({
        venueQuotes: state.venueQuotes.map((quote) =>
          quote.id === id ? updated : quote
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to update venue quote:', error);
      set({ loading: false });
      throw error;
    }
  },

  deleteVenueQuote: async (id) => {
    set({ loading: true });
    try {
      await api.deleteVenueQuote(id);
      set((state) => ({
        venueQuotes: state.venueQuotes.filter((quote) => quote.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to delete venue quote:', error);
      set({ loading: false });
      throw error;
    }
  },

  getVenueById: (id) => {
    return get().venues.find((venue) => venue.id === id);
  },

  getQuotesByVenueId: (venueId) => {
    return get().venueQuotes.filter((quote) => quote.venueId === venueId);
  },

  getVenuesWithQuotes: () => {
    const { venues, venueQuotes } = get();
    return venues.map((venue) => ({
      ...venue,
      quotes: venueQuotes.filter((quote) => quote.venueId === venue.id),
    }));
  },
}));
