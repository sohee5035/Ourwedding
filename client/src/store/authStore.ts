import { create } from 'zustand';

interface Member {
  id: string;
  name: string;
  coupleId: string | null;
  role: 'bride' | 'groom';
}

interface Couple {
  id: string;
  inviteCode: string;
}

interface Partner {
  id: string;
  name: string;
  role: 'bride' | 'groom';
}

interface AuthState {
  member: Member | null;
  couple: Couple | null;
  partner: Partner | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  checkAuth: () => Promise<void>;
  register: (name: string, pin: string, role: 'bride' | 'groom') => Promise<{ success: boolean; error?: string }>;
  join: (name: string, pin: string, inviteCode: string) => Promise<{ success: boolean; error?: string }>;
  login: (name: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  member: null,
  couple: null,
  partner: null,
  isLoading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        set({
          member: data.member,
          couple: data.couple,
          partner: data.partner,
          isAuthenticated: !!data.member,
          isLoading: false,
        });
      } else {
        set({ member: null, couple: null, partner: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
      set({ member: null, couple: null, partner: null, isAuthenticated: false, isLoading: false });
    }
  },

  register: async (name: string, pin: string, role: 'bride' | 'groom') => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, pin, role }),
      });
      
      if (response.ok) {
        const data = await response.json();
        set({
          member: data.member,
          couple: data.couple,
          partner: null,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: '가입에 실패했습니다' };
    }
  },

  join: async (name: string, pin: string, inviteCode: string) => {
    try {
      const response = await fetch('/api/auth/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, pin, inviteCode }),
      });
      
      if (response.ok) {
        const data = await response.json();
        set({
          member: data.member,
          couple: data.couple,
          isAuthenticated: true,
        });
        await useAuthStore.getState().checkAuth();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: '합류에 실패했습니다' };
    }
  },

  login: async (name: string, pin: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, pin }),
      });
      
      if (response.ok) {
        const data = await response.json();
        set({
          member: data.member,
          couple: data.couple,
          isAuthenticated: true,
        });
        await useAuthStore.getState().checkAuth();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: '로그인에 실패했습니다' };
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
    set({ member: null, couple: null, partner: null, isAuthenticated: false });
  },
}));
