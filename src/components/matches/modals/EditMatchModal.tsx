import { ScoreInput } from '../ScoreInput';
import { BaseModal } from './BaseModal';
import { Button } from '../../ui/Button';

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: { team1Score: number; team2Score: number };
  onScoreChange: (team: 'team1' | 'team2', value: number) => void;
  onSave: () => void;
}

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  isOpen,
  onClose,
  scores,
  onScoreChange,
  onSave,
}) => {
  const scoresEqual = scores.team1Score === scores.team2Score;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Match Results"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={scoresEqual}
            variant="default"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Update the match scores if needed. This will update the match history and statistics.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <ScoreInput
            label="Team 1 Score"
            value={scores.team1Score}
            onChange={(value) => onScoreChange('team1', value)}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
          <ScoreInput
            label="Team 2 Score"
            value={scores.team2Score}
            onChange={(value) => onScoreChange('team2', value)}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        {scoresEqual && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
            Scores cannot be equal. Please enter different scores.
          </div>
        )}
      </div>
    </BaseModal>
  );
};