import React from 'react';
import { motion } from 'framer-motion';
import { Match, MatchHistoryEvent } from '../../types/match';
import { Dialog, DialogContent, DialogHeader } from '../ui/Dialog';
import FormattedDate from '../common/FormattedDate';
import { 
  MessageSquare, Edit, Calendar, Play,
  CheckCircle, AlertTriangle, ArrowRightLeft, 
  Clock, UserMinus, Trash, ThumbsUp 
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface MatchHistoryDialogProps {
  match: Match;
  getPlayerName: (id: string) => string;
  isOpen: boolean;
  onClose: () => void;
}

const getEventIcon = (type: string) => {
  const icons = {
    creation: Clock,
    start: Play,
    score_update: Edit,
    substitution: UserMinus,
    completion: CheckCircle,
    status_update: AlertTriangle,
    result_confirmation: ThumbsUp,
    edit: Edit,
    reschedule: Calendar,
    deletion: Trash,
    comment: MessageSquare
  };
  return icons[type as keyof typeof icons] || AlertTriangle;
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'score_update':
    case 'edit':
      return {
        bgLight: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
      };
    case 'completion':
    case 'result_confirmation':
      return {
        bgLight: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800'
      };
    case 'creation':
      return {
        bgLight: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800'
      };
    case 'start':
      return {
        bgLight: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800'
      };
    case 'substitution':
      return {
        bgLight: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800'
      };
    case 'deletion':
      return {
        bgLight: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800'
      };
    case 'comment':
      return {
        bgLight: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-800'
      };
    default:
      return {
        bgLight: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800'
      };
  }
};

const EventCard: React.FC<{
  event: MatchHistoryEvent;
  renderContent: () => React.ReactNode;
}> = ({ event, renderContent }) => {
  const colors = getEventColor(event.type);
  const IconComponent = getEventIcon(event.type);
  const userName = event.userName || 'Unknown User';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-lg border ${colors.border} bg-white dark:bg-gray-800`}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-full ${colors.bgLight}`}>
          <IconComponent className={`h-4 w-4 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar
                size="sm"
                fallback={userName[0] || '?'}
              />
              <span className="text-sm font-medium truncate">
                {userName}
              </span>
            </div>
            <FormattedDate
              date={new Date(event.timestamp.seconds * 1000)}
              format="dateTime"
              className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0"
            />
          </div>
          {renderContent()}
        </div>
      </div>
    </motion.div>
  );
};

const MatchHistoryDialog: React.FC<MatchHistoryDialogProps> = ({
  match,
  isOpen,
  onClose
}) => {
  const renderEventContent = (event: MatchHistoryEvent) => {
    const { type, data } = event;

    switch (type) {
      case 'creation':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Created the match
          </div>
        );

      case 'start':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Match started
          </div>
        );

      case 'score_update':
        if (!data.newScores || !data.oldScores) return null;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {data.oldScores.team1} - {data.oldScores.team2}
              </span>
              <ArrowRightLeft className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">
                {data.newScores.team1Score} - {data.newScores.team2Score}
              </span>
            </div>
          </div>
        );

      case 'substitution':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Player substitution made
          </div>
        );

      case 'completion':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Match completed
          </div>
        );

      case 'status_update':
        if (!data.newStatus || !data.oldStatus) return null;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="info">{data.oldStatus}</Badge>
            <ArrowRightLeft className="h-4 w-4 text-gray-400" />
            <Badge variant="primary">{data.newStatus}</Badge>
          </div>
        );

      case 'result_confirmation':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Match result confirmed
          </div>
        );

      case 'edit':
        if (!data.finalScores) return null;
        return (
          <div className="space-y-2">
            <div className="text-sm">
              Match details updated with score:
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">
                {data.finalScores.team1Score} - {data.finalScores.team2Score}
              </span>
              {data.winner && (
                <Badge variant="success">
                  Winner: Team {data.winner === 'team1' ? '1' : '2'}
                </Badge>
              )}
            </div>
          </div>
        );

      case 'reschedule':
        if (!data.oldDate || !data.newDate) return null;
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <FormattedDate 
                date={new Date(data.oldDate.seconds * 1000)} 
                format="dateTime" 
              />
              <ArrowRightLeft className="h-4 w-4 text-gray-400" />
              <FormattedDate 
                date={new Date(data.newDate.seconds * 1000)} 
                format="dateTime" 
              />
            </div>
          </div>
        );

      case 'deletion':
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Match was deleted
          </div>
        );

      case 'comment':
        return (
          <div className="text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg italic">
            {data.text}
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-gray-500">
            Event details not available
          </div>
        );
    }
  };

  if (!match?.history) return null;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader>Match History</DialogHeader>
      <DialogContent>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {match.history.map((event, index) => (
            <EventCard
              key={index}
              event={event}
              renderContent={() => renderEventContent(event)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchHistoryDialog;