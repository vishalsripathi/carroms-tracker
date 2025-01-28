import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamGeneration } from '../../hooks/useTeamGeneration';
import { Player } from '../../types/player';
import TeamGenerationFeedback from './TeamGenerationFeedback';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { 
  Users, X, Wand2, 
  Trophy, UserPlus, Shuffle,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TeamGeneratorProps {
  availablePlayers: Player[];
  onTeamsGenerated: (teams: [string, string][]) => void;
  onClose: () => void;
}

interface TeamListProps {
  title: string;
  players: string[];
  colorScheme: 'blue' | 'green';
  animate?: boolean;
}

const TeamsList = ({ 
  title, 
  players, 
  colorScheme,
  animate = false 
}: TeamListProps) => {
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
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${colors.bg} border ${colors.border} hover:shadow-lg transition-shadow duration-200`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <motion.div 
              className={`p-1.5 rounded-full ${colors.iconBg}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className={`h-4 w-4 ${colors.text}`} />
            </motion.div>
            <h4 className={`font-medium ${colors.text}`}>{title}</h4>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {players.map((name, index) => (
                <motion.div
                  key={name + index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 25
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200"
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Avatar
                      size="sm"
                      fallback={name[0]}
                      className="ring-2 ring-primary/10 ring-offset-2 ring-offset-background"
                    />
                  </motion.div>
                  <span className="text-sm font-medium">
                    {name}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ShufflingTeams = ({ 
  teamNames, 
  onComplete 
}: { 
  teamNames: { team1: string[]; team2: string[] },
  onComplete: () => void 
}) => {
  const [shuffledPlayers, setShuffledPlayers] = useState<string[]>([
    ...teamNames.team1,
    ...teamNames.team2
  ]);
  
  useEffect(() => {
    let shuffleCount = 0;
    const maxShuffles = 20; // Increased number of shuffles
    const shuffleInterval = 150; // Decreased interval for smoother animation
    
    const interval = setInterval(() => {
      setShuffledPlayers(prev => {
        // More dramatic shuffle with multiple passes
        let newArray = [...prev];
        for (let i = 0; i < 3; i++) {
          newArray = newArray
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        }
        return newArray;
      });
      
      shuffleCount++;
      
      if (shuffleCount >= maxShuffles) {
        clearInterval(interval);
        // Longer delay before completion
        setTimeout(onComplete, 800);
      }
    }, shuffleInterval);
  
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="col-span-full">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {shuffledPlayers.map((name, idx) => (
              <motion.div
                key={name + idx}
                layout
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted"
              >
                <Avatar size="sm" fallback={name[0]} />
                <span className="text-sm font-medium truncate">{name}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
  const [isShuffling, setIsShuffling] = useState(false);

  const handleGenerateTeams = async () => {
    try {
      if (availablePlayers.length < 4) {
        throw new Error('Need at least 4 players to generate teams');
      }

      const validPlayers = availablePlayers.filter(player => player && player.id);
      
      if (validPlayers.length < 4) {
        throw new Error('Not enough valid players to generate teams');
      }

      setIsShuffling(true);
      const result = await generateTeams(validPlayers);
      
      if (result) {
        setGeneratedTeams(result);
      }
    } catch (err) {
      console.error('Team generation error:', err);
      setIsShuffling(false);
    }
  };

  const handleShuffleComplete = () => {
    setIsShuffling(false);
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
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20"
          >
            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </motion.div>
          <h3 className="text-lg font-semibold">Team Generator</h3>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {generatedTeams && !isShuffling ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateTeams}
                disabled={loading || isShuffling || availablePlayers.length < 4}
                leftIcon={<Shuffle className="h-4 w-4" />}
                className="flex-1 sm:flex-none"
              >
                Regenerate
              </Button>
              <Button
                size="sm"
                onClick={() => onTeamsGenerated(generatedTeams.teams)}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="flex-1 sm:flex-none"
              >
                Continue
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleGenerateTeams}
              disabled={loading || isShuffling || availablePlayers.length < 4}
              leftIcon={<Wand2 className="h-4 w-4" />}
              className="flex-1 sm:flex-none"
            >
              Generate Teams
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <TeamGenerationFeedback
        availablePlayers={availablePlayers}
        error={error}
      />

      {/* Available Players Grid - Responsive */}
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
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200"
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Avatar
                  size="sm"
                  fallback={player.name[0]}
                  className="ring-2 ring-primary/10 ring-offset-2 ring-offset-background"
                />
              </motion.div>
              <span className="text-sm font-medium truncate">
                {player.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Generated Teams with Shuffle Animation */}
      <AnimatePresence mode="wait">
        {generatedTeams && (
          isShuffling ? (
            <ShufflingTeams 
              teamNames={generatedTeams.teamNames}
              onComplete={handleShuffleComplete}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.6, // Increase from 0.3 to 0.6
                type: "spring",
                stiffness: 150, // Lower values make animation slower
                damping: 20
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <TeamsList
                title="Team 1"
                players={generatedTeams.teamNames.team1}
                colorScheme="blue"
                animate
              />
              <TeamsList
                title="Team 2"
                players={generatedTeams.teamNames.team2}
                colorScheme="green"
                animate
              />
            </motion.div>
          )
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