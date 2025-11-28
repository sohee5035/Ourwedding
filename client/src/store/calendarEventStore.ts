import { create } from 'zustand';
import type { CalendarEvent, InsertCalendarEvent } from '@shared/schema';

interface CalendarEventState {
  events: CalendarEvent[];
  isLoading: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<InsertCalendarEvent, 'coupleId'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<InsertCalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useCalendarEventStore = create<CalendarEventState>((set, get) => ({
  events: [],
  isLoading: false,

  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/calendar-events', { credentials: 'include' });
      if (response.ok) {
        const events = await response.json();
        set({ events });
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addEvent: async (event: Omit<InsertCalendarEvent, 'coupleId'>) => {
    try {
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(event),
      });
      if (response.ok) {
        const newEvent = await response.json();
        set({ events: [...get().events, newEvent] });
      }
    } catch (error) {
      console.error('Failed to add calendar event:', error);
    }
  },

  updateEvent: async (id: string, event: Partial<InsertCalendarEvent>) => {
    try {
      const response = await fetch(`/api/calendar-events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(event),
      });
      if (response.ok) {
        const updatedEvent = await response.json();
        set({ events: get().events.map((e) => (e.id === id ? updatedEvent : e)) });
      }
    } catch (error) {
      console.error('Failed to update calendar event:', error);
    }
  },

  deleteEvent: async (id: string) => {
    try {
      const response = await fetch(`/api/calendar-events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        set({ events: get().events.filter((e) => e.id !== id) });
      }
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
    }
  },
}));
