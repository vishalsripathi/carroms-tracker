import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input/Input';
import { ArrowRightLeft, Search, UserPlus, User } from 'lucide-react';
import { Player } from '../../types/player';
import { matchService } from '../../services/matchService';
import { useAuthStore } from '../../store/authStore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  getPlayerName: (id: string) => string;
  team: 'team1' | 'team2' | null;
  currentPlayers: string[];
  onSubstitution: () => void;
}

const PlayerCard = ({ player, isSelected, onClick }: { 
  player: Player; 
  isSelected: boolean;
  onClick: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      p-4 rounded-lg border transition-all duration-200 cursor-pointer
      ${isSelected
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
      }
    `}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <Avatar size="sm" fallback={player.name[0]} />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{player.name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {player.stats?.winPercentage 
            ? `${player.stats.winPercentage}% Win Rate` 
            : 'New Player'
          }
        </div>
      </div>
      {isSelected && (
        <div className="w-2 h-2 rounded-full bg-primary-500" />
      )}
    </div>
  </motion.div>
);

const SubstitutionModal = ({
  isOpen,
  onClose,
  matchId,
  getPlayerName,
  team,
  currentPlayers,
  onSubstitution
}: SubstitutionModalProps) => {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerToReplace, setPlayerToReplace] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(
          query(
            collection(db, 'players'),
            where('availability.status', '==', 'available')
          )
        );

        const players = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Player))
          .filter(player => !currentPlayers.includes(player.id));

        setAvailablePlayers(players);
      } catch (err) {
        console.error('Error fetching players:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchPlayers();
  }, [isOpen, currentPlayers]);

  const handleSubstitution = async () => {
    if (!user || !team || !selectedPlayerId || !playerToReplace) return;

    try {
      setLoading(true);
      await matchService.substitutePlayer(
        matchId,
        team,
        playerToReplace,
        selectedPlayerId,
        user.uid,
        user.displayName || 'Unknown User'
      );
      onSubstitution();
      onClose();
    } catch (err) {
      console.error('Substitution failed:', err);
    }
  };

  const filteredPlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <span>Player Substitution</span>
        </div>
      </DialogHeader>

      <DialogContent className="max-w-4xl">
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search available players..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Current Players
              </h3>
              <div className="space-y-2">
                {currentPlayers.map((id) => {
                  const player = availablePlayers.find(p => p.id === id) || { 
                    id, 
                    name: getPlayerName(id),
                    stats: { winPercentage: 0 }
                  } as Player;
                  return (
                    <PlayerCard
                      key={id}
                      player={player}
                      isSelected={playerToReplace === id}
                      onClick={() => setPlayerToReplace(id)}
                  />
                )})}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Available Players
              </h3>
              <div className="space-y-2">
                {filteredPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayerId === player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {(playerToReplace || selectedPlayerId) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 border border-primary-200 dark:border-primary-800"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
                  Player Substitution Preview
                </h3>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  {!playerToReplace 
                    ? "Select a player to substitute" 
                    : !selectedPlayerId 
                    ? "Select a replacement player" 
                    : "Review and confirm substitution"}
                </p>
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <Avatar 
                    size="lg"
                    className={!playerToReplace ? "opacity-50" : "ring-2 ring-primary-500"}
                    fallback={playerToReplace 
                      ? getPlayerName(playerToReplace)[0] 
                      : "?"
                    }
                  />
                  <p className="mt-2 font-medium">
                    {playerToReplace 
                      ? getPlayerName(playerToReplace)
                      : "Outgoing Player"
                    }
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-full bg-primary-200 dark:bg-primary-800">
                    <ArrowRightLeft className="h-6 w-6 text-primary-700 dark:text-primary-300" />
                  </div>
                  <span className="text-sm text-primary-600 dark:text-primary-400">
                    Swap
                  </span>
                </div>

                <div className="text-center">
                  <Avatar 
                    size="lg"
                    className={!selectedPlayerId ? "opacity-50" : "ring-2 ring-primary-500"}
                    fallback={selectedPlayerId 
                      ? availablePlayers.find(p => p.id === selectedPlayerId)?.name[0] || "?"
                      : "?"
                    }
                  />
                  <p className="mt-2 font-medium">
                    {selectedPlayerId
                      ? availablePlayers.find(p => p.id === selectedPlayerId)?.name
                      : "Incoming Player"
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubstitution}
          disabled={loading || !selectedPlayerId || !playerToReplace}
        >
          Confirm Substitution
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default SubstitutionModal;