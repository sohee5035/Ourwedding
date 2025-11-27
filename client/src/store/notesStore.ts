import { create } from 'zustand';
import type { SharedNote, InsertSharedNote } from '@shared/schema';

interface NotesState {
  notes: SharedNote[];
  isLoading: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (note: InsertSharedNote) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,

  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/notes');
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

  deleteNote: async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        set({ notes: get().notes.filter((n) => n.id !== id) });
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },
}));
