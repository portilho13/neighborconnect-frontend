import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StateCreator } from 'zustand';

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
  hasHydrated: boolean; // <--- NEW

  // Actions
  setUser: (userData: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  setHasHydrated: (hydrated: boolean) => void; // <--- NEW
}

type UserPersist = (
  config: StateCreator<UserState>,
  options: any
) => StateCreator<UserState>;

const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour

const customStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    if (!item) return null;

    try {
      const data = JSON.parse(item);
      const now = Date.now();

      if (data.timestamp && now - data.timestamp > EXPIRATION_TIME) {
        localStorage.removeItem(name);
        return null;
      }

      return data.state;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    const wrapped = {
      state: value,
      timestamp: Date.now(),
    };
    localStorage.setItem(name, JSON.stringify(wrapped));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

const useUserStore = create<UserState>()(
  (persist as UserPersist)(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false, // <--- default false

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

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }), // <--- setter
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state: UserState | undefined) => {
        state?.setHasHydrated(true);
      },      
    }
  )
);

export default useUserStore;
