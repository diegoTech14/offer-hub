/**
 * Status Analytics Hook
 * TanStack Query hook for managing status analytics and metrics
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  StatusMetrics,
  StatusAnalyticsFilters,
  StatusChange,
  UseStatusAnalyticsReturn,
  StatusExportOptions,
} from '@/types/application-status.types';
import {
  prepareCSVData,
  csvToBlob,
} from '@/utils/status-helpers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ==================== API Functions ====================

async function fetchStatusAnalytics(filters?: StatusAnalyticsFilters): Promise<StatusMetrics> {
  const params = new URLSearchParams();

  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start.toISOString());
    params.append('endDate', filters.dateRange.end.toISOString());
  }
  if (filters?.statuses) {
    params.append('statuses', filters.statuses.join(','));
  }
  if (filters?.clientIds) {
    params.append('clientIds', filters.clientIds.join(','));
  }

  const response = await fetch(`${BASE_URL}/applications/analytics?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }
  return response.json();
}

async function fetchAllStatusChanges(filters?: StatusAnalyticsFilters): Promise<StatusChange[]> {
  const params = new URLSearchParams();

  if (filters?.dateRange) {
    params.append('startDate', filters.dateRange.start.toISOString());
    params.append('endDate', filters.dateRange.end.toISOString());
  }

  const response = await fetch(`${BASE_URL}/applications/status-changes?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch status changes: ${response.statusText}`);
  }
  return response.json();
}

// ==================== Hook Implementation ====================

export function useStatusAnalytics(): UseStatusAnalyticsReturn {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<StatusAnalyticsFilters>({});

  const analyticsQueryKey = useMemo(() => ['analytics', 'status', filters], [filters]);

  // Fetch analytics with caching
  const analyticsQuery = useQuery({
    queryKey: analyticsQueryKey,
    queryFn: () => fetchStatusAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Compute local analytics for immediate feedback when data available
  const localMetrics = useMemo(() => {
    if (!analyticsQuery.data) return null;
    return analyticsQuery.data;
  }, [analyticsQuery.data]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Refresh analytics manually
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: analyticsQueryKey });
  }, [queryClient, analyticsQueryKey]);

  // Export data
  const exportData = useCallback(
    async (options: StatusExportOptions): Promise<Blob> => {
      const changes = await fetchAllStatusChanges(options.filters);

      switch (options.format) {
        case 'json': {
          const data = JSON.stringify(changes, null, 2);
          return new Blob([data], { type: 'application/json' });
        }

        case 'csv': {
          const csvData = prepareCSVData(changes);
          return csvToBlob(csvData);
        }

        case 'pdf': {
          // PDF export would require additional libraries (jsPDF, etc.)
          // For now, export as JSON
          const data = JSON.stringify(changes, null, 2);
          return new Blob([data], { type: 'application/json' });
        }

        case 'xlsx': {
          // XLSX export would require additional libraries (exceljs, xlsx, etc.)
          // For now, export as CSV
          const csvData = prepareCSVData(changes);
          const csv = csvData.map((row) => row.join('\t')).join('\n');
          return new Blob([csv], { type: 'text/tab-separated-values' });
        }

        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    },
    []
  );

  return {
    metrics: localMetrics,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error?.message || null,

    // Filters
    filters,
    setFilters,
    clearFilters,

    // Actions
    refresh,
    exportData,
  };
}
