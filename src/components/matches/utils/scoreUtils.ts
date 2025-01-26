import { MatchScore } from "../types";

export const validateScores = (scores: MatchScore): boolean => {
    if (scores.team1Score === scores.team2Score) return false;
    if (scores.team1Score < 0 || scores.team2Score < 0) return false;
    if (scores.team1Score > 29 || scores.team2Score > 29) return false;
    return true;
  };
  
  export const calculateWinner = (scores: MatchScore): 'team1' | 'team2' | null => {
    if (!validateScores(scores)) return null;
    return scores.team1Score > scores.team2Score ? 'team1' : 'team2';
  };