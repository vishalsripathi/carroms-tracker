import { useState, useEffect } from 'react';
import { DocumentData } from 'firebase/firestore';
import { getRecentMatches, getPlayers } from '../services/firebaseService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface DashboardData {
  recentMatches: DocumentData[];
  players: DocumentData[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({ recentMatches: [], players: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch data in parallel
        const [matchesResponse, playersResponse] = await Promise.all([
          getRecentMatches(5),
          getPlayers()
        ]);

        // Check for errors
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

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Players</h3>
          <p className="text-3xl font-bold text-blue-600">{data.players.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Recent Matches</h3>
          <p className="text-3xl font-bold text-blue-600">{data.recentMatches.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Today</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data.players.filter(player => player.lastActive?.toDate()?.toDateString() === new Date().toDateString()).length}
          </p>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Matches</h2>
          {data.recentMatches.length > 0 ? (
            <div className="mt-4 space-y-4">
              {data.recentMatches.map((match) => (
                <div key={match.id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {match.createdAt.toDate().toLocaleDateString()}
                      </p>
                      <p className="font-medium">
                        {match.teams.team1.score} - {match.teams.team2.score}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
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
          ) : (
            <p className="mt-4 text-gray-600">No recent matches found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;