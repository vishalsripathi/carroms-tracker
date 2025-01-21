import { useState, useCallback } from 'react';
import { TeamGenerationService } from '../services/teamGeneration';
import { Player } from '../types/player';

const teamService = new TeamGenerationService();

export const useTeamGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTeams = useCallback(async (availablePlayers: Player[]) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (!availablePlayers || availablePlayers.length < 4) {
        throw new Error('Need at least 4 players to generate teams');
      }

      const validPlayers = availablePlayers.filter(player => player && player.id);
      if (validPlayers.length < 4) {
        throw new Error('Not enough valid players to generate teams');
      }

      const result = await teamService.generateTeams(validPlayers);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate teams';
      setError(message);
      console.error('Team generation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateTeams,
    loading,
    error,
  };
};