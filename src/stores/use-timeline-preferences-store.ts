/**
 * Timeline Preferences Store
 * Zustand store for managing timeline view preferences with persistence
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  TimelinePreferencesStore,
  TimelinePreferences,
} from '@/types/application-status.types';

const defaultPreferences: TimelinePreferences = {
  layout: 'horizontal',
  zoom: 1.0,
  showDurations: true,
  showFeedback: true,
  groupByDate: false,
  colorScheme: 'default',
};

export const useTimelinePreferencesStore = create<TimelinePreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,

      setPreferences: (prefs: Partial<TimelinePreferences>) => {
        set({
          preferences: {
            ...get().preferences,
            ...prefs,
          },
        });
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },
    }),
    {
      name: 'timeline-preferences-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
