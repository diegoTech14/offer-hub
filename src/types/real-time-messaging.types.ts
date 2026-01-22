import { User } from './user.types';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  isTyping: boolean;
}

export interface MessageQueue {
  messages: Message[];
  recipientId: string;
  attempts: number;
  lastAttempt: Date;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastPing: number;
  latency: number;
  reconnectAttempts: number;
}

export interface TypingIndicator {
  userId: string;
  roomId: string;
  isTyping: boolean;
  timestamp: Date;
}

export type WebSocketEvent = {
  type: 'message' | 'presence' | 'typing' | 'connection' | 'error';
  payload: any;
  timestamp: Date;
};
