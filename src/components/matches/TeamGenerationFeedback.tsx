import React from 'react';

interface TeamGenerationFeedbackProps {
  availablePlayers: unknown[];
  error?: string | null;
}

const TeamGenerationFeedback: React.FC<TeamGenerationFeedbackProps> = ({
  availablePlayers,
  error
}) => {
  const getStatusMessage = () => {
    if (error) {
      return {
        type: 'error',
        message: error
      };
    }

    if (!availablePlayers || availablePlayers.length === 0) {
      return {
        type: 'warning',
        message: 'No players available for team generation'
      };
    }

    if (availablePlayers.length < 4) {
      return {
        type: 'warning',
        message: `Need ${4 - availablePlayers.length} more player(s) to generate teams`
      };
    }

    return {
      type: 'success',
      message: `${availablePlayers.length} players available for team generation`
    };
  };

  const status = getStatusMessage();

  return (
    <div className={`p-3 rounded ${
      status.type === 'error' ? 'bg-red-100 text-red-700' :
      status.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
      'bg-green-100 text-green-700'
    }`}>
      {status.message}
    </div>
  );
};

export default TeamGenerationFeedback;