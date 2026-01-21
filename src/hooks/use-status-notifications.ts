/**
 * Status Notifications Hook
 * TanStack Query hook for managing status notifications
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type {
  StatusNotification,
  NotificationPreferences,
  UseStatusNotificationsReturn,
} from '@/types/application-status.types';
import { useNotificationStore } from '@/stores/use-notification-store';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const REFETCH_INTERVAL = 15000; // 15 seconds for more frequent notification updates

// ==================== API Functions ====================

async function fetchNotifications(pageParam: string | undefined): Promise<{
  notifications: StatusNotification[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const params = new URLSearchParams();
  if (pageParam) params.append('cursor', pageParam);

  const response = await fetch(`${BASE_URL}/notifications?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`);
  }
  return response.json();
}

async function markNotificationAsRead(notificationId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: ${response.statusText}`);
  }
}

async function markAllNotificationsAsRead(): Promise<void> {
  const response = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
  }
}

async function deleteNotification(notificationId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete notification: ${response.statusText}`);
  }
}

async function updateNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  const response = await fetch(`${BASE_URL}/notifications/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });

  if (!response.ok) {
    throw new Error(`Failed to update preferences: ${response.statusText}`);
  }
}

// ==================== Hook Implementation ====================

export function useStatusNotifications(): UseStatusNotificationsReturn {
  const queryClient = useQueryClient();
  const { preferences, setPreferences } = useNotificationStore();

  const notificationsQueryKey = ['notifications'];

  // Infinite query for notifications
  const notificationsQuery = useInfiniteQuery({
    queryKey: notificationsQueryKey,
    queryFn: ({ pageParam }) => fetchNotifications(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 5000, // 5 seconds
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  // Flatten all pages into single array
  const notifications = useMemo(() => {
    return notificationsQuery.data?.pages.flatMap((page) => page.notifications) || [];
  }, [notificationsQuery.data]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Mutation: Mark as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      const previousData = queryClient.getQueryData(notificationsQueryKey);

      // Optimistically mark as read
      queryClient.setQueryData(notificationsQueryKey, (old: unknown) => {
        if (!old) return old;
        const data = old as { pages: { notifications: StatusNotification[] }[] };
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationsQueryKey, context.previousData);
      }
      toast.error('Failed to mark notification as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });

  // Mutation: Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      const previousData = queryClient.getQueryData(notificationsQueryKey);

      // Optimistically mark all as read
      queryClient.setQueryData(notificationsQueryKey, (old: unknown) => {
        if (!old) return old;
        const data = old as { pages: { notifications: StatusNotification[] }[] };
        const now = new Date();
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n: StatusNotification) => ({
              ...n,
              read: true,
              readAt: now,
            })),
          })),
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationsQueryKey, context.previousData);
      }
      toast.error('Failed to mark all notifications as read');
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });

  // Mutation: Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      const previousData = queryClient.getQueryData(notificationsQueryKey);

      // Optimistically remove notification
      queryClient.setQueryData(notificationsQueryKey, (old: unknown) => {
        if (!old) return old;
        const data = old as { pages: { notifications: StatusNotification[] }[] };
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            notifications: page.notifications.filter((n) => n.id !== notificationId),
          })),
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationsQueryKey, context.previousData);
      }
      toast.error('Failed to delete notification');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });

  // Mutation: Update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (_, variables) => {
      setPreferences(variables);
      toast.success('Notification preferences updated');
    },
    onError: () => {
      toast.error('Failed to update preferences');
    },
  });

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage) {
      await notificationsQuery.fetchNextPage();
    }
  }, [notificationsQuery]);

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error?.message || null,

    // Actions
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,

    // Preferences
    preferences,
    updatePreferences: updatePreferencesMutation.mutateAsync,

    // Pagination
    loadMore,
    hasMore: notificationsQuery.hasNextPage || false,
  };
}
