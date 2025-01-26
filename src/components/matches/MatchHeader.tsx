
import { Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { Badge } from '../ui/Badge';

interface MatchHeaderProps {
  date: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({ date, status }) => {
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium">
          {formatDate(date, 'date')}
        </span>
      </div>
      <Badge className={getStatusColors(status)}>
        {status.replace('_', ' ')}
      </Badge>
    </div>
  );
};