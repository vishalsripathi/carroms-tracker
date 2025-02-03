import { FirebaseTimestamp } from './match';
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
  createdBy: string;        // Add these
  createdByName: string;    // Add these
  history: PlayerHistoryEvent[]; // Add this
}

export interface PlayerHistoryEvent {
  type: 'creation' | 'update' | 'availability_change';
  timestamp: FirebaseTimestamp;
  userId: string;
  userName: string;
  data: {
    field?: string;
    teamGenerated?: boolean;
    teams?: any;
    availability?: any;
    oldValue?: any;
    newValue?: any;
  };
}

export interface PlayerFormData {
  name: string;
  email: string;
  availability: 'available' | 'unavailable';
}

// Common type for filtering and sorting
export type PlayerSortKey = 'name' | 'winRate' | 'totalGames' | 'lastPlayed';
export type SortDirection = 'asc' | 'desc';