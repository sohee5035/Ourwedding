import { create } from 'zustand';
import type { SharedNote, InsertSharedNote } from '@shared/schema';

interface NotesState {
  notes: SharedNote[];
  isLoading: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (note: InsertSharedNote) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,

  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/notes', { credentials: 'include' });
      if (response.ok) {
        const notes = await response.json();
        set({ notes });
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addNote: async (note: InsertSharedNote) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(note),
      });
      if (response.ok) {
        const newNote = await response.json();
        set({ notes: [...get().notes, newNote] });
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  },

  updateNote: async (id: string, content: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      if (response.ok) {
        const updatedNote = await response.json();
        set({ notes: get().notes.map((n) => (n.id === id ? updatedNote : n)) });
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  },

  deleteNote: async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        set({ notes: get().notes.filter((n) => n.id !== id) });
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },
}));
