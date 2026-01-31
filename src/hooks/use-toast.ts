'use client';

import { useNotification } from '@/lib/contexts/NotificatonContext';

export interface ToastOptions {
  title?: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface UseToastReturn {
  toast: {
    success: (message: string, options?: Omit<ToastOptions, 'message'>) => void;
    error: (message: string, options?: Omit<ToastOptions, 'message'>) => void;
    warning: (message: string, options?: Omit<ToastOptions, 'message'>) => void;
    info: (message: string, options?: Omit<ToastOptions, 'message'>) => void;
  };
}

/**
 * Simple toast hook that provides easy-to-use toast notifications
 * Uses the existing NotificationContext for consistency
 */
export function useToast(): UseToastReturn {
  const { actions } = useNotification();

  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options: Omit<ToastOptions, 'message'> = {}
  ) => {
    actions.showToast({
      type,
      title: options.title || type.charAt(0).toUpperCase() + type.slice(1),
      message,
      actionUrl: options.actionUrl,
      actionLabel: options.actionLabel,
    });
  };

  return {
    toast: {
      success: (message, options) => showToast('success', message, options),
      error: (message, options) => showToast('error', message, options),
      warning: (message, options) => showToast('warning', message, options),
      info: (message, options) => showToast('info', message, options),
    },
  };
}
