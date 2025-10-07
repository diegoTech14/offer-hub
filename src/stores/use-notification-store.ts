/**
 * Notification Store
 * Zustand store for managing notification UI state and preferences
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  NotificationStore,
  StatusNotification,
  NotificationPreferences,
} from '@/types/application-status.types';

const defaultPreferences: NotificationPreferences = {
  email: true,
  push: false,
  inApp: true,
  types: {
    STATUS_CHANGED: true,
    CLIENT_FEEDBACK: true,
    DEADLINE_APPROACHING: true,
    INTERVIEW_SCHEDULED: true,
    DECISION_MADE: true,
    ACTION_REQUIRED: true,
  },
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      selectedNotification: null,
      preferences: defaultPreferences,

      setIsOpen: (open: boolean) => {
        set({ isOpen: open });
      },

      setSelectedNotification: (notification: StatusNotification | null) => {
        set({ selectedNotification: notification });
      },

      setPreferences: (prefs: Partial<NotificationPreferences>) => {
        set({
          preferences: {
            ...get().preferences,
            ...prefs,
          },
        });
      },
    }),
    {
      name: 'notification-preferences-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
