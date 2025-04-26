// userStore.ts
import { create } from 'zustand'
import { persist, PersistOptions, createJSONStorage } from 'zustand/middleware'
import { StateCreator } from 'zustand'

// Define the user interface
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  preferences?: Record<string, any>;
}

// Define the store state interface
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

// Define persistence configuration
type UserPersist = (
  config: StateCreator<UserState>,
  options: PersistOptions<UserState>
) => StateCreator<UserState>;

// Create the store with TypeScript
const useUserStore = create<UserState>(
  (persist as UserPersist)(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Actions
      setUser: (userData) => set({ 
        user: userData,
        isAuthenticated: !!userData,
        error: null
      }),
      
      updateUserProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        error: null
      }),
    }),
    {
      name: 'user-storage', // Name for the storage
      storage: typeof window !== 'undefined' 
        ? createJSONStorage(() => localStorage)
        : undefined,
    }
  )
)

export default useUserStore