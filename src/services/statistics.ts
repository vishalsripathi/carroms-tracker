// services/statistics.ts

import { 
  Match, 
  Player,
  PlayerStats, 
  BasicStats,
  AdvancedStats,
  TeamAnalytics,
  Timeline,
  MatchInsights,
  LeaderboardEntry,
  TeamSide, 
  MatchResult,
  MatchSummary
} from '../types';

export class StatisticsService {
  // Helper method to get which team a player was on
  private getTeamSide(match: Match, playerId: string): TeamSide {
    return match.teams.team1.players.includes(playerId) ? 'team1' : 'team2';
  }

  // Get matches for a specific player, sorted by date
  private getPlayerMatches(playerId: string, matches: Match[]): Match[] {
    return matches
      .filter(match => 
        match.teams.team1.players.includes(playerId) ||
        match.teams.team2.players.includes(playerId)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Calculate basic statistics for a player
  private calculateBasicStats(playerId: string, matches: Match[]): BasicStats {
    const playerMatches = matches.filter(match => 
      match.teams.team1.players.includes(playerId) ||
      match.teams.team2.players.includes(playerId)
    );

    let wins = 0, losses = 0, totalScore = 0;
    let currentStreak = 0, bestStreak = 0;

    playerMatches.forEach(match => {
      const teamSide = this.getTeamSide(match, playerId);
      const isWin = match.winner === teamSide;
      const score = match.teams[teamSide].score;

      totalScore += score;
      
      if (isWin) {
        wins++;
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
      } else {
        losses++;
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
      }
      bestStreak = Math.max(bestStreak, Math.abs(currentStreak));
    });

    return {
      totalGames: playerMatches.length,
      wins,
      losses,
      winRate: playerMatches.length > 0 ? (wins / playerMatches.length) * 100 : 0,
      avgScore: playerMatches.length > 0 ? totalScore / playerMatches.length : 0,
      currentStreak,
      bestStreak
    };
  }

  // Calculate advanced statistics for a player
  private calculateAdvancedStats(playerId: string, matches: Match[]): AdvancedStats {
    const playerMatches = this.getPlayerMatches(playerId, matches);
    const partnerStats = new Map<string, { games: number; wins: number; totalScore: number }>();

    // Calculate form guide from last 5 matches
    const formGuide = playerMatches.slice(0, 5).map(match => {
      const teamSide = this.getTeamSide(match, playerId);
      return match.winner === teamSide ? 'W' : 'L';
    });

    // Calculate team-specific scores
    let team1Games = 0, team1Score = 0;
    let team2Games = 0, team2Score = 0;

    playerMatches.forEach(match => {
      const teamSide = this.getTeamSide(match, playerId);
      const score = match.teams[teamSide].score;
      const isWin = match.winner === teamSide;
      const partner = match.teams[teamSide].players.find(p => p !== playerId);

      if (teamSide === 'team1') {
        team1Games++;
        team1Score += score;
      } else {
        team2Games++;
        team2Score += score;
      }

      if (partner) {
        const stats = partnerStats.get(partner) || { games: 0, wins: 0, totalScore: 0 };
        stats.games++;
        if (isWin) stats.wins++;
        stats.totalScore += score;
        partnerStats.set(partner, stats);
      }
    });

    const preferredPartners = Array.from(partnerStats.entries())
      .map(([partnerId, stats]) => ({
        partnerId,
        gamesPlayed: stats.games,
        winRate: (stats.wins / stats.games) * 100,
        avgScore: stats.totalScore / stats.games
      }))
      .sort((a, b) => b.winRate - a.winRate);

    // Calculate match history
    const matchHistory = playerMatches.map(match => {
      const teamSide = this.getTeamSide(match, playerId);
      const opposingTeam: TeamSide = teamSide === 'team1' ? 'team2' : 'team1';
      const partner = match.teams[teamSide].players.find(p => p !== playerId) || '';

      return {
        matchId: match.id,
        date: match.date,
        team: teamSide,
        score: match.teams[teamSide].score,
        opponentScore: match.teams[opposingTeam].score,
        result: match.winner === teamSide ? 'W' : 'L'as MatchResult,
        partner
      };
    });

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    return {
      formGuide,
      avgScoreAsTeam1: team1Games > 0 ? team1Score / team1Games : 0,
      avgScoreAsTeam2: team2Games > 0 ? team2Score / team2Games : 0,
      preferredPartners,
      matchHistory,
      performance: {
        last5Games: this.calculatePerformanceScore(playerMatches.slice(0, 5), playerId),
        last10Games: this.calculatePerformanceScore(playerMatches.slice(0, 10), playerId),
        thisMonth: this.calculatePerformanceScore(
          playerMatches.filter(m => m.date >= lastMonth),
          playerId
        ),
        lastMonth: this.calculatePerformanceScore(
          playerMatches.filter(m => 
            m.date >= new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, lastMonth.getDate()) &&
            m.date < lastMonth
          ),
          playerId
        )
      }
    };
  }

  // Calculate performance score for a set of matches
  private calculatePerformanceScore(matches: Match[], playerId: string): number {
    if (matches.length === 0) return 0;

    return matches.reduce((score, match, index) => {
      const teamSide = this.getTeamSide(match, playerId);
      const weight = 1 - (index / matches.length) * 0.5; // Recent matches weighted more
      const isWin = match.winner === teamSide;
      const matchScore = match.teams[teamSide].score;
      
      return score + (((isWin ? 1 : 0) * 50 + matchScore) * weight);
    }, 0) / matches.length;
  }

  // Generate timeline events for a player
  private generatePlayerTimeline(playerId: string, matches: Match[]): Timeline[] {
    const timeline: Timeline[] = [];
    let currentStreak = 0;
    const playerMatches = this.getPlayerMatches(playerId, matches);

    playerMatches.forEach((match, index) => {
      const teamSide = this.getTeamSide(match, playerId);
      const isWin = match.winner === teamSide;
      const opposingTeam = teamSide === 'team1' ? 'team2' : 'team1';

      // Add match event
      timeline.push({
        date: match.date,
        type: 'match',
        detail: `${isWin ? 'Won' : 'Lost'} against ${
          match.teams[opposingTeam].players.join(' & ')
        } (${match.teams[teamSide].score}-${
          match.teams[opposingTeam].score
        })`
      });

      // Track streaks
      if (isWin) {
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
      } else {
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
      }

      // Add streak milestones
      if (Math.abs(currentStreak) === 3) {
        timeline.push({
          date: match.date,
          type: 'streak',
          detail: `Achieved a ${currentStreak > 0 ? 'winning' : 'losing'} streak of ${
            Math.abs(currentStreak)
          } games`
        });
      }

      // Add game count milestones
      if (index === 9) {
        timeline.push({
          date: match.date,
          type: 'milestone',
          detail: 'Completed 10 matches'
        });
      }
    });

    return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Public method to get comprehensive player statistics
  public calculatePlayerStats(playerId: string, matches: Match[]): PlayerStats {
    const basic = this.calculateBasicStats(playerId, matches);
    const advanced = this.calculateAdvancedStats(playerId, matches);
    const timeline = this.generatePlayerTimeline(playerId, matches);

    return { basic, advanced, timeline };
  }

  // Calculate chemistry and stats for a team pair
  public calculateTeamChemistry(team: [string, string], matches: Match[]): TeamAnalytics {
    const teamMatches = matches.filter(match =>
      (match.teams.team1.players.includes(team[0]) && match.teams.team1.players.includes(team[1])) ||
      (match.teams.team2.players.includes(team[0]) && match.teams.team2.players.includes(team[1]))
    );

    if (teamMatches.length === 0) {
      return {
        partnership: {
          players: team,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          avgScore: 0,
          bestScore: 0,
          worstScore: 0,
          streaks: { current: 0, best: 0 },
          recentGames: []
        },
        chemistry: 0
      };
    }

    let wins = 0, totalScore = 0;
    let bestScore = 0, worstScore = Infinity;
    let currentStreak = 0, bestStreak = 0;
    const recentGames: TeamAnalytics['partnership']['recentGames'] = [];

    teamMatches.forEach(match => {
      const teamSide = match.teams.team1.players.includes(team[0]) ? 'team1' : 'team2';
      const opposingTeam = teamSide === 'team1' ? 'team2' : 'team1';
      const score = match.teams[teamSide].score;
      const isWin = match.winner === teamSide;

      totalScore += score;
      bestScore = Math.max(bestScore, score);
      worstScore = Math.min(worstScore, score);

      if (isWin) {
        wins++;
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
      } else {
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
      }
      bestStreak = Math.max(bestStreak, Math.abs(currentStreak));

      recentGames.push({
        matchId: match.id,
        date: match.date,
        score: score,
        opponentScore: match.teams[opposingTeam].score,
        result: isWin ? 'W' : 'L'
      });
    });

    // Calculate chemistry score (0-100)
    const winRateScore = (wins / teamMatches.length) * 40; // Max 40 points for win rate
    const consistencyScore = (1 - (bestScore - worstScore) / bestScore) * 30; // Max 30 points for consistency
    const streakScore = (bestStreak / 5) * 30; // Max 30 points for streak (normalized to 5 games)

    return {
      partnership: {
        players: team,
        gamesPlayed: teamMatches.length,
        wins,
        losses: teamMatches.length - wins,
        winRate: (wins / teamMatches.length) * 100,
        avgScore: totalScore / teamMatches.length,
        bestScore,
        worstScore,
        streaks: {
          current: currentStreak,
          best: bestStreak
        },
        recentGames: recentGames.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)
      },
      chemistry: Math.min(100, Math.round(winRateScore + consistencyScore + streakScore))
    };
  }

  // Generate leaderboard with rankings
  public generateLeaderboard(players: Player[], matches: Match[]): LeaderboardEntry[] {
    return players
      .map(player => {
        const stats = this.calculatePlayerStats(player.id, matches);
        return {
          player,
          stats,
          rank: 0,
          rankChange: 0,
          compositeScore:
            (stats.basic.winRate * 0.4) + // 40% weight to win rate
            (stats.advanced.performance.last10Games * 0.3) + // 30% weight to recent performance
            (stats.basic.avgScore * 0.2) + // 20% weight to average score
            (Math.abs(stats.basic.currentStreak) * 0.1) // 10% weight to current streak
        };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
  }

  // Generate insights about all matches
  public generateMatchInsights(matches: Match[]): MatchInsights {
    const completedMatches = matches.filter((m): m is Match => m.status === 'completed');
    
    // If there are no completed matches, we return early with default values.
    if (completedMatches.length === 0) {
      const defaultMatchSummary: MatchSummary = {
        matchId: '',
        score: '0-0',
        date: new Date(),
      };
  
      return {
        general: {
          totalMatches: 0,
          averageScore: 0,
          highestScore: 0,
          closestMatch: defaultMatchSummary,
          mostDecisive: defaultMatchSummary,
        },
        trends: {
          byDay: {},
          byTime: {},
          averageScoresTrend: [],
        },
      } satisfies MatchInsights;
    }
  
    // Variables to compute match insights
    let totalScore = 0;
    let highestScore = 0;
    let smallestScoreDiff = Infinity;
    let largestScoreDiff = 0;
    let closestMatch: Match | null = null;
    let mostDecisiveMatch: Match | null = null;
  
    // Track trends
    const dayCount: Record<string, number> = {};
    const timeCount: Record<string, number> = {};
    const scoresByDate = new Map<string, number[]>();
  
    completedMatches.forEach((match) => {
      const team1Score = match.teams.team1.score;
      const team2Score = match.teams.team2.score;
      const totalMatchScore = team1Score + team2Score;
      const scoreDiff = Math.abs(team1Score - team2Score);
  
      totalScore += totalMatchScore;
      highestScore = Math.max(highestScore, team1Score, team2Score);
  
      // Determine the closest match
      if (scoreDiff < smallestScoreDiff) {
        smallestScoreDiff = scoreDiff;
        closestMatch = match; // Set closest match
      }
  
      // Determine the most decisive match
      if (scoreDiff > largestScoreDiff) {
        largestScoreDiff = scoreDiff;
        mostDecisiveMatch = match; // Set most decisive match
      }
  
      // Track day and time trends
      const day = match.date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = match.date.getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
  
      dayCount[day] = (dayCount[day] || 0) + 1;
      timeCount[timeSlot] = (timeCount[timeSlot] || 0) + 1;
  
      // Track scores by date for trend analysis
      const dateKey = match.date.toISOString().split('T')[0];
      const currentScores = scoresByDate.get(dateKey) || [];
      currentScores.push(totalMatchScore);
      scoresByDate.set(dateKey, currentScores);
    });
  
    // Calculate average scores trend
    const averageScoresTrend = Array.from(scoresByDate.entries())
      .map(([date, scores]) => ({
        date: new Date(date),
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  
    // By now, closestMatch and mostDecisiveMatch are guaranteed to be non-null
    const general = {
      totalMatches: completedMatches.length,
      averageScore: totalScore / (completedMatches.length * 2),
      highestScore,
      closestMatch: {
        matchId: closestMatch!.id, // Non-null assertion since we checked completedMatches.length > 0
        score: `${closestMatch!.teams.team1.score}-${closestMatch!.teams.team2.score}`,
        date: closestMatch!.date,
      },
      mostDecisive: {
        matchId: mostDecisiveMatch!.id, // Non-null assertion for the same reason
        score: `${mostDecisiveMatch!.teams.team1.score}-${mostDecisiveMatch!.teams.team2.score}`,
        date: mostDecisiveMatch!.date,
      },
    };
  
    const trends = {
      byDay: dayCount,
      byTime: timeCount,
      averageScoresTrend,
    };
  
    return {
      general,
      trends,
    } satisfies MatchInsights;
  }
}