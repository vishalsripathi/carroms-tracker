// types/match.ts
export interface Team {
  players: [string, string]; // player IDs
  score: number;
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
  history: MatchEvent[];
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

export type MatchEventType = 
  | 'creation' 
  | 'start' 
  | 'score_update' 
  | 'substitution' 
  | 'completion' 
  | 'status_update' 
  | 'result_confirmation'
  | 'edit';

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