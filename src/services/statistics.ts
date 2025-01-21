import { Match } from '../types/match';
import { Player } from '../types/player';

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  preferredPartners: Array<{
    partnerId: string;
    gamesPlayed: number;
    winRate: number;
  }>;
  recentPerformance: Array<{
    matchId: string;
    date: Date;
    result: 'win' | 'loss';
    score: number;
  }>;
}

export interface TeamStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  totalPoints: number;
}

export class StatisticsService {
  calculatePlayerStats(playerId: string, matches: Match[]): PlayerStats {
    const playerMatches = matches.filter(match => 
      match.teams.team1.players.includes(playerId) ||
      match.teams.team2.players.includes(playerId)
    );

    const stats: PlayerStats = {
      totalGames: playerMatches.length,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      preferredPartners: [],
      recentPerformance: []
    };

    let currentStreak = 0;
    let longestStreak = 0;
    let totalScore = 0;
    const partnerStats = new Map<string, { wins: number; games: number }>();

    // Process matches chronologically
    playerMatches
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(match => {
        const isTeam1 = match.teams.team1.players.includes(playerId);
        const team = isTeam1 ? match.teams.team1 : match.teams.team2;
        const opposingTeam = isTeam1 ? match.teams.team2 : match.teams.team1;
        const isWin = match.winner === (isTeam1 ? 'team1' : 'team2');

        // Update basic stats
        if (isWin) {
          stats.wins++;
          currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
        } else {
          stats.losses++;
          currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
        }

        longestStreak = Math.max(longestStreak, Math.abs(currentStreak));
        totalScore += team.score;

        // Track partner stats
        const partner = team.players.find(p => p !== playerId);
        if (partner) {
          const partnerData = partnerStats.get(partner) || { wins: 0, games: 0 };
          partnerStats.set(partner, {
            wins: partnerData.wins + (isWin ? 1 : 0),
            games: partnerData.games + 1
          });
        }

        // Track recent performance
        if (stats.recentPerformance.length < 5) {
          stats.recentPerformance.push({
            matchId: match.id,
            date: match.date,
            result: isWin ? 'win' : 'loss',
            score: team.score
          });
        }
      });

    // Calculate derived stats
    stats.winRate = (stats.wins / stats.totalGames) * 100;
    stats.averageScore = totalScore / stats.totalGames;
    stats.currentStreak = currentStreak;
    stats.longestStreak = longestStreak;

    // Process preferred partners
    stats.preferredPartners = Array.from(partnerStats.entries())
      .map(([partnerId, data]) => ({
        partnerId,
        gamesPlayed: data.games,
        winRate: (data.wins / data.games) * 100
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 3); // Top 3 partners

    return stats;
  }

  calculateTeamStats(team: [string, string], matches: Match[]): TeamStats {
    const teamMatches = matches.filter(match => {
      const isTeam1 = match.teams.team1.players.every(p => team.includes(p));
      const isTeam2 = match.teams.team2.players.every(p => team.includes(p));
      return isTeam1 || isTeam2;
    });

    const stats: TeamStats = {
      gamesPlayed: teamMatches.length,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageScore: 0,
      totalPoints: 0
    };

    teamMatches.forEach(match => {
      const isTeam1 = match.teams.team1.players.every(p => team.includes(p));
      const teamData = isTeam1 ? match.teams.team1 : match.teams.team2;
      const isWin = match.winner === (isTeam1 ? 'team1' : 'team2');

      if (isWin) stats.wins++;
      else stats.losses++;

      stats.totalPoints += teamData.score;
    });

    stats.winRate = (stats.wins / stats.gamesPlayed) * 100;
    stats.averageScore = stats.totalPoints / stats.gamesPlayed;

    return stats;
  }

  getLeaderboard(players: Player[], matches: Match[]): Array<{
    playerId: string;
    stats: PlayerStats;
  }> {
    return players
      .map(player => ({
        playerId: player.id,
        stats: this.calculatePlayerStats(player.id, matches)
      }))
      .sort((a, b) => b.stats.winRate - a.stats.winRate);
  }

  getMostSuccessfulPairings(matches: Match[]): Array<{
    players: [string, string];
    stats: TeamStats;
  }> {
    const teams = new Map<string, [string, string]>();
    
    // Collect all unique team combinations
    matches.forEach(match => {
      [match.teams.team1, match.teams.team2].forEach(team => {
        const teamKey = team.players.sort().join('-');
        if (!teams.has(teamKey)) {
          teams.set(teamKey, team.players as [string, string]);
        }
      });
    });

    // Calculate stats for each team
    return Array.from(teams.values())
      .map(team => ({
        players: team,
        stats: this.calculateTeamStats(team, matches)
      }))
      .filter(team => team.stats.gamesPlayed >= 3) // Min 3 games played together
      .sort((a, b) => b.stats.winRate - a.stats.winRate);
  }
}