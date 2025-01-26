import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ScoreInput } from './ScoreInput';

interface TeamSectionProps {
  team: 'team1' | 'team2';
  players: string[];
  score: number;
  isWinner: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  onSubstitute: () => void;
  onScoreChange: (value: number) => void;
  onScoreBlur: () => void;
  getPlayerName: (id: string) => string;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  team,
  players,
  score,
  isWinner,
  status,
  onSubstitute,
  onScoreChange,
  getPlayerName
}) => {
  return (
    <div className="space-y-4">
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          Team {team === 'team1' ? '1' : '2'}
        </h3>
        {isWinner && (
          <Badge variant="success" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Winner
          </Badge>
        )}
      </div>

      {/* Players List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {players.map(playerId => (
            <motion.div
              key={playerId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <Avatar
                size="sm"
                fallback={getPlayerName(playerId)[0]}
              />
              <span className="text-sm font-medium">
                {getPlayerName(playerId)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Score Section */}
      {status === 'in_progress' ? (
        <ScoreInput 
        value={score} 
        onChange={(value) => onScoreChange(value)}
        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
      />
      ) :  null}

      {/* status === 'completed' ? (
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-3xl font-bold">{score}</span>
        </div>
      ) : */}

      {/* Substitution Button */}
      {status !== 'scheduled' && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSubstitute}
          className="w-full"
          leftIcon={<Users className="h-4 w-4" />}
        >
          Substitute Player
        </Button>
      )}
    </div>
  );
};