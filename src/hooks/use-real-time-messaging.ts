import { useState, useEffect, useCallback } from 'react';
import { webSocketService } from '../services/websocket-service';
import {
  Message,
  UserPresence,
  ConnectionStatus,
  TypingIndicator,
  ChatRoom
} from '../types/real-time-messaging.types';

export const useRealTimeMessaging = (userId: string, roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    webSocketService.getConnectionStatus()
  );
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Handle incoming messages
  useEffect(() => {
    webSocketService.onMessage((message: Message) => {
      setMessages(prev => [...prev, message].sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      ));
    });
  }, []);

  // Handle presence updates
  useEffect(() => {
    webSocketService.onPresenceUpdate((presence: UserPresence) => {
      setUsers(prev => {
        const index = prev.findIndex(u => u.userId === presence.userId);
        if (index >= 0) {
          const newUsers = [...prev];
          newUsers[index] = presence;
          return newUsers;
        }
        return [...prev, presence];
      });
    });
  }, []);

  // Handle typing indicators
  useEffect(() => {
    webSocketService.onTypingUpdate((indicator: TypingIndicator) => {
      if (indicator.roomId === roomId) {
        setTypingUsers(prev => {
          const filtered = prev.filter(t => t.userId !== indicator.userId);
          if (indicator.isTyping) {
            return [...filtered, indicator];
          }
          return filtered;
        });
      }
    });
  }, [roomId]);

  // Update connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(webSocketService.getConnectionStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Send message handler
  const sendMessage = useCallback(async (content: string) => {
    try {
      const message: Message = {
        id: crypto.randomUUID(),
        senderId: userId,
        receiverId: roomId,
        content,
        timestamp: new Date(),
        isRead: false,
        type: 'text'
      };

      webSocketService.sendMessage(message);
      return message;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      throw err;
    }
  }, [userId, roomId]);

  // Handle typing status
  const updateTypingStatus = useCallback((isTyping: boolean) => {
    const indicator: TypingIndicator = {
      userId,
      roomId,
      isTyping,
      timestamp: new Date()
    };
    webSocketService.updateTypingStatus(indicator);
  }, [userId, roomId]);

  // Update user presence
  const updatePresence = useCallback((status: 'online' | 'offline' | 'away') => {
    const presence: UserPresence = {
      userId,
      status,
      lastSeen: new Date(),
      isTyping: false
    };
    webSocketService.updatePresence(presence);
  }, [userId]);

  return {
    messages,
    users,
    connectionStatus,
    typingUsers,
    error,
    sendMessage,
    updateTypingStatus,
    updatePresence
  };
};
