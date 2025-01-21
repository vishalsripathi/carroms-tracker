// pages/Matches.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TeamGenerator from '../components/matches/TeamGenerator';
import MatchCard from '../components/matches/MatchCard';
import { Match } from '../types/match';
import { Player } from '../types/player';

interface FormData {
  date: string;
  team1Players: [string, string];
  team2Players: [string, string];
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTeamGenerator, setShowTeamGenerator] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    team1Players: ['', ''],
    team2Players: ['', '']
  });

  const user = useAuthStore(state => state.user);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesSnapshot, playersSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'matches'), orderBy('date', 'desc'))),
        getDocs(collection(db, 'players'))
      ]);

      const matchesData = matchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Match[];

      const playersData = playersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];

      setMatches(matchesData);
      setPlayers(playersData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateTeams = (teams: [string, string][]) => {
    setShowTeamGenerator(false);
    setShowAddForm(true);
    setFormData(prev => ({
      ...prev,
      team1Players: teams[0],
      team2Players: teams[1]
    }));
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const newMatch = {
        date: Timestamp.fromDate(new Date(formData.date)),
        teams: {
          team1: {
            players: formData.team1Players,
            score: 0
          },
          team2: {
            players: formData.team2Players,
            score: 0
          }
        },
        status: 'scheduled',
        winner: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user.uid,
        history: [{
          type: 'creation',
          timestamp: new Date(),
          userId: user.uid,
          data: {}
        }]
      };

      await addDoc(collection(db, 'matches'), newMatch);
      await fetchData();
      setShowAddForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        team1Players: ['', ''],
        team2Players: ['', '']
      });
    } catch (err) {
      setError('Failed to add match');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const availablePlayers = players.filter(p => 
    p && p.id && p.availability?.status === 'available'
  );

  if (loading && matches.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Matches</h1>
        <div className="space-x-3">
          <button
            onClick={() => setShowTeamGenerator(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Generate Teams
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Match
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Team Generator Modal */}
      {showTeamGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <TeamGenerator
              availablePlayers={availablePlayers}
              onTeamsGenerated={handleGenerateTeams}
              onClose={() => setShowTeamGenerator(false)}
            />
          </div>
        </div>
      )}

      {/* Add Match Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Schedule New Match</h2>
            <form onSubmit={handleAddMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded border-gray-300"
                  required
                />
              </div>

              {/* Team 1 Players */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Team 1</label>
                {[0, 1].map(index => (
                  <select
                    key={`team1-${index}`}
                    value={formData.team1Players[index]}
                    onChange={e => {
                      const newPlayers = [...formData.team1Players];
                      newPlayers[index] = e.target.value;
                      setFormData({ ...formData, team1Players: newPlayers as [string, string] });
                    }}
                    className="mt-1 block w-full rounded border-gray-300"
                    required
                  >
                    <option value="">Select Player</option>
                    {availablePlayers.map(player => (
                      <option 
                        key={player.id} 
                        value={player.id}
                        disabled={
                          formData.team1Players.includes(player.id) ||
                          formData.team2Players.includes(player.id)
                        }
                      >
                        {player.name}
                      </option>
                    ))}
                  </select>
                ))}
              </div>

              {/* Team 2 Players */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Team 2</label>
                {[0, 1].map(index => (
                  <select
                    key={`team2-${index}`}
                    value={formData.team2Players[index]}
                    onChange={e => {
                      const newPlayers = [...formData.team2Players];
                      newPlayers[index] = e.target.value;
                      setFormData({ ...formData, team2Players: newPlayers as [string, string] });
                    }}
                    className="mt-1 block w-full rounded border-gray-300"
                    required
                  >
                    <option value="">Select Player</option>
                    {availablePlayers.map(player => (
                      <option 
                        key={player.id} 
                        value={player.id}
                        disabled={
                          formData.team1Players.includes(player.id) ||
                          formData.team2Players.includes(player.id)
                        }
                      >
                        {player.name}
                      </option>
                    ))}
                  </select>
                ))}
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
                  Schedule Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            onUpdate={fetchData}
            getPlayerName={getPlayerName}
          />
        ))}
      </div>
    </div>
  );
};

export default Matches;