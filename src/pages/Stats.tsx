import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PlayerStatsCard from '../components/stats/PlayerStatsCard';
import { StatisticsService } from '../services/statistics';
import { Match } from '../types/match';
import { Player } from '../types/player';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utils/dateUtils';

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'teams' | 'trends'>('overview');
  
  const statisticsService = useMemo(() => new StatisticsService(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [matchesSnap, playersSnap] = await Promise.all([
          getDocs(collection(db, 'matches')),
          getDocs(collection(db, 'players'))
        ]);

        const matchesData = matchesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as Match[];

        const playersData = playersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];

        setMatches(matchesData);
        setPlayers(playersData);

        if (playersData.length > 0) {
          setSelectedPlayer(playersData[0].id);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const insights = useMemo(() => {
    if (!matches.length) return null;
    return statisticsService.generateMatchInsights(matches);
  }, [matches, statisticsService]);

  const leaderboard = useMemo(() => {
    if (!players.length || !matches.length) return [];
    return statisticsService.generateLeaderboard(players, matches);
  }, [players, matches, statisticsService]);

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const renderOverview = () => {
    if (!insights) return null;

    const { general, trends } = insights;
    const matchTrends = Object.entries(trends.byDay).map(([day, count]) => ({
      day,
      matches: count
    }));

    const scoreTrends = trends.averageScoresTrend.map(trend => ({
      date: formatDate(trend.date, 'date'),
      score: trend.avgScore
    }));

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Matches</h3>
            <p className="text-3xl font-bold text-blue-600">{general.totalMatches}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Average Score</h3>
            <p className="text-3xl font-bold text-green-600">
              {general.averageScore.toFixed(1)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Highest Score</h3>
            <p className="text-3xl font-bold text-purple-600">{general.highestScore}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Active Players</h3>
            <p className="text-3xl font-bold text-yellow-600">{players.length}</p>
          </div>
        </div>

        {/* Match Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Matches by Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="matches" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Score Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notable Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Closest Match</h3>
            <p className="text-2xl font-bold text-blue-600">{general.closestMatch.score}</p>
            <p className="text-sm text-gray-600">
              {formatDate(general.closestMatch.date, 'full')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Most Decisive</h3>
            <p className="text-2xl font-bold text-blue-600">{general.mostDecisive.score}</p>
            <p className="text-sm text-gray-600">
              {formatDate(general.mostDecisive.date, 'full')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="space-y-4">
      {leaderboard.map((entry) => (
        <div
          key={entry.player.id}
          className="bg-white p-4 rounded-lg shadow flex items-center"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-blue-600">#{entry.rank}</span>
          </div>
          <div className="ml-4 flex-grow">
            <h3 className="font-semibold">{entry.player.name}</h3>
            <div className="text-sm text-gray-600">
              {entry.stats.basic.wins} wins, {entry.stats.basic.losses} losses
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {entry.stats.basic.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlayerStats = () => {
    if (!selectedPlayer) return null;

    const playerStats = statisticsService.calculatePlayerStats(selectedPlayer, matches);
    const selectedPlayerData = players.find(p => p.id === selectedPlayer);
    console.log('Stats being passed to PlayerStatsCard:', playerStats);

    if (!selectedPlayerData) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="rounded border-gray-300 py-2"
          >
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
        
        <PlayerStatsCard
          playerName={selectedPlayerData.name}
          stats={playerStats}
          matches={matches}
          playerId={selectedPlayer}
          getPlayerName={getPlayerName}
        />
      </div>
    );
  };

  const renderTeamStats = () => {
    const teamPairs = players.flatMap((p1, i) => 
      players.slice(i + 1).map(p2 => [p1.id, p2.id] as [string, string])
    );

    const teamAnalytics = teamPairs
      .map(team => ({
        team,
        analytics: statisticsService.calculateTeamChemistry(team, matches)
      }))
      .filter(({ analytics }) => analytics.partnership.gamesPlayed > 0)
      .sort((a, b) => b.analytics.chemistry - a.analytics.chemistry);

    return (
      <div className="space-y-6">
        {teamAnalytics.map(({ team, analytics }) => (
          <div key={team.join('-')} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {getPlayerName(team[0])} & {getPlayerName(team[1])}
                </h3>
                <p className="text-sm text-gray-600">
                  {analytics.partnership.gamesPlayed} games together
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.chemistry}%
                </div>
                <div className="text-sm text-gray-600">Chemistry</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Win Rate</div>
                <div className="text-lg font-semibold">
                  {analytics.partnership.winRate.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Avg Score</div>
                <div className="text-lg font-semibold">
                  {analytics.partnership.avgScore.toFixed(1)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Best Score</div>
                <div className="text-lg font-semibold">
                  {analytics.partnership.bestScore}
                </div>
              </div>
            </div>

            {/* Recent Games */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Games</h4>
              <div className="space-y-2">
                {analytics.partnership.recentGames.map(game => (
                  <div 
                    key={game.matchId}
                    className={`flex justify-between items-center p-2 rounded ${
                      game.result === 'W' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="text-sm">
                      {formatDate(game.date, 'date')}
                    </div>
                    <div className="font-medium">
                      {game.score} - {game.opponentScore}
                    </div>
                    <div className={game.result === 'W' ? 'text-green-600' : 'text-red-600'}>
                      {game.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrends = () => (
    <div className="space-y-6">
      {/* Time Distribution */}
      {insights && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Match Time Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(insights.trends.byTime).map(([time, count]) => ({
                time,
                matches: count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="matches" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Score Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Score Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={
              Object.entries(
                matches
                  .filter(m => m.status === 'completed')
                  .reduce((acc, match) => {
                    const score1 = match.teams.team1.score;
                    const score2 = match.teams.team2.score;
                    acc[score1] = (acc[score1] || 0) + 1;
                    acc[score2] = (acc[score2] || 0) + 1;
                    return acc;
                  }, {} as Record<number, number>)
              ).map(([score, count]) => ({
                score: Number(score),
                occurrences: count
              })).sort((a, b) => a.score - b.score)
            }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="occurrences" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Win Margin Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Win Margin Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={
              Object.entries(
                matches
                  .filter(m => m.status === 'completed')
                  .reduce((acc, match) => {
                    const margin = Math.abs(
                      match.teams.team1.score - match.teams.team2.score
                    );
                    acc[margin] = (acc[margin] || 0) + 1;
                    return acc;
                  }, {} as Record<number, number>)
              ).map(([margin, count]) => ({
                margin: Number(margin),
                matches: count
              })).sort((a, b) => a.margin - b.margin)
            }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="margin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="matches" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Form Comparison */}
      {leaderboard.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Player Form Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leaderboard.slice(0, 5).map(entry => ({
                name: entry.player.name,
                ...entry.stats.advanced.performance
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="category" dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="last5Games" 
                  name="Last 5 Games"
                  stroke="#4F46E5" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="last10Games" 
                  name="Last 10 Games"
                  stroke="#10B981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistics</h1>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        {(['overview', 'players', 'teams', 'trends'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === tab
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="pt-4">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'players' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              {renderLeaderboard()}
            </div>
            <div className="lg:col-span-3">
              {renderPlayerStats()}
            </div>
          </div>
        )}
        {activeTab === 'teams' && renderTeamStats()}
        {activeTab === 'trends' && renderTrends()}
      </div>
    </div>
  );
};

export default Stats;