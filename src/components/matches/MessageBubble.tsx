import { formatDistanceToNow } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";

// src/components/matches/MessageBubble.tsx
interface MessageBubbleProps {
    isCurrentUser: boolean;
    children: React.ReactNode;
    userName: string;
    timestamp: Date;
    avatar?: string;
  }
  
  export const MessageBubble = ({
    isCurrentUser,
    children,
    userName,
    timestamp,
    avatar
  }: MessageBubbleProps) => {
    const [showDetails, setShowDetails] = useState(false);
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`group flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <Avatar
          size="sm"
          fallback={userName[0]}
          src={avatar}
          className="flex-shrink-0 transition-transform group-hover:scale-110"
        />
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <motion.div
            className={`
              max-w-[80%] rounded-lg px-4 py-2 shadow-sm
              transition-all duration-200
              ${isCurrentUser
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {children}
          </motion.div>
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 mt-1"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {userName}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDistanceToNow(timestamp, { addSuffix: true })}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };