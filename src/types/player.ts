import { BasicStats } from './stats';

export interface Player {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  stats: BasicStats & {
    winPercentage: number;
    skillRating: number;
    recentPerformance: number;
    preferredPartners: string[];
    streak: {
      current: number;
      best: number;
      type: 'win' | 'loss' | null;
    };
  };
  availability: {
    status: 'available' | 'unavailable';
    lastUpdated: Date;
  };
  lastPlayed?: Date;
  createdAt: Date;
}

export interface PlayerFormData {
  name: string;
  email: string;
  availability: 'available' | 'unavailable';
}

// Common type for filtering and sorting
export type PlayerSortKey = 'name' | 'winRate' | 'totalGames' | 'lastPlayed';
export type SortDirection = 'asc' | 'desc';