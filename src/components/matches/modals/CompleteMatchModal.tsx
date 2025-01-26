// src/components/matches/modals/CompleteMatchModal.tsx
import { ScoreInput } from '../ScoreInput';
import { BaseModal } from './BaseModal';
import { Button } from '../../ui/Button';

interface CompleteMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: { team1Score: number; team2Score: number };
  onScoreChange: (team: 'team1' | 'team2', value: number) => void;
  onComplete: () => void;
}

export const CompleteMatchModal: React.FC<CompleteMatchModalProps> = ({
  isOpen,
  onClose,
  scores,
  onScoreChange,
  onComplete,
}) => {
  const scoresEqual = scores.team1Score === scores.team2Score;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Match"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onComplete}
            disabled={scoresEqual}
          >
            Complete Match
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please confirm the final scores before completing the match. This action cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <ScoreInput
            label="Team 1 Final Score"
            value={scores.team1Score}
            onChange={(value) => onScoreChange('team1', value)}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
          <ScoreInput
            label="Team 2 Final Score"
            value={scores.team2Score}
            onChange={(value) => onScoreChange('team2', value)}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        {scoresEqual && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Scores cannot be equal. Please enter different final scores.
          </div>
        )}
      </div>
    </BaseModal>
  );
};