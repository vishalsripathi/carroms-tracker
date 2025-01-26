// src/components/matches/modals/RescheduleModal.tsx
import { BaseModal } from './BaseModal';
import { Button } from '../../ui/Button';
import { Calendar } from '../../ui/Calendar/Calendar';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onDateChange: (date: string) => void;
  onReschedule: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  date,
  onDateChange,
  onReschedule,
}) => {
  const selectedDate = new Date(date);

  const handleDateChange = (newDate: Date) => {
    // Ensure consistent timezone handling
    const normalizedDate = new Date(Date.UTC(
      newDate.getFullYear(),
      newDate.getMonth(), 
      newDate.getDate()
    ));
    onDateChange(normalizedDate.toISOString().split('T')[0]);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Match"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onReschedule}>Confirm</Button>
        </div>
      }
    >
      <div className="space-y-4 flex justify-center">
        <Calendar
          value={selectedDate}
          onChange={handleDateChange}
          disablePastDates
        />
      </div>
    </BaseModal>
  );
};