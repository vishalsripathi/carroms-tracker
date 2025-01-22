import { Match } from './match';
import { Player } from './player';

export type TeamSide = 'team1' | 'team2';
export type MatchResult = 'W' | 'L';

// Common utility types for stats
export type SortBy = 'winRate' | 'games' | 'score' | 'streak';
export type TimeFrame = 'week' | 'month' | 'year' | 'all';

export interface BasicStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  avgScore: number;
  currentStreak: number;
  bestStreak: number;
}

export interface AdvancedStats {
  formGuide: Array<MatchResult>;
  avgScoreAsTeam1: number;
  avgScoreAsTeam2: number;
  preferredPartners: Array<{
    partnerId: string;
    gamesPlayed: number;
    winRate: number;
    avgScore: number;
  }>;
  matchHistory: Array<{
    matchId: string;
    date: Date;
    team: TeamSide;
    score: number;
    opponentScore: number;
    result: MatchResult;
    partner: string;
  }>;
  performance: {
    last5Games: number;
    last10Games: number;
    thisMonth: number;
    lastMonth: number;
  };
}

export interface Timeline {
  date: Date;
  type: 'match' | 'streak' | 'milestone';
  detail: string;
}

export interface PlayerStats {
  basic: BasicStats;
  advanced: AdvancedStats;
  timeline: Timeline[];
}

export interface TeamAnalytics {
  partnership: {
    players: [string, string];
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    avgScore: number;
    bestScore: number;
    worstScore: number;
    streaks: {
      current: number;
      best: number;
    };
    recentGames: Array<{
      matchId: string;
      date: Date;
      score: number;
      opponentScore: number;
      result: MatchResult;
    }>;
  };
  chemistry: number;
}

export interface LeaderboardEntry {
  player: Player;
  stats: PlayerStats;
  rank: number;
  rankChange: number;
  compositeScore: number;
}

export interface MatchInsights {
  general: {
    totalMatches: number;
    averageScore: number;
    highestScore: number;
    closestMatch: {
      matchId: string;
      score: string;
      date: Date;
    };
    mostDecisive: {
      matchId: string;
      score: string;
      date: Date;
    };
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

// Component Props Types
export interface PlayerStatsCardProps {
  playerName: string;
  stats: PlayerStats;
  matches?: Match[];
  playerId?: string;
  getPlayerName: (id: string) => string;
}

export interface TeamStatsCardProps {
  team: [string, string];
  analytics: TeamAnalytics;
  getPlayerName: (id: string) => string;
}

export interface StatsSummaryProps {
  insights: MatchInsights;
  players: Player[];
}