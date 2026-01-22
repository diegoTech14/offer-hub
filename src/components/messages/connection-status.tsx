import React from 'react';
import { ConnectionStatus } from '../../types/real-time-messaging.types';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({
  status,
  className = ''
}) => {
  const getStatusColor = () => {
    if (!status.isConnected) return 'bg-red-500';
    if (status.latency > 300) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!status.isConnected) {
      return `Disconnected (Attempt ${status.reconnectAttempts})`;
    }
    if (status.latency > 300) {
      return `Slow Connection (${status.latency}ms)`;
    }
    return `Connected (${status.latency}ms)`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {getStatusText()}
      </span>
    </div>
  );
};
