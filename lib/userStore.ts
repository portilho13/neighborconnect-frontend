// userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StateCreator } from 'zustand';
import { useEffect, useState } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  apartmentId: number;
  avatar: string;
  role: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (userData: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

type UserPersist = (
  config: StateCreator<UserState>,
  options: any
) => StateCreator<UserState>;

const useUserStore = create<UserState>()(
  (persist as UserPersist)(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (userData) =>
        set({
          user: userData,
          isAuthenticated: !!userData,
          error: null,
        }),

      updateUserProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
