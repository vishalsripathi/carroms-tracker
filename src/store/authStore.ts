import { create } from 'zustand'
import { AuthStore } from '../types'

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => 
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    }),
  signOut: () => 
    set({ 
      user: null, 
      isAuthenticated: false,
      isLoading: false 
    }),
}))