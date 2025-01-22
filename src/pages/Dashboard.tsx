import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DocumentData } from 'firebase/firestore';
import { getRecentMatches, getPlayers } from '../services/firebaseService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FormattedDate from '../components/common/FormattedDate';

interface DashboardData {
  recentMatches: DocumentData[];
  players: DocumentData[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({ recentMatches: [], players: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [matchesResponse, playersResponse] = await Promise.all([
          getRecentMatches(20),
          getPlayers()
        ]);

        if (!matchesResponse.success) throw new Error(matchesResponse.error);
        if (!playersResponse.success) throw new Error(playersResponse.error);

        setData({
          recentMatches: matchesResponse.data || [],
          players: playersResponse.data || []
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityData = () => {
    const matches = data.recentMatches || [];
    return matches.map(match => ({
      date: new Date(match.createdAt.toDate()).toLocaleDateString(),
      matches: 1,
      avgScore: (match.teams.team1.score + match.teams.team2.score) / 2
    }));
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;

  const activityData = getActivityData();
  const activePlayers = data.players.filter(p => p.availability?.status === 'available');
  const completedMatches = data.recentMatches.filter(m => m.status === 'completed');
  const averageScore = completedMatches.reduce((acc, match) => 
    acc + (match.teams.team1.score + match.teams.team2.score) / 2, 0) / completedMatches.length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Players</h3>
          <p className="text-3xl font-bold text-blue-600">{data.players.length}</p>
          <p className="text-sm text-gray-500 mt-1">{activePlayers.length} available</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Recent Matches</h3>
          <p className="text-3xl font-bold text-blue-600">{completedMatches.length}</p>
          <p className="text-sm text-gray-500 mt-1">Last 20 days</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg Score</h3>
          <p className="text-3xl font-bold text-blue-600">{averageScore.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">Per match</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Today</h3>
          <p className="text-3xl font-bold text-blue-600">
            {activePlayers.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Available to play</p>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Activity Overview</h2>
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border rounded p-2"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgScore" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Players */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Matches</h2>
            <div className="mt-4 divide-y">
              {data.recentMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-700">
                        {match.teams.team1.score} - {match.teams.team2.score}
                      </div>
                      <div>
                        <FormattedDate 
                          date={match.createdAt.toDate()} 
                          format="dateTime"
                          className="text-sm text-gray-600"
                        />
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      match.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Players */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">Available Players</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {activePlayers.map((player) => (
                <div key={player.id} className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      {player.stats?.winPercentage ? `${player.stats.winPercentage}% wins` : 'New player'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;