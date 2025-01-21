import { create } from 'zustand'
import { 
  User as FirebaseUser,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth'
import { auth } from '../services/firebase'

interface AuthState {
  user: FirebaseUser | null
  isLoading: boolean
  error: string | null
  initialized: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: FirebaseUser | null) => void
  setError: (error: string | null) => void
  setInitialized: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  error: null,
  initialized: false,
  
  signIn: async () => {
    try {
      set({ isLoading: true, error: null })
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      set({ 
        user: result.user, 
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in', 
        isLoading: false 
      })
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth)
      set({ 
        user: null, 
        error: null,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out',
        isLoading: false 
      })
    }
  },

  setUser: (user) => set({ 
    user, 
    isLoading: false
  }),
  
  setError: (error) => set({ error }),

  setInitialized: (value) => set({ initialized: value })
}))