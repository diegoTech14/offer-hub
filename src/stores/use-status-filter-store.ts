/**
 * Status Filter Store
 * Zustand store for managing status history filters with persistence
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  StatusFilterStore,
  StatusHistoryFilters,
  ApplicationStatus,
} from '@/types/application-status.types';

const defaultFilters: StatusHistoryFilters = {
  statuses: undefined,
  dateRange: undefined,
  changedBy: undefined,
  reasons: undefined,
  hasComments: undefined,
  hasFeedback: undefined,
  searchQuery: undefined,
};

export const useStatusFilterStore = create<StatusFilterStore>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,

      setFilters: (filters: StatusHistoryFilters) => {
        set({ filters });
      },

      clearFilters: () => {
        set({ filters: defaultFilters });
      },

      addStatusFilter: (status: ApplicationStatus) => {
        const currentStatuses = get().filters.statuses || [];
        if (!currentStatuses.includes(status)) {
          set({
            filters: {
              ...get().filters,
              statuses: [...currentStatuses, status],
            },
          });
        }
      },

      removeStatusFilter: (status: ApplicationStatus) => {
        const currentStatuses = get().filters.statuses || [];
        set({
          filters: {
            ...get().filters,
            statuses: currentStatuses.filter((s) => s !== status),
          },
        });
      },
    }),
    {
      name: 'status-filter-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
