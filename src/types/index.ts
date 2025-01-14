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
      theme: 'light' | 'dark';
    };
  }
  
  export interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    signOut: () => void;
  }
  
  export interface Match {
    id: string;
    date: Date;
    teams: {
      team1: {
        players: [string, string]; // user IDs
        score: number;
      };
      team2: {
        players: [string, string];
        score: number;
      };
    };
    status: 'scheduled' | 'completed' | 'cancelled';
    winner: 'team1' | 'team2' | null;
    createdAt: Date;
    updatedAt: Date;
  }