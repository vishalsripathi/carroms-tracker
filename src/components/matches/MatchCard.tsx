// src/components/matches/MatchCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Match } from '../../types/match';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../ui/Card';
import { matchService } from '../../services/matchService';

// Import modals and components
import { CompleteMatchModal } from './modals/CompleteMatchModal';
import { EditMatchModal } from './modals/EditMatchModal';
import { RescheduleModal } from './modals/RescheduleModal';
import { DeleteMatchModal } from './modals/DeleteMatchModal';
import { TeamSection } from './TeamSection';
import { MatchHeader } from './MatchHeader';
import { MatchActions } from './MatchActions';
import { MatchControls } from './MatchControls';
import MatchHistoryDialog from './MatchHistoryDialog';
import MatchComments from './MatchComments';
import SubstitutionModal from './SubstitutionModal';
import { AlertDialog } from '../ui/AlertDialog/AlertDialog';
import { LoadingSpinner } from '../ui/LoadingSpinner/LoadingSpinner';
import { emailService } from '../../services/emailService';
import { Player } from '../../types';

interface MatchCardProps {
  match: Match;
  onUpdate: () => void;
  getPlayerName: (id: string) => string;
  players: Player[];
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onUpdate, getPlayerName, players }) => {
  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [scores, setScores] = useState({
    team1Score: match.teams.team1.score,
    team2Score: match.teams.team2.score
  });
  const [editScores, setEditScores] = useState({
    team1Score: match.teams.team1.score,
    team2Score: match.teams.team2.score
  });
  const [newDate, setNewDate] = useState(match.date.toISOString().split('T')[0]);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);

  // Modal States
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [showEditMatch, setShowEditMatch] = useState(false);
  const [showSubstitution, setShowSubstitution] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const user = useAuthStore(state => state.user);

  const handleError = (error: any) => {
    setError(error?.message || 'An error occurred');
    setTimeout(() => setError(null), 5000);
  };

  // Match Action Handlers
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

      // Send match completed email
      try {

        // Create updated match object with final scores
        const completedMatch: Match = {
          ...match,
          teams: {
            team1: {
              ...match.teams.team1,
              score: scores.team1Score
            },
            team2: {
              ...match.teams.team2,
              score: scores.team2Score
            }
          },
          history: match.history.map(event => ({
            ...event,
            timestamp: event.timestamp  // Keep the FirebaseTimestamp
          })),
          createdAt: match.createdAt instanceof Date ? match.createdAt : new Date(match.createdAt),
          updatedAt: match.updatedAt instanceof Date ? match.updatedAt : new Date(match.updatedAt),
          winner: scores.team1Score > scores.team2Score ? 'team1' : 'team2',
          status: 'completed'
        };
        const allPlayerEmails = [
          ...match.teams.team1.players,
          ...match.teams.team2.players
        ]
          .map(id => players.find(p => p.id === id)?.email)
          .filter((email): email is string => email !== undefined);
        
          await emailService.sendMatchCompletedEmail(
            completedMatch,
            players,
            allPlayerEmails
          );
      } catch (emailError) {
        console.error('Failed to send match completion email:', emailError);
        // Don't block the match completion if email fails
      }

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
        // Update local state immediately
        setScores(editScores);
        // Force parent to refetch
        await onUpdate();
        setShowEditMatch(false);
    } catch (err) {
        handleError(err);
    } finally {
        setLoading(false);
    }
};

const handleReschedule = async () => {
  if (!user) return;
  try {
    setLoading(true);
    const oldDate = match.date;
    await matchService.rescheduleMatch(
      match.id,
      new Date(newDate),
      user.uid,
      user.displayName || 'Unknown User'
    );

    // Send rescheduling email
    try {
      // Get all player emails for both teams
      

      // Create updated match object
      const updatedMatch = {
        ...match,
        date: new Date(newDate)
      };

      const allPlayerEmails = [
        ...match.teams.team1.players,
        ...match.teams.team2.players
      ]
        .map(id => players.find(p => p.id === id)?.email)
        .filter((email): email is string => email !== undefined);
      
      await emailService.sendMatchRescheduledEmail(
        updatedMatch,
        oldDate,
        players,
        allPlayerEmails
      );
    } catch (emailError) {
      console.error('Failed to send reschedule email:', emailError);
      // Don't block the rescheduling if email fails
    }

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

  const handleSubstitution = (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
    setShowSubstitution(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {error && (
            <AlertDialog
            open={showErrorDialog}
            onOpenChange={setShowErrorDialog}
            title="Error"
            description={error || 'An unexpected error occurred'}
            cancelText="Dismiss"
            confirmText="Try Again"
            onConfirm={() => {
              setShowErrorDialog(false);
              onUpdate(); // Optionally retry the operation
            }}
          />
          )}

          {/* Match Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <MatchHeader date={match.date} status={match.status} />
            <MatchActions
              status={match.status}
              onViewComments={() => setShowComments(true)}
              onViewHistory={() => setShowHistory(true)}
              onEdit={() => setShowEditMatch(true)}
              onReschedule={() => setShowReschedule(true)}
              onCancel={() => setShowDelete(true)}
            />
          </div>

          {/* Teams and Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team 1 */}
            <TeamSection
              team="team1"
              players={match.teams.team1.players}
              score={scores.team1Score}
              isWinner={match.winner === 'team1'}
              status={match.status}
              onSubstitute={() => handleSubstitution('team1')}
              onScoreChange={(value) => setScores(prev => ({ ...prev, team1Score: value }))}
              onScoreBlur={handleScoreUpdate}
              getPlayerName={getPlayerName}
            />

            {/* Match Controls */}
            <MatchControls
              status={match.status}
              team1Score={scores.team1Score}
              team2Score={scores.team2Score}
              onStartMatch={handleStartMatch}
              onCompleteMatch={() => setShowConfirmComplete(true)}
            />

            {/* Team 2 */}
            <TeamSection
              team="team2"
              players={match.teams.team2.players}
              score={scores.team2Score}
              isWinner={match.winner === 'team2'}
              status={match.status}
              onSubstitute={() => handleSubstitution('team2')}
              onScoreChange={(value) => setScores(prev => ({ ...prev, team2Score: value }))}
              onScoreBlur={handleScoreUpdate}
              getPlayerName={getPlayerName}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CompleteMatchModal
        isOpen={showConfirmComplete}
        onClose={() => setShowConfirmComplete(false)}
        scores={scores}
        onScoreChange={(team, value) => 
          setScores(prev => ({ ...prev, [`${team}Score`]: value }))
        }
        onComplete={handleCompleteMatch}
      />

      <EditMatchModal
        isOpen={showEditMatch}
        onClose={() => setShowEditMatch(false)}
        scores={editScores}
        onScoreChange={(team, value) => 
          setEditScores(prev => ({ ...prev, [`${team}Score`]: value }))
        }
        onSave={handleEditMatch}
      />

      <RescheduleModal
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        date={newDate}
        onDateChange={setNewDate}
        onReschedule={handleReschedule}
      />

      <DeleteMatchModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        reason={deleteReason}
        onReasonChange={setDeleteReason}
        onDelete={handleDelete}
      />

      {showHistory && (
        <MatchHistoryDialog
          match={match}
          getPlayerName={getPlayerName}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showComments && (
        <MatchComments
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          matchId={match.id}
          onCommentAdded={onUpdate}
        />
      )}

      {showSubstitution && (
        <SubstitutionModal
          isOpen={showSubstitution}
          getPlayerName={getPlayerName}
          onClose={() => setShowSubstitution(false)}
          matchId={match.id}
          team={selectedTeam}
          currentPlayers={selectedTeam ? match.teams[selectedTeam].players : []}
          onSubstitution={onUpdate}
        />
      )}
    </motion.div>
  );
};

export default MatchCard;