// components/matches/MatchComments.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { matchService } from '../../services/matchService';
import { BasicAlert } from '../ui/BasicAlert';
import FormattedDate from '../common/FormattedDate';

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
}

const MatchComments: React.FC<MatchCommentsProps> = ({ matchId, onCommentAdded }) => {
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
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setComments(matchComments);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        setError('Failed to load comments');
      }
    };

    fetchComments();
  }, [matchId]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      setLoading(true);
      await matchService.addComment(matchId, {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || 'Unknown User'
      });
      
      // Add new comment to local state immediately for better UX
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
    <div className="flex flex-col h-[500px]">
      {error && <BasicAlert type="error">{error}</BasicAlert>}
      
      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 p-4"
      >
        {comments.map(comment => (
          <div
            key={comment.id}
            className={`flex ${comment.userId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] ${
                comment.userId === user?.uid
                  ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
                  : 'bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg'
              } p-3 relative`}
            >
              {/* Message content */}
              <p className="text-sm whitespace-pre-wrap break-words">
                {comment.text}
              </p>
              
              {/* User name and timestamp */}
              <div 
                className={`text-xs mt-1 flex items-center gap-2 ${
                  comment.userId === user?.uid ? 'text-blue-50' : 'text-gray-500'
                }`}
              >
                <span>{comment.userName}</span>
                <span>•</span>
                <FormattedDate 
                  date={comment.timestamp} 
                  format="time"
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg resize-none min-h-[44px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed h-[44px] flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchComments;