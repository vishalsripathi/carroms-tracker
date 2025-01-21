// src/components/matches/MatchHistoryDialog.tsx

import React from 'react';
import { Match } from '../../types/match';
import FormattedDate from '../common/FormattedDate';

interface MatchHistoryDialogProps {
  match: Match;
  getPlayerName: (id: string) => string;
  onClose: () => void;
}

const MatchHistoryDialog: React.FC<MatchHistoryDialogProps> = ({
  match,
  getPlayerName
}) => {
  const renderEventData = (type: string, data: any, userName: string) => {
    switch (type) {
      case 'score_update':
        return (
          <div>
            <div className="text-sm font-medium mb-1">
              Score updated by {userName}
            </div>
            <div className="text-sm">
              Old scores: {data.oldScores.team1} - {data.oldScores.team2}
            </div>
            <div className="text-sm">
              New scores: {data.newScores.team1Score} - {data.newScores.team2Score}
            </div>
          </div>
        );
      case 'status_change':
        return (
          <div>
            <div className="text-sm font-medium mb-1">
              Status updated by {userName}
            </div>
            <div className="text-sm">
              Changed from {data.oldStatus} to {data.newStatus}
            </div>
          </div>
        );
      case 'substitution':
        return (
          <div>
            <div className="text-sm font-medium mb-1">
              Player substitution by {userName}
            </div>
            <div className="text-sm">
              {getPlayerName(data.oldPlayerId)} was replaced by {getPlayerName(data.newPlayerId)}
            </div>
          </div>
        );
      case 'reschedule':
        return (
          <div>
            <div className="text-sm font-medium mb-1">
              Match rescheduled by {userName}
            </div>
            <div className="text-sm">
              From: <FormattedDate date={data.oldDate} format="dateTime" />
            </div>
            <div className="text-sm">
              To: <FormattedDate date={data.newDate} format="dateTime" />
            </div>
          </div>
        );
      case 'deletion':
        return (
          <div>
            <div className="text-sm font-medium mb-1">
              Match cancelled by {userName}
            </div>
            {data.reason && (
              <div className="text-sm">
                Reason: {data.reason}
              </div>
            )}
          </div>
        );
      case 'comment':
        return (
          <div>
            <div className="text-sm font-medium mb-1">
              Comment by {userName}
            </div>
            <div className="text-sm italic">
              "{data.text}"
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {match.history.map((event, index) => (
        <div
          key={index}
          className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium">
              {event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            <FormattedDate 
              date={event.timestamp}
              format="dateTime"
              className="text-xs text-gray-500"
            />
          </div>
          {renderEventData(event.type, event.data, event.userName)}
        </div>
      ))}
    </div>
  );
};

export default MatchHistoryDialog;