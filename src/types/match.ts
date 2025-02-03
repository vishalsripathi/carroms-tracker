// types/match.ts
import { Timestamp } from 'firebase/firestore';

export type FirebaseTimestamp = Timestamp;

export interface Team {
  players: [string, string]; // player IDs
  score: number;
}

// export interface FirebaseTimestamp {
//   getTime: any;
//   seconds: number;
//   nanoseconds: number;
// }

export interface MatchHistoryEvent {
  userId: string;
  userName: string;
  timestamp: FirebaseTimestamp;
  type: 
  | 'creation' 
  | 'start' 
  | 'score_update' 
  | 'substitution' 
  | 'completion' 
  | 'status_update' 
  | 'result_confirmation'
  | 'edit'
  | 'reschedule'
  | 'deletion'
  | 'comment';
  data: {
    reason?: string;
    // Reschedule data
    newDate?: FirebaseTimestamp;
    oldDate?: FirebaseTimestamp;
    
    // Status change data
    newStatus?: string;
    oldStatus?: string;
    
    // Score update data
    newScores?: {
      team1Score: number;
      team2Score: number;
    };
    oldScores?: {
      team1: number;
      team2: number;
    };
    
    // Match edit data
    status?: string;
    finalScores?: {
      team1Score: number;
      team2Score: number;
    };
    winner?: 'team1' | 'team2';
    
    // Creation specific data
    teamGenerated?: boolean;
    teams?: {
      team1: string[];
      team2: string[];
    };

    // Substitution data
    oldPlayerId?: string;
    newPlayerId?: string;
    team?: 'team1' | 'team2';
    
    // Comment data
    text?: string;
  };
}

export interface MatchSummary {
  matchId: string;
  score: string;
  date: Date;
}

export interface MatchInsights {
  general: {
    totalMatches: number;
    averageScore: number;
    highestScore: number;
    closestMatch: MatchSummary;
    mostDecisive: MatchSummary;
  };
  trends: {
    byDay: Record<string, number>;
    byTime: Record<string, number>;
    averageScoresTrend: Array<{
      date: Date;
      avgScore: number;
    }>;
  };
}

export interface Match {
  id: string;
  date: Date;
  teams: {
    team1: Team;
    team2: Team;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  winner: 'team1' | 'team2' | null;
  createdAt: Date;
  updatedAt: Date;
  history: MatchHistoryEvent[];
  confirmedBy?: string[];
  createdBy: string;
  createdByName: string;
  comments?: MatchEvent[];
  substitutions?: {
    team1: Array<{ out: string; in: string; time: Date }>;
    team2: Array<{ out: string; in: string; time: Date }>;
  };
}

export interface MatchFormData {
  date: string;
  team1Players: [string, string];
  team2Players: [string, string];
}


  export interface MatchEvent {
    type: 
      | 'creation' 
      | 'start' 
      | 'score_update' 
      | 'substitution' 
      | 'completion' 
      | 'status_update' 
      | 'result_confirmation'
      | 'edit'
      | 'reschedule'
      | 'deletion'
      | 'comment';
    timestamp: Date;
    userId: string;
    userName: string;
    data: {
      // Common fields
      reason?: string;
      
      // Score update
      oldScores?: {
        team1: number;
        team2: number;
      };
      newScores?: {
        team1Score: number;
        team2Score: number;
      };
      
      // Status change
      oldStatus?: Match['status'];
      newStatus?: Match['status'];
      
      // Substitution
      oldPlayerId?: string;
      newPlayerId?: string;
      team?: 'team1' | 'team2';
      
      // Reschedule
      oldDate?: Date;
      newDate?: Date;
      
      // Comment
      text?: string;
    };
  }

  export interface MatchAnalytics {
    matchId: string;
    date: Date;
    duration?: number; // in minutes
    finalScore: {
      team1: number;
      team2: number;
    };
    teams: {
      team1: {
        players: string[];
        substitutions: number;
      };
      team2: {
        players: string[];
        substitutions: number;
      };
    };
    matchQuality?: {
      competitiveness: number; // how close the scores were
      playerBalance: number; // how well-matched the teams were
    };
  }