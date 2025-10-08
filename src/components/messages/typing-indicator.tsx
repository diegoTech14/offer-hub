import React from 'react';
import { TypingIndicator } from '../../types/real-time-messaging.types';

interface TypingIndicatorProps {
  typingUsers: TypingIndicator[];
  className?: string;
}

export const TypingIndicatorDisplay: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  className = ''
}) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    const count = typingUsers.length;
    if (count === 1) {
      return 'is typing...';
    }
    if (count === 2) {
      return 'are typing...';
    }
    return `and ${count - 1} others are typing...`;
  };

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
      </div>
      <span>
        {typingUsers[0].userId} {getTypingText()}
      </span>
    </div>
  );
};
