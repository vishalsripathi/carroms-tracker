// src/components/matches/TeamGenerationFeedback.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Users, XCircle } from 'lucide-react';

interface TeamGenerationFeedbackProps {
  availablePlayers: unknown[];
  error?: string | null;
}

const TeamGenerationFeedback: React.FC<TeamGenerationFeedbackProps> = ({
  availablePlayers,
  error
}) => {
  const getStatusConfig = () => {
    if (error) {
      return {
        type: 'error',
        message: error,
        icon: XCircle,
        colors: {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-200',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-500 dark:text-red-400'
        }
      };
    }

    if (!availablePlayers || availablePlayers.length === 0) {
      return {
        type: 'warning',
        message: 'No players available for team generation',
        icon: AlertTriangle,
        colors: {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-200',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-500 dark:text-yellow-400'
        }
      };
    }

    if (availablePlayers.length < 4) {
      return {
        type: 'warning',
        message: `Need ${4 - availablePlayers.length} more player(s) to generate teams`,
        icon: Users,
        colors: {
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          text: 'text-amber-800 dark:text-amber-200',
          border: 'border-amber-200 dark:border-amber-800',
          icon: 'text-amber-500 dark:text-amber-400'
        }
      };
    }

    return {
      type: 'success',
      message: `${availablePlayers.length} players available for team generation`,
      icon: CheckCircle,
      colors: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-200',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-500 dark:text-green-400'
      }
    };
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 p-4 rounded-lg border ${status.colors.bg} ${status.colors.border}`}
    >
      <div className={`p-1 rounded-full ${status.colors.bg}`}>
        <Icon className={`h-5 w-5 ${status.colors.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${status.colors.text}`}>
          {availablePlayers.length < 4 ? (
            <div className="flex items-center justify-between">
              <span>Available Players</span>
              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-xs">
                {availablePlayers.length} / 4
              </span>
            </div>
          ) : (
            status.message
          )}
        </div>
        {availablePlayers.length < 4 && (
          <div className="mt-2">
            <div className="w-full bg-white dark:bg-gray-800 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(availablePlayers.length / 4) * 100}%` }}
                className={`h-full rounded-full ${
                  availablePlayers.length === 0 ? 'bg-red-500' :
                  availablePlayers.length < 2 ? 'bg-amber-500' :
                  'bg-yellow-500'
                }`}
              />
            </div>
            <p className={`mt-1 text-xs ${status.colors.text}`}>
              {status.message}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TeamGenerationFeedback;