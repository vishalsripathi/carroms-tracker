// src/components/matches/modals/DeleteMatchModal.tsx
import { BaseModal } from './BaseModal';
import { Button } from '../../ui/Button';
import { AlertTriangle } from 'lucide-react';
import { Textarea } from '../../ui/Textarea/Textarea';

interface DeleteMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onDelete: () => void;
}

export const DeleteMatchModal: React.FC<DeleteMatchModalProps> = ({
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onDelete,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Match"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Confirm Cancellation
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            Are you sure you want to cancel this match? This action cannot be undone.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason (optional)
          </label>
          <Textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
            rows={3}
          />
        </div>
      </div>
    </BaseModal>
  );
};