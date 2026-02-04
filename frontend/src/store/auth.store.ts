import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { AuthState } from '@/types/auth';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  reset: () =>
    set(initialState),
}));
