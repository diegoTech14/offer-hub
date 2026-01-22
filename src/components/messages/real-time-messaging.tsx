import React, { useState, useRef, useEffect } from 'react';
import { useRealTimeMessaging } from '../../hooks/use-real-time-messaging';
import { ConnectionStatusIndicator } from './connection-status';
import { TypingIndicatorDisplay } from './typing-indicator';
import { throttle } from '../../utils/websocket-helpers';
import {
  Message,
  UserPresence
} from '../../types/real-time-messaging.types';

interface RealTimeMessagingProps {
  userId: string;
  roomId: string;
  className?: string;
}

export const RealTimeMessaging: React.FC<RealTimeMessagingProps> = ({
  userId,
  roomId,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    users,
    connectionStatus,
    typingUsers,
    error,
    sendMessage,
    updateTypingStatus,
    updatePresence
  } = useRealTimeMessaging(userId, roomId);

  // Throttle the typing indicator update
  const throttledTypingUpdate = throttle((isTyping: boolean) => {
    updateTypingStatus(isTyping);
  }, 1000);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    throttledTypingUpdate(e.target.value.length > 0);
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await sendMessage(inputValue.trim());
      setInputValue('');
      updateTypingStatus(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isScrolledToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledToBottom]);

  // Handle scroll position
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = messageContainerRef.current;
      setIsScrolledToBottom(Math.abs(scrollHeight - scrollTop - clientHeight) < 10);
    }
  };

  // Update presence on mount and unmount
  useEffect(() => {
    updatePresence('online');
    return () => {
      updatePresence('offline');
    };
  }, [updatePresence]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Connection status */}
      <div className="px-4 py-2 border-b">
        <ConnectionStatusIndicator status={connectionStatus} />
      </div>

      {/* Messages container */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === userId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.senderId === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <div className="px-4 py-2">
        <TypingIndicatorDisplay typingUsers={typingUsers} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            className="flex-1 resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={!connectionStatus.isConnected}
          >
            Send
          </button>
        </div>
      </form>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mx-4 mb-4">
          {error.message}
        </div>
      )}
    </div>
  );
};
