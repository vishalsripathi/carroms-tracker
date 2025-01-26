// src/components/matches/TeamGenerator.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamGeneration } from '../../hooks/useTeamGeneration';
import { Player } from '../../types/player';
import TeamGenerationFeedback from './TeamGenerationFeedback';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { 
  Users, X, RefreshCw, Wand2, 
  Trophy, UserPlus, Shuffle 
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TeamGeneratorProps {
  availablePlayers: Player[];
  onTeamsGenerated: (teams: [string, string][]) => void;
  onClose: () => void;
}

const TeamsList = ({ 
  title, 
  players, 
  colorScheme
}: { 
  title: string;
  players: string[];
  colorScheme: 'blue' | 'green';
}) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-800'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-100 dark:border-green-800',
      text: 'text-green-600 dark:text-green-300',
      iconBg: 'bg-green-100 dark:bg-green-800'
    }
  }[colorScheme];

  return (
    <Card className={`${colors.bg} border ${colors.border}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-full ${colors.iconBg}`}>
            <Trophy className={`h-4 w-4 ${colors.text}`} />
          </div>
          <h4 className={`font-medium ${colors.text}`}>{title}</h4>
        </div>
        <div className="space-y-2">
          {players.map((name, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800"
            >
              <Avatar
                size="sm"
                fallback={name[0]}
              />
              <span className="text-sm font-medium">
                {name}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleGenerateTeams = async () => {
    try {
      setIsRegenerating(true);
      if (availablePlayers.length < 4) {
        throw new Error('Need at least 4 players to generate teams');
      }

      const validPlayers = availablePlayers.filter(player => player && player.id);
      
      if (validPlayers.length < 4) {
        throw new Error('Not enough valid players to generate teams');
      }

      const result = await generateTeams(validPlayers);
      if (result) {
        console.log('Generated teams, result: ' + result)
        setGeneratedTeams(result);
        // Wait for teams to show and animation to complete
        await new Promise(resolve => setTimeout(resolve, 800));
        onTeamsGenerated(result.teams);
      }
    } catch (err) {
      console.error('Team generation error:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <LoadingSpinner size="large" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Generating balanced teams...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold">Team Generator</h3>
        </div>
        <div className="flex items-center gap-2">
          {generatedTeams ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTeams}
              disabled={loading || availablePlayers.length < 4}
              leftIcon={<Shuffle className="h-4 w-4" />}
            >
              Regenerate
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleGenerateTeams}
              disabled={loading || availablePlayers.length < 4}
              leftIcon={<Wand2 className="h-4 w-4" />}
            >
              Generate Teams
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <TeamGenerationFeedback
        availablePlayers={availablePlayers}
        error={error}
      />

      {/* Available Players Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Available Players ({availablePlayers.length})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availablePlayers.map((player) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <Avatar
                size="sm"
                fallback={player.name[0]}
              />
              <span className="text-sm font-medium truncate">
                {player.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Generated Teams */}
      <AnimatePresence mode="wait">
        {generatedTeams && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <TeamsList
              title="Team 1"
              players={generatedTeams.teamNames.team1}
              colorScheme="blue"
            />
            <TeamsList
              title="Team 2"
              players={generatedTeams.teamNames.team2}
              colorScheme="green"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {availablePlayers.length < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-start gap-2">
            <UserPlus className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                More Players Needed
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-300">
                Add {4 - availablePlayers.length} more player(s) to start generating teams.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TeamGenerator;