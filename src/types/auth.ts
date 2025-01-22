import { Theme } from './common';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  joinedDate: Date;
  lastActive: Date;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    streak: number;
    lastPlayed: Date | null;
  };
  preferences: {
    notifications: boolean;
    theme: Theme;
  };
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  signOut: () => void;
  signIn: () => Promise<void>;
}

export interface AuthState {
  user: User | null;
  error: string | null;
  loading: boolean;
}