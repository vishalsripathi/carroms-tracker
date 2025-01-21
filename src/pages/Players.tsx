import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Player, PlayerFormData } from '../types/player';

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    email: '',
    availability: 'available'
  });

  // Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'players'));
        const playersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];
        setPlayers(playersData);
      } catch (err) {
        setError('Failed to fetch players');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Add new player
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newPlayer = {
        ...formData,
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          winPercentage: 0
        },
        availability: {
          status: formData.availability,
          lastUpdated: Timestamp.now()
        },
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'players'), newPlayer);
      setPlayers([...players, { ...newPlayer, id: docRef.id } as unknown as Player]);
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
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <select
                  value={formData.availability}
                  onChange={e => setFormData({ ...formData, availability: e.target.value as 'available' | 'unavailable' })}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map(player => (
          <div key={player.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{player.name}</h3>
                <p className="text-sm text-gray-600">{player.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={player.availability.status}
                  onChange={(e) => handleUpdateAvailability(player.id, e.target.value as 'available' | 'unavailable')}
                  className={`text-sm rounded px-2 py-1 ${
                    player.availability.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">Games</p>
                <p className="font-semibold">{player.stats.totalGames}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600">Win %</p>
                <p className="font-semibold">{player.stats.winPercentage}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Players;