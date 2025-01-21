import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PlayerStatsCard from '../components/stats/PlayerStatsCard';
import { StatisticsService } from '../services/statistics';
import type { Player } from '../types/player';
import type { Match } from '../types/match';

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'teams'>('overview');

  const statisticsService = new StatisticsService();

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

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const renderOverview = () => {
    const completedMatches = matches.filter(m => m.status === 'completed');
    const totalPoints = completedMatches.reduce((sum, match) => 
      sum + match.teams.team1.score + match.teams.team2.score, 0
    );
    const avgPointsPerMatch = completedMatches.length > 0 
      ? totalPoints / completedMatches.length 
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Matches</h3>
          <p className="text-3xl font-bold text-blue-600">{matches.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {completedMatches.length} completed
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Players</h3>
          <p className="text-3xl font-bold text-blue-600">{players.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {players.filter(p => p.availability?.status === 'available').length} available
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg Points/Match</h3>
          <p className="text-3xl font-bold text-blue-600">
            {avgPointsPerMatch.toFixed(1)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Points</h3>
          <p className="text-3xl font-bold text-blue-600">{totalPoints}</p>
        </div>
      </div>
    );
  };

  const renderPlayerStats = () => {
    if (!selectedPlayer) return null;

    const playerStats = statisticsService.calculatePlayerStats(selectedPlayer, matches);
    const selectedPlayerData = players.find(p => p.id === selectedPlayer);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="rounded border-gray-300"
          >
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        {selectedPlayerData && (
          <PlayerStatsCard
            playerName={selectedPlayerData.name}
            stats={playerStats}
            getPlayerName={getPlayerName}
          />
        )}
      </div>
    );
  };

  const renderTeamStats = () => {
    const successfulPairings = statisticsService.getMostSuccessfulPairings(matches);

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Most Successful Teams</h3>
        <div className="grid gap-4">
          {successfulPairings.map(({ players: teamPlayers, stats }) => (
            <div 
              key={teamPlayers.join('-')} 
              className="bg-white p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">
                    {getPlayerName(teamPlayers[0])} & {getPlayerName(teamPlayers[1])}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {stats.gamesPlayed} games played
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {stats.winRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Win Rate
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Wins</p>
                  <p className="font-semibold">{stats.wins}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Avg Score</p>
                  <p className="font-semibold">{stats.averageScore.toFixed(1)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Total Points</p>
                  <p className="font-semibold">{stats.totalPoints}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
        {(['overview', 'players', 'teams'] as const).map((tab) => (
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
        {activeTab === 'players' && renderPlayerStats()}
        {activeTab === 'teams' && renderTeamStats()}
      </div>
    </div>
  );
};

export default Stats;