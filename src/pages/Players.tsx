import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Player, PlayerFormData } from '../types/player';
import { Match } from '../types/match';
import { StatisticsService } from '../services/statistics';

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    email: '',
    availability: 'available'
  });

  const statisticsService = useMemo(() => new StatisticsService(), []);

  // Fetch players and matches
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersSnap, matchesSnap] = await Promise.all([
          getDocs(collection(db, 'players')),
          getDocs(collection(db, 'matches'))
        ]);
        
        const playersData = playersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];

        const matchesData = matchesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as Match[];

        setPlayers(playersData);
        setMatches(matchesData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate player statistics
  const playerStats = useMemo(() => {
    return players.map(player => ({
      player,
      stats: statisticsService.calculatePlayerStats(player.id, matches)
    }));
  }, [players, matches, statisticsService]);

  // Add new player
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const timestamp = Timestamp.now();
      
      const firestorePlayer = {
        ...formData,
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          avgScore: 0,
          currentStreak: 0,
          bestStreak: 0,
          winPercentage: 0,
          skillRating: 50,
          recentPerformance: 0,
          preferredPartners: [],
          streak: {
            current: 0,
            best: 0,
            type: null as 'win' | 'loss' | null
          }
        },
        availability: {
          status: formData.availability,
          lastUpdated: timestamp
        },
        createdAt: timestamp
      };
  
      const docRef = await addDoc(collection(db, 'players'), firestorePlayer);
  
      const statePlayer: Player = {
        ...firestorePlayer,
        id: docRef.id,
        // Remove lastPlayed entirely for new players (it will be undefined)
        availability: {
          ...firestorePlayer.availability,
          lastUpdated: timestamp.toDate()
        },
        createdAt: timestamp.toDate()
      };
      
      setPlayers(prevPlayers => [...prevPlayers, statePlayer]);
      setShowAddForm(false);
      setFormData({ name: '', email: '', availability: 'available' });
    } catch (err) {
      setError('Failed to add player');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update player availability
  const handleUpdateAvailability = async (playerId: string, status: 'available' | 'unavailable') => {
    try {
      await updateDoc(doc(db, 'players', playerId), {
        'availability.status': status,
        'availability.lastUpdated': Timestamp.now()
      });
      
      setPlayers(players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              availability: { 
                status, 
                lastUpdated: new Date() 
              } 
            } 
          : player
      ));
    } catch (err) {
      setError('Failed to update availability');
      console.error(err);
    }
  };

  const renderPlayerCard = (player: Player) => {
    const playerStat = playerStats.find(p => p.player.id === player.id);
    if (!playerStat) return null;

    const stats = playerStat.stats;
    const formGuide = stats.advanced.formGuide;

    return (
      <div key={player.id} className="bg-white p-6 rounded-lg shadow space-y-4">
        {/* Player Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{player.name}</h3>
            <p className="text-sm text-gray-600">{player.email}</p>
          </div>
          <select
            value={player.availability.status}
            onChange={(e) => handleUpdateAvailability(player.id, e.target.value as 'available' | 'unavailable')}
            className={`text-sm rounded px-3 py-1 ${
              player.availability.status === 'available' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Win Rate</p>
            <p className="text-xl font-semibold">
              {stats.basic.winRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              {stats.basic.wins}W - {stats.basic.losses}L
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Average Score</p>
            <p className="text-xl font-semibold">
              {stats.basic.avgScore.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Form Guide */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Recent Form</p>
          <div className="flex space-x-2">
            {formGuide.map((result, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  result === 'W'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Performance</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Last 5 Games</p>
              <p className="font-medium">
                {stats.advanced.performance.last5Games.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="font-medium">
                {stats.advanced.performance.thisMonth.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Preferred Partners */}
        {stats.advanced.preferredPartners.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Best Partner</p>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">
                {players.find(p => p.id === stats.advanced.preferredPartners[0].partnerId)?.name}
              </p>
              <p className="text-sm text-gray-600">
                {stats.advanced.preferredPartners[0].winRate.toFixed(1)}% Win Rate
                ({stats.advanced.preferredPartners[0].gamesPlayed} games)
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && players.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Players</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Player
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Add Player Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Player</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <select
                  value={formData.availability}
                  onChange={e => setFormData({ 
                    ...formData, 
                    availability: e.target.value as 'available' | 'unavailable' 
                  })}
                  className="mt-1 block w-full rounded border-gray-300"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map(player => renderPlayerCard(player))}
      </div>
    </div>
  );
};

export default Players;