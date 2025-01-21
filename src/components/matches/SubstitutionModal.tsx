// components/matches/SubstitutionModal.tsx
import React, { useState, useEffect } from 'react';
import { matchService } from '../../services/matchService';
import { useAuthStore } from '../../store/authStore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Player } from '../../types/player';
import { BasicAlert } from '../ui/BasicAlert';
import { BasicButton } from '../ui/BasicButton';
import { BasicDialog } from '../ui/BasicDialog';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  team: 'team1' | 'team2' | null;
  currentPlayers: string[];
  onSubstitution: () => void;
}

const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  isOpen,
  onClose,
  matchId,
  team,
  currentPlayers,
  onSubstitution
}) => {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerToReplace, setPlayerToReplace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchAvailablePlayers = async () => {
      try {
        const playersSnapshot = await getDocs(
          query(
            collection(db, 'players'),
            where('availability.status', '==', 'available')
          )
        );

        const players = playersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Player))
          .filter(player => !currentPlayers.includes(player.id));

        setAvailablePlayers(players);
      } catch (err) {
        console.error('Error fetching available players:', err);
        setError('Failed to fetch available players');
      }
    };

    if (isOpen) {
      fetchAvailablePlayers();
    }
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
        user.uid
      );
      onSubstitution();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to substitute player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Substitute Player"
      footer={
        <div className="flex justify-end gap-2">
          <BasicButton
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </BasicButton>
          <BasicButton
            onClick={handleSubstitution}
            disabled={loading || !selectedPlayerId || !playerToReplace}
          >
            Confirm Substitution
          </BasicButton>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <BasicAlert type="error">
            {error}
          </BasicAlert>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Player to Replace
          </label>
          <select
            value={playerToReplace}
            onChange={(e) => setPlayerToReplace(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300"
            disabled={loading}
          >
            <option value="">Select player</option>
            {currentPlayers.map((playerId) => (
              <option key={playerId} value={playerId}>
                {playerId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select New Player
          </label>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300"
            disabled={loading}
          >
            <option value="">Select player</option>
            {availablePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </BasicDialog>
  );
};

export default SubstitutionModal;