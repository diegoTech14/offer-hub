import { ConnectionStatus, Message } from '../types/real-time-messaging.types';

export const calculateReconnectDelay = (attempts: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay);
  return delay + Math.random() * 1000; // Add jitter
};

export const isConnectionHealthy = (status: ConnectionStatus): boolean => {
  return status.isConnected && status.latency < 300;
};

export const isConnectionStable = (status: ConnectionStatus): boolean => {
  return status.isConnected && status.reconnectAttempts === 0;
};

export const getMessageStatus = (
  message: Message,
  connectionStatus: ConnectionStatus
): 'sent' | 'delivered' | 'failed' | 'pending' => {
  if (!connectionStatus.isConnected) return 'pending';
  if (message.isRead) return 'delivered';
  if (!message.id) return 'failed';
  return 'sent';
};

export const formatMessageTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffInHours < 48) {
    return 'Yesterday';
  }
  return messageDate.toLocaleDateString();
};

export const validateMessage = (message: Message): boolean => {
  return (
    !!message.id &&
    !!message.senderId &&
    !!message.receiverId &&
    !!message.content &&
    !!message.timestamp
  );
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};
