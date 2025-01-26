// src/components/matches/MatchComments.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { matchService } from '../../services/matchService';
import { Dialog, DialogContent, DialogHeader } from '../ui/Dialog';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { Send, Smile, AlertTriangle, MessageSquare } from 'lucide-react';
import { Textarea } from '../ui/Textarea/Textarea';

interface Comment {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

interface MatchCommentsProps {
  matchId: string;
  onCommentAdded: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const MessageBubble = ({ comment, isCurrentUser }: { comment: Comment; isCurrentUser: boolean; }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full mb-4"
  >
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar size="sm" fallback={comment.userName[0]} className="flex-shrink-0 mt-1" />
      <div className={`flex flex-col w-full ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm max-w-[85%] ${
          isCurrentUser 
            ? 'bg-primary-600 text-primary-50 rounded-tr-none' 
            : 'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-tl-none'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
        </div>
        <div className={`flex items-center gap-2 mt-1 text-xs ${
          isCurrentUser ? 'flex-row-reverse' : ''
        }`}>
          <span className="font-medium text-gray-700 dark:text-gray-300">{comment.userName}</span>
          <span className="text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const DateDivider = ({ date }: { date: Date }) => (
  <div className="flex items-center justify-center my-4">
    <div className="bg-gray-200 dark:bg-gray-700 h-px flex-1" />
    <span className="px-4 text-xs text-gray-500 dark:text-gray-400">
      {formatDistanceToNow(date, { addSuffix: true })}
    </span>
    <div className="bg-gray-200 dark:bg-gray-700 h-px flex-1" />
  </div>
);

const MatchComments: React.FC<MatchCommentsProps> = ({
  matchId,
  onCommentAdded,
  isOpen,
  onClose
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore(state => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const matchDoc = await matchService.getMatch(matchId);
        const matchComments = matchDoc.history
          .filter(event => event.type === 'comment')
          .map(event => ({
            id: event.timestamp.getTime().toString(),
            matchId,
            userId: event.userId,
            userName: event.userName,
            text: event.data.text || '',
            timestamp: event.timestamp
          }))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) as unknown as Comment[];

        setComments(matchComments);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchComments();
    }
  }, [matchId, isOpen]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      setLoading(true);
      await matchService.addComment(matchId, {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || 'Unknown User'
      });
      
      const newCommentObj = {
        id: new Date().getTime().toString(),
        matchId,
        userId: user.uid,
        userName: user.displayName || 'Unknown User',
        text: newComment.trim(),
        timestamp: new Date()
      };
      setComments(prev => [...prev, newCommentObj]);
      
      setNewComment('');
      onCommentAdded();
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader>Match Comments</DialogHeader>
      
      <DialogContent className="h-[600px] flex flex-col p-0">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4"
        >
          <AnimatePresence>
            {comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
              >
                <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Be the first to start the conversation!</p>
              </motion.div>
            ) : (
              <div className="space-y-6 py-4">
                {comments.map((comment, index) => {
                  // Check if we need to show a date divider
                  const showDivider = index === 0 || (
                    new Date(comment.timestamp).toDateString() !==
                    new Date(comments[index - 1].timestamp).toDateString()
                  );

                  return (
                    <React.Fragment key={comment.id}>
                      {showDivider && (
                        <DateDivider date={comment.timestamp} />
                      )}
                      <MessageBubble
                        comment={comment}
                        isCurrentUser={comment.userId === user?.uid}
                      />
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={3}
              className="resize-none"
              autoExpand
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <Smile className="h-5 w-5 text-gray-500" />
                </Button>
                {/* Add more message options here */}
              </div>
              <Button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="min-w-[100px]"
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchComments;