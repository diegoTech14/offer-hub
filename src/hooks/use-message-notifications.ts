import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '@/lib/contexts/NotificatonContext';
import { notificationService } from '@/services/notification-service';
import {
  MessageNotification,
  NotificationPreferences,
  NotificationTemplate,
  NotificationAnalytics,
  NotificationSearchParams,
  PaginatedNotifications,
  PushNotificationPayload,
  NotificationChannelType,
  NotificationFilters,
} from '@/types/message-notifications.types';

interface UseMessageNotificationsOptions {
  userId: string;
  autoConnect?: boolean;
  enableRealtime?: boolean;
  pollInterval?: number;
}

interface UseMessageNotificationsReturn {
  // State
  notifications: MessageNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;
  analytics: NotificationAnalytics | null;
  
  // Pagination
  pagination: PaginatedNotifications['pagination'] | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Actions
  loadNotifications: (params?: NotificationSearchParams) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  sendNotification: (notification: Omit<MessageNotification, 'id' | 'timestamp' | 'channels'>) => Promise<void>;
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  loadPreferences: () => Promise<void>;
  
  // Push notifications
  subscribeToPush: (subscription: any) => Promise<void>;
  unsubscribeFromPush: (endpoint: string) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  
  // Analytics
  loadAnalytics: (dateRange?: { start: string; end: string }) => Promise<void>;
  
  // Real-time
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  
  // Filters and search
  filters: NotificationFilters;
  setFilters: (filters: NotificationFilters) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Utility
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useMessageNotifications({
  userId,
  autoConnect = true,
  enableRealtime = true,
  pollInterval = 30000, // 30 seconds
}: UseMessageNotificationsOptions): UseMessageNotificationsReturn {
  // Core state
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginatedNotifications['pagination'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // Real-time state
  const [isConnected, setIsConnected] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  
  // Filter and search state
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { actions: notificationActions } = useNotification();

  // Load notifications
  const loadNotifications = useCallback(async (params: NotificationSearchParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const searchParams: NotificationSearchParams = {
        page: params.page || 1,
        limit: params.limit || pageSize,
        filters: { ...filters, ...params.filters },
        query: searchQuery || params.query,
        sortBy: params.sortBy || 'timestamp',
        sortOrder: params.sortOrder || 'desc',
        ...params,
      };

      const response = await notificationService.getNotifications(searchParams);
      
      if (response.success) {
        const { notifications: newNotifications, pagination: newPagination } = response.data;
        
        if (searchParams.page === 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setPagination(newPagination);
        setCurrentPage(searchParams.page || 1);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
      } else {
        setError(response.message || 'Failed to load notifications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery, pageSize]);

  // Load more notifications (pagination)
  const loadMoreNotifications = useCallback(async () => {
    if (!pagination?.hasNext || isLoading) return;
    
    await loadNotifications({ page: currentPage + 1 });
  }, [pagination?.hasNext, isLoading, currentPage, loadNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.markNotificationAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setError(response.message || 'Failed to mark notification as read');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(errorMessage);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllNotificationsAsRead(userId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      } else {
        setError(response.message || 'Failed to mark all notifications as read');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      setError(errorMessage);
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      
      if (response.success) {
        setNotifications(prev => {
          const notification = prev.find(n => n.id === notificationId);
          const newNotifications = prev.filter(n => n.id !== notificationId);
          
          // Update unread count if the deleted notification was unread
          if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          
          return newNotifications;
        });
      } else {
        setError(response.message || 'Failed to delete notification');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
    }
  }, []);

  // Send notification
  const sendNotification = useCallback(async (
    notification: Omit<MessageNotification, 'id' | 'timestamp' | 'channels'>
  ) => {
    try {
      const response = await notificationService.sendSmartNotification(
        userId,
        notification,
        preferences || undefined
      );
      
      if (response.success) {
        // Add to local state
        setNotifications(prev => [response.data, ...prev]);
        
        // Show toast notification
        notificationActions.showToast({
          type: 'success',
          title: 'Notification Sent',
          message: 'Your notification has been sent successfully',
        });
      } else {
        setError(response.message || 'Failed to send notification');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      notificationActions.showToast({
        type: 'error',
        title: 'Send Failed',
        message: errorMessage,
      });
    }
  }, [userId, preferences, notificationActions]);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    try {
      const response = await notificationService.getUserPreferences(userId);
      
      if (response.success) {
        setPreferences(response.data);
      } else {
        console.error('Failed to load preferences:', response.message);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  }, [userId]);

  // Update user preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await notificationService.updateUserPreferences(userId, newPreferences);
      
      if (response.success) {
        setPreferences(response.data);
        
        notificationActions.showToast({
          type: 'success',
          title: 'Preferences Updated',
          message: 'Your notification preferences have been updated',
        });
      } else {
        setError(response.message || 'Failed to update preferences');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
    }
  }, [userId, notificationActions]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (subscription: any) => {
    try {
      const response = await notificationService.subscribeToPush(userId, subscription);
      
      if (response.success) {
        notificationActions.showToast({
          type: 'success',
          title: 'Push Notifications Enabled',
          message: 'You will now receive push notifications',
        });
      } else {
        setError(response.message || 'Failed to subscribe to push notifications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to push notifications';
      setError(errorMessage);
    }
  }, [userId, notificationActions]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (endpoint: string) => {
    try {
      const response = await notificationService.unsubscribeFromPush(userId, endpoint);
      
      if (response.success) {
        notificationActions.showToast({
          type: 'success',
          title: 'Push Notifications Disabled',
          message: 'You will no longer receive push notifications',
        });
      } else {
        setError(response.message || 'Failed to unsubscribe from push notifications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe from push notifications';
      setError(errorMessage);
    }
  }, [userId, notificationActions]);

  // Load analytics
  const loadAnalytics = useCallback(async (dateRange?: { start: string; end: string }) => {
    try {
      const response = await notificationService.getNotificationAnalytics(userId, dateRange);
      
      if (response.success) {
        setAnalytics(response.data);
      } else {
        console.error('Failed to load analytics:', response.message);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }, [userId]);

  // Real-time connection
  const connect = useCallback(() => {
    if (!enableRealtime || isConnected || !userId) return;

    try {
      const ws = notificationService.connectToRealtime(userId);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_notification') {
            setNotifications(prev => [data.data, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new notification
            notificationActions.showToast({
              type: 'info',
              title: data.data.title,
              message: data.data.message,
              actionUrl: data.data.actionUrl,
              actionLabel: data.data.actionLabel,
            });
          } else if (data.type === 'notification_read') {
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === data.data.id 
                  ? { ...notification, read: true }
                  : notification
              )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setWsConnection(null);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (enableRealtime) {
            connect();
          }
        }, 5000);
      };
      
      setWsConnection(ws);
      setIsConnected(true);
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
    }
  }, [enableRealtime, isConnected, userId, notificationActions]);

  const disconnect = useCallback(() => {
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
      setIsConnected(false);
    }
  }, [wsConnection]);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([
      loadNotifications(),
      loadPreferences(),
      loadAnalytics(),
    ]);
  }, [loadNotifications, loadPreferences, loadAnalytics]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effects
  useEffect(() => {
    if (autoConnect) {
      loadNotifications();
      loadPreferences();
    }
  }, [autoConnect, loadNotifications, loadPreferences]);

  useEffect(() => {
    if (enableRealtime && userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enableRealtime, userId, connect, disconnect]);

  useEffect(() => {
    if (pollInterval > 0 && !isConnected) {
      pollIntervalRef.current = setInterval(() => {
        loadNotifications();
      }, pollInterval);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollInterval, isConnected, loadNotifications]);

  useEffect(() => {
    // Reload notifications when filters or search query changes
    if (autoConnect) {
      loadNotifications();
    }
  }, [filters, searchQuery, autoConnect, loadNotifications]);

  // Computed values
  const hasNextPage = pagination?.hasNext || false;
  const hasPrevPage = pagination?.hasPrev || false;

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    analytics,
    
    // Pagination
    pagination,
    hasNextPage,
    hasPrevPage,
    
    // Actions
    loadNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    
    // Preferences
    updatePreferences,
    loadPreferences,
    
    // Push notifications
    subscribeToPush,
    unsubscribeFromPush,
    requestNotificationPermission,
    
    // Analytics
    loadAnalytics,
    
    // Real-time
    isConnected,
    connect,
    disconnect,
    
    // Filters and search
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    
    // Utility
    refresh,
    clearError,
  };
}

// Hook for managing push notification subscription
export function usePushNotificationSubscription(userId: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    return newPermission === 'granted';
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    setSubscription(pushSubscription);
    return pushSubscription;
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    await subscription.unsubscribe();
    setSubscription(null);
  }, [subscription]);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

export default useMessageNotifications;
