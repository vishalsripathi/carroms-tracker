import React from 'react';
import { PlayerStats } from '../../services/statistics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PlayerStatsCardProps {
  playerName: string;
  stats: PlayerStats;
  getPlayerName: (id: string) => string;
}

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({
  playerName,
  stats,
  getPlayerName
}) => {
  const performanceData = stats.recentPerformance.map(perf => ({
    date: perf.date.toLocaleDateString(),
    score: perf.score,
    result: perf.result
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">{playerName}'s Statistics</h3>
      
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Win Rate</p>
          <p className="text-2xl font-bold text-blue-600">
            {stats.winRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Games Played</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalGames}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-2xl font-bold text-purple-600">
            {Math.abs(stats.currentStreak)}
            <span className="text-sm ml-1">
              {stats.currentStreak > 0 ? 'W' : 'L'}
            </span>
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded">
          <p className="text-sm text-gray-600">Avg Score</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.averageScore.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Recent Performance</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ fill: '#4F46E5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Partners */}
      {stats.preferredPartners.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-2">Best Partners</h4>
          <div className="space-y-2">
            {stats.preferredPartners.map((partner) => (
              <div
                key={partner.partnerId}
                className="flex justify-between items-center bg-gray-50 p-3 rounded"
              >
                <span className="font-medium">
                  {getPlayerName(partner.partnerId)}
                </span>
                <div className="text-sm">
                  <span className="text-green-600 font-medium">
                    {partner.winRate.toFixed(1)}% Win Rate
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({partner.gamesPlayed} games)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStatsCard;