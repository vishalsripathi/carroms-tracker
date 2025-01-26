// src/components/matches/MatchControls.tsx
import { Button } from '../ui/Button';
import { PlayCircle, CheckCircle } from 'lucide-react';

interface MatchControlsProps {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  team1Score: number;
  team2Score: number;
  onStartMatch?: () => void;
  onCompleteMatch?: () => void;
}

export const MatchControls: React.FC<MatchControlsProps> = ({
  status,
  team1Score,
  team2Score,
  onStartMatch,
  onCompleteMatch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {status === 'scheduled' ? (
        <Button
          size="lg"
          onClick={onStartMatch}
          className="w-full"
          leftIcon={<PlayCircle className="h-5 w-5" />}
        >
          Start Match
        </Button>
      ) : status === 'in_progress' ? (
        <Button
          variant="outline"
          size="lg"
          onClick={onCompleteMatch}
          className="w-full"
          leftIcon={<CheckCircle className="h-5 w-5" />}
        >
          Complete Match
        </Button>
      ) : (
        <div className="text-3xl font-bold text-center">
          {team1Score} - {team2Score}
        </div>
      )}
    </div>
  );
};