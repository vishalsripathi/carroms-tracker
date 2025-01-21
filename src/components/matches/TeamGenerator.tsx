import { useState } from 'react';
import { useTeamGeneration } from '../../hooks/useTeamGeneration';
import { Player } from '../../types/player';
import LoadingSpinner from '../ui/LoadingSpinner';
import TeamGenerationFeedback from './TeamGenerationFeedback';

interface TeamGeneratorProps {
  availablePlayers: Player[];
  onTeamsGenerated: (teams: [string, string][]) => void;
  onClose: () => void;
}

const TeamGenerator: React.FC<TeamGeneratorProps> = ({
  availablePlayers,
  onTeamsGenerated,
  onClose
}) => {
  const { generateTeams, loading, error } = useTeamGeneration();
  const [generatedTeams, setGeneratedTeams] = useState<{
    teams: [string, string][];
    teamNames: { team1: string[]; team2: string[] };
  } | null>(null);

  const handleGenerateTeams = async () => {
    try {
      // Check if we have enough players
      if (!availablePlayers || availablePlayers.length < 4) {
        throw new Error('Need at least 4 players to generate teams');
      }

      // Filter out players without IDs
      const validPlayers = availablePlayers.filter(player => player && player.id);
      
      if (validPlayers.length < 4) {
        throw new Error('Not enough valid players to generate teams');
      }

      const result = await generateTeams(validPlayers);
      if (result) {
        setGeneratedTeams(result);
        onTeamsGenerated(result.teams);
      }
    } catch (err) {
      console.error('Team generation error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team Generator</h3>
        <div>
          <button
            onClick={handleGenerateTeams}
            disabled={!availablePlayers || availablePlayers.length < 4}
            className={`px-4 py-2 rounded ${
              !availablePlayers || availablePlayers.length < 4
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Generate Teams
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <TeamGenerationFeedback
        availablePlayers={availablePlayers}
        error={error}
      />

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      {/* Available Players Display */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Available Players ({availablePlayers.length})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availablePlayers.map((player) => (
            <div key={player.id} className="bg-gray-50 p-2 rounded text-sm">
              {player.name}
            </div>
          ))}
        </div>
      </div>

      {generatedTeams && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-medium mb-2">Team 1</h4>
            <ul className="space-y-1">
              {generatedTeams.teamNames.team1.map((name, index) => (
                <li key={index} className="text-sm">
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-medium mb-2">Team 2</h4>
            <ul className="space-y-1">
              {generatedTeams.teamNames.team2.map((name, index) => (
                <li key={index} className="text-sm">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {availablePlayers.length < 4 && (
        <p className="text-sm text-gray-600">
          Need at least 4 available players to generate teams.
        </p>
      )}
    </div>
  );
};

export default TeamGenerator;