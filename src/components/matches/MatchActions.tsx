// src/components/matches/MatchActions.tsx
import { 
  MessageSquare, History, PencilLine, 
  CalendarDays, XCircle 
} from 'lucide-react';
import { Button } from '../ui/Button';

interface MatchActionsProps {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  onViewComments: () => void;
  onViewHistory: () => void;
  onEdit?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export const MatchActions: React.FC<MatchActionsProps> = ({
  status,
  onViewComments,
  onViewHistory,
  onEdit,
  onReschedule,
  onCancel,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewComments}
        leftIcon={<MessageSquare className="h-4 w-4" />}
      >
        Comments
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onViewHistory}
        leftIcon={<History className="h-4 w-4" />}
      >
        History
      </Button>

      {status === 'completed' && onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          leftIcon={<PencilLine className="h-4 w-4" />}
        >
          Edit
        </Button>
      )}

      {(status === 'scheduled' || status === 'in_progress') && (
        <>
          {onReschedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReschedule}
              leftIcon={<CalendarDays className="h-4 w-4" />}
            >
              Reschedule
            </Button>
          )}

          {onCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onCancel}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Cancel
            </Button>
          )}
        </>
      )}
    </div>
  );
};