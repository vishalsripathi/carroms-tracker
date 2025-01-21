// services/teamGeneration.ts
import { Player } from '../types/player';

interface TeamGenerationResult {
  teams: [string, string][];
  teamNames: { team1: string[]; team2: string[] };
  strengths: { team1: number; team2: number };
}

export class TeamGenerationService {
  private calculatePlayerStrength(player: Player): number {
    const defaultStrength = 50;
    
    if (!player.stats) return defaultStrength;

    // Calculate win rate
    const winRate = (player.stats.wins / Math.max(player.stats.totalGames, 1)) * 100;
    
    // Experience factor (max 20 games)
    const experienceFactor = Math.min(player.stats.totalGames / 20, 1);
    
    // Recent performance (from streak)
    const streakBonus = player.stats.streak?.current 
      ? Math.min(Math.abs(player.stats.streak.current) * 2, 10) * 
        (player.stats.streak.current > 0 ? 1 : -1)
      : 0;

    return Math.round((winRate * experienceFactor) + streakBonus);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async generateTeams(availablePlayers: Player[]): Promise<TeamGenerationResult> {
    if (!availablePlayers || availablePlayers.length < 4) {
      throw new Error('Need at least 4 players to generate teams');
    }

    // Calculate strengths and create player pool
    const playerPool = availablePlayers.map(player => ({
      ...player,
      strength: this.calculatePlayerStrength(player)
    }));

    // Generate several team combinations and pick the most balanced one
    let bestTeams: [string, string][] | null = null;
    let bestStrengthDifference = Infinity;
    let bestStrengths = { team1: 0, team2: 0 };

    for (let attempt = 0; attempt < 10; attempt++) {
      // Shuffle all players
      const shuffledPlayers = this.shuffleArray(playerPool);
      
      // Split into two teams
      const team1 = shuffledPlayers.slice(0, 2);
      const team2 = shuffledPlayers.slice(2, 4);

      // Calculate team strengths
      const strength1 = team1.reduce((sum, p) => sum + p.strength, 0);
      const strength2 = team2.reduce((sum, p) => sum + p.strength, 0);
      
      // Calculate strength difference
      const strengthDiff = Math.abs(strength1 - strength2);

      // Keep if this is the most balanced combination so far
      if (strengthDiff < bestStrengthDifference) {
        bestStrengthDifference = strengthDiff;
        bestTeams = [
          [team1[0].id, team1[1].id],
          [team2[0].id, team2[1].id]
        ];
        bestStrengths = {
          team1: strength1,
          team2: strength2
        };
      }
    }

    if (!bestTeams) {
      throw new Error('Failed to generate balanced teams');
    }

    // Create team names array
    const teamNames = {
      team1: bestTeams[0].map(id => availablePlayers.find(p => p.id === id)?.name || 'Unknown'),
      team2: bestTeams[1].map(id => availablePlayers.find(p => p.id === id)?.name || 'Unknown')
    };

    return {
      teams: bestTeams,
      teamNames,
      strengths: bestStrengths
    };
  }
}

export default new TeamGenerationService();