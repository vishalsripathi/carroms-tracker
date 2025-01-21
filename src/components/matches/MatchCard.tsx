// components/matches/MatchCard.tsx
import React, { useState } from 'react';
import { Match } from '../../types/match';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';
import SubstitutionModal from './SubstitutionModal';
import MatchHistoryDialog from './MatchHistoryDialog';
import { matchService } from '../../services/matchService';
import MatchComments from './MatchComments';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

interface MatchCardProps {
  match: Match;
  onUpdate: () => void;
  getPlayerName: (id: string) => string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div className="mb-4">{children}</div>
        {footer && <div className="mt-6 border-t pt-4">{footer}</div>}
      </div>
    </div>
  );
};

const MatchCard: React.FC<MatchCardProps> = ({ match, onUpdate, getPlayerName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState({
    team1Score: match.teams.team1.score,
    team2Score: match.teams.team2.score
  });
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [showEditMatch, setShowEditMatch] = useState(false);
  const [showSubstitution, setShowSubstitution] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [editScores, setEditScores] = useState({
    team1Score: match.teams.team1.score,
    team2Score: match.teams.team2.score
  });
  const [showReschedule, setShowReschedule] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newDate, setNewDate] = useState(match.date.toISOString().split('T')[0]);
  const [deleteReason, setDeleteReason] = useState('');
  const [showComments, setShowComments] = useState(false);

  const user = useAuthStore(state => state.user);

  const handleError = (error: any) => {
    setError(error?.message || 'An error occurred');
    setTimeout(() => setError(null), 5000);
  };

  const handleReschedule = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await matchService.rescheduleMatch(
        match.id,
        new Date(newDate),
        user.uid,
        user.displayName || 'Unknown User'
      );
      setShowReschedule(false);
      onUpdate();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await matchService.deleteMatch(
        match.id,
        user.uid,
        user.displayName || 'Unknown User',
        deleteReason
      );
      setShowDelete(false);
      onUpdate();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await matchService.updateMatchScore(match.id, scores, user.uid);
      onUpdate();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await matchService.startMatch(match.id, user.uid);
      onUpdate();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await matchService.completeMatch(match.id, scores, user.uid);
      setShowConfirmComplete(false);
      onUpdate();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMatch = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await matchService.editCompletedMatch(match.id, editScores, user.uid);
      setShowEditMatch(false);
      onUpdate();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubstitution = (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
    setShowSubstitution(true);
  };

  if (loading) {
    return <div className="p-4 text-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {/* Match Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">
            {match.date.toLocaleDateString()}
          </span>
          <span className={`px-2 py-1 text-sm rounded mt-1 ${
            match.status === 'completed' ? 'bg-green-100 text-green-800' :
            match.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {match.status.replace('_', ' ')}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowComments(true)}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Comments
          </button>
          {(match.status === 'scheduled' || match.status === 'in_progress') && (
            <>
              <button
                onClick={() => setShowReschedule(true)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Reschedule
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
              >
                Cancel Match
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            View History
          </button>
          {match.status === 'completed' && (
            <button
              onClick={() => setShowEditMatch(true)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Edit Match
            </button>
          )}
        </div>
      </div>

      {/* Teams and Scores */}
      <div className="grid grid-cols-3 gap-6">
        {/* Team 1 */}
        <div className="space-y-4">
          <div className="font-medium">Team 1</div>
          <div className="space-y-2">
            {match.teams.team1.players.map(playerId => (
              <div key={playerId} className="text-sm">
                {getPlayerName(playerId)}
              </div>
            ))}
          </div>
          {match.status === 'in_progress' && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={scores.team1Score}
                onChange={e => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  setScores(prev => ({
                    ...prev,
                    team1Score: value
                  }));
                }}
                onBlur={handleScoreUpdate}
                className="w-20 rounded border border-gray-300 p-1"
                min="0"
                max="29"
              />
              <span className="text-sm text-gray-500">points</span>
            </div>
          )}
          {match.status === 'completed' && (
            <div className="text-xl font-bold">
              {match.teams.team1.score}
              {match.winner === 'team1' && (
                <span className="ml-2 text-green-600 text-sm">Winner</span>
              )}
            </div>
          )}
          {match.status !== 'scheduled' && (
            <button
              onClick={() => handleSubstitution('team1')}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Substitute Player
            </button>
          )}
        </div>

        {/* Match Controls */}
        <div className="flex flex-col items-center justify-center space-y-4">
          {match.status === 'scheduled' ? (
            <button
              onClick={handleStartMatch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Match
            </button>
          ) : match.status === 'in_progress' ? (
            <button 
              onClick={() => setShowConfirmComplete(true)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Complete Match
            </button>
          ) : (
            <div className="text-2xl font-bold">
              {match.teams.team1.score} - {match.teams.team2.score}
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div className="space-y-4">
          <div className="font-medium">Team 2</div>
          <div className="space-y-2">
            {match.teams.team2.players.map(playerId => (
              <div key={playerId} className="text-sm">
                {getPlayerName(playerId)}
              </div>
            ))}
          </div>
          {match.status === 'in_progress' && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={scores.team2Score}
                onChange={e => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  setScores(prev => ({
                    ...prev,
                    team2Score: value
                  }));
                }}
                onBlur={handleScoreUpdate}
                className="w-20 rounded border border-gray-300 p-1"
                min="0"
                max="29"
              />
              <span className="text-sm text-gray-500">points</span>
            </div>
          )}
          {match.status === 'completed' && (
            <div className="text-xl font-bold">
              {match.teams.team2.score}
              {match.winner === 'team2' && (
                <span className="ml-2 text-green-600 text-sm">Winner</span>
              )}
            </div>
          )}
          {match.status !== 'scheduled' && (
            <button
              onClick={() => handleSubstitution('team2')}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Substitute Player
            </button>
          )}
        </div>
      </div>

      {/* Complete Match Confirmation Modal */}
      <Modal
        isOpen={showConfirmComplete}
        onClose={() => setShowConfirmComplete(false)}
        title="Complete Match"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowConfirmComplete(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteMatch}
              disabled={scores.team1Score === scores.team2Score}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Complete Match
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please confirm the final scores before completing the match. This action cannot be undone.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Team 1 Final Score</label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="number"
                  value={scores.team1Score}
                  onChange={e => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setScores(prev => ({ ...prev, team1Score: value }));
                  }}
                  className="w-20 rounded border border-gray-300 p-1"
                  min="0"
                  max="29"
                />
                <span className="text-sm text-gray-500">points</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Team 2 Final Score</label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="number"
                  value={scores.team2Score}
                  onChange={e => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setScores(prev => ({ ...prev, team2Score: value }));
                  }}
                  className="w-20 rounded border border-gray-300 p-1"
                  min="0"
                  max="29"
                />
                <span className="text-sm text-gray-500">points</span>
              </div>
            </div>
          </div>
          {scores.team1Score === scores.team2Score && (
            <div className="p-4 bg-red-100 text-red-800 rounded">
              Scores cannot be equal. Please enter the final scores.
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Match Modal */}
      <Modal
        isOpen={showEditMatch}
        onClose={() => setShowEditMatch(false)}
        title="Edit Match Results"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowEditMatch(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditMatch}
              disabled={editScores.team1Score === editScores.team2Score}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Update the match scores if needed. This will update the match history and statistics.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Team 1 Score</label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                type="number"
                value={editScores.team1Score}
                onChange={e => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  setEditScores(prev => ({ ...prev, team1Score: value }));
                }}
                className="w-20 rounded border border-gray-300 p-1"
                min="0"
                max="29"
              />
              <span className="text-sm text-gray-500">points</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Team 2 Score</label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="number"
                value={editScores.team2Score}
                onChange={e => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  setEditScores(prev => ({ ...prev, team2Score: value }));
                }}
                className="w-20 rounded border border-gray-300 p-1"
                min="0"
                max="29"
              />
              <span className="text-sm text-gray-500">points</span>
            </div>
          </div>
        </div>
        {editScores.team1Score === editScores.team2Score && (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            Scores cannot be equal. Please enter different scores.
          </div>
        )}
      </div>
    </Modal>

    {/* Match History Modal */}
    <Modal
      isOpen={showHistory}
      onClose={() => setShowHistory(false)}
      title="Match History"
    >
      <div className="space-y-4">
        <MatchHistoryDialog
          match={match}
          getPlayerName={getPlayerName}
          onClose={() => setShowHistory(false)}
        />
      </div>
    </Modal>

    <Modal
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        title="Reschedule Match"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowReschedule(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Cancel Match"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDelete(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Confirm Cancellation
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this match? This action cannot be undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason (optional)
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        title="Match Comments"
      >
        <MatchComments
          matchId={match.id}
          onCommentAdded={onUpdate}
        />
      </Modal>

    {/* Substitution Modal */}
    {showSubstitution && (
      <SubstitutionModal
        isOpen={showSubstitution}
        onClose={() => setShowSubstitution(false)}
        matchId={match.id}
        team={selectedTeam}
        currentPlayers={selectedTeam ? match.teams[selectedTeam].players : []}
        onSubstitution={onUpdate}
      />
    )}
  </div>
);
};

export default MatchCard;