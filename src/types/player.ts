export interface Player {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  stats: PlayerStats;
  availability: {
    status: 'available' | 'unavailable';
    lastUpdated: Date;
  };
  lastPlayed?: Date;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winPercentage: number;
  skillRating: number;
  recentPerformance: number;
  preferredPartners: string[];
  streak: {
    current: number;
    best: number;
    type: 'win' | 'loss' | null;
  };
}

export interface PlayerFormData {
  name: string;
  email: string;
  availability: 'available' | 'unavailable';
}