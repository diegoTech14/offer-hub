/**
 * Application Status Hook
 * TanStack Query hook for managing application status with optimistic updates
 */

'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ApplicationStatus,
  StatusChange,
  TimelineDataPoint,
  UpdateStatusRequest,
  AddClientFeedbackRequest,
  ClientFeedback,
  UseApplicationStatusReturn,
  StatusHistoryFilters,
  StatusHistoryResponse,
} from '@/types/application-status.types';
import { convertToTimelineData, validateStatusChange } from '@/utils/status-helpers';
import { useStatusFilterStore } from '@/stores/use-status-filter-store';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const REFETCH_INTERVAL = 30000; // 30 seconds

// ==================== API Functions ====================

async function fetchStatusData(applicationId: string): Promise<{
  currentStatus: ApplicationStatus;
  changes: StatusChange[];
  feedback: ClientFeedback[];
}> {
  const response = await fetch(`${BASE_URL}/applications/${applicationId}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch status data: ${response.statusText}`);
  }
  return response.json();
}

async function fetchStatusHistory(
  applicationId: string,
  cursor?: string,
  filters?: StatusHistoryFilters
): Promise<StatusHistoryResponse> {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  if (filters?.statuses) params.append('statuses', filters.statuses.join(','));
  if (filters?.searchQuery) params.append('q', filters.searchQuery);

  const response = await fetch(`${BASE_URL}/applications/${applicationId}/status/history?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch status history: ${response.statusText}`);
  }
  return response.json();
}

async function updateApplicationStatus(request: UpdateStatusRequest): Promise<StatusChange> {
  const response = await fetch(`${BASE_URL}/applications/${request.applicationId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to update status: ${response.statusText}`);
  }
  return response.json();
}

async function addClientFeedback(request: AddClientFeedbackRequest): Promise<ClientFeedback> {
  const response = await fetch(`${BASE_URL}/applications/${request.applicationId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to add feedback: ${response.statusText}`);
  }
  return response.json();
}

// ==================== Hook Implementation ====================

export function useApplicationStatus(
  applicationId: string,
  userRole?: 'client' | 'freelancer' | 'admin'
): UseApplicationStatusReturn {
  const queryClient = useQueryClient();
  const { filters, setFilters, clearFilters } = useStatusFilterStore();
  const cursorRef = useRef<string | undefined>(undefined);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  // Query keys
  const statusQueryKey = ['applications', applicationId, 'status'];
  const historyQueryKey = ['applications', applicationId, 'history', filters];

  // Fetch current status and recent changes
  const statusQuery = useQuery({
    queryKey: statusQueryKey,
    queryFn: () => fetchStatusData(applicationId),
    staleTime: 10000, // 10 seconds
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });

  // Fetch status history with filters
  const historyQuery = useQuery({
    queryKey: historyQueryKey,
    queryFn: () => fetchStatusHistory(applicationId, undefined, filters),
    staleTime: 30000, // 30 seconds
    enabled: !!applicationId,
  });

  // Create feedback map for timeline
  const feedbackMap = useMemo(() => {
    if (!statusQuery.data?.feedback) return new Map();
    const map = new Map<string, ClientFeedback>();
    for (const feedback of statusQuery.data.feedback) {
      map.set(feedback.statusChangeId, feedback);
    }
    return map;
  }, [statusQuery.data?.feedback]);

  // Convert status changes to timeline data
  const timeline = useMemo(() => {
    if (!statusQuery.data) return [];
    return convertToTimelineData(
      statusQuery.data.changes,
      statusQuery.data.currentStatus,
      feedbackMap
    );
  }, [statusQuery.data, feedbackMap]);

  // Mutation: Update status with optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: updateApplicationStatus,
    onMutate: async (request: UpdateStatusRequest) => {
      // Validate transition
      const currentStatus = statusQuery.data?.currentStatus;
      if (currentStatus) {
        const validation = validateStatusChange(currentStatus, request.toStatus, userRole);
        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: statusQueryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(statusQueryKey);

      // Optimistically update to new value
      if (currentStatus) {
        const optimisticChange: StatusChange = {
          id: `temp-${Date.now()}`,
          applicationId: request.applicationId,
          fromStatus: currentStatus,
          toStatus: request.toStatus,
          changedBy: 'current-user', // Would come from auth context
          changedAt: new Date(),
          reason: request.reason,
          comments: request.comments,
          metadata: request.metadata,
          isAutomated: false,
        };

        queryClient.setQueryData(statusQueryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            currentStatus: request.toStatus,
            changes: [...old.changes, optimisticChange],
          };
        });
      }

      // Return context with snapshotted value
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value
      if (context?.previousData) {
        queryClient.setQueryData(statusQueryKey, context.previousData);
      }
      toast.error(`Failed to update status: ${error.message}`);
    },
    onSuccess: (data, variables) => {
      toast.success(`Status updated to ${data.toStatus}`);

      // Broadcast to other tabs
      syncChannelRef.current?.postMessage({
        type: 'status-update',
        payload: { applicationId, statusChange: data },
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: statusQueryKey });
      queryClient.invalidateQueries({ queryKey: ['applications', applicationId, 'history'] });
    },
  });

  // Mutation: Add client feedback
  const addFeedbackMutation = useMutation({
    mutationFn: addClientFeedback,
    onMutate: async (request: AddClientFeedbackRequest) => {
      await queryClient.cancelQueries({ queryKey: statusQueryKey });
      const previousData = queryClient.getQueryData(statusQueryKey);

      // Optimistically add feedback
      const optimisticFeedback: ClientFeedback = {
        id: `temp-${Date.now()}`,
        statusChangeId: request.statusChangeId,
        applicationId: request.applicationId,
        message: request.message,
        attachments: request.attachments,
        requestedAction: request.requestedAction,
        actionRequired: request.actionRequired,
        dueDate: request.dueDate,
        createdAt: new Date(),
        createdBy: 'current-user',
        read: false,
      };

      queryClient.setQueryData(statusQueryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          feedback: [...(old.feedback || []), optimisticFeedback],
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(statusQueryKey, context.previousData);
      }
      toast.error(`Failed to add feedback: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Feedback added successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statusQueryKey });
    },
  });

  // Load more history (pagination)
  const loadMoreHistory = useCallback(async () => {
    if (!historyQuery.data?.hasMore) return;

    cursorRef.current = historyQuery.data.cursor;
    const moreData = await fetchStatusHistory(applicationId, cursorRef.current, filters);

    queryClient.setQueryData(historyQueryKey, (old: any) => {
      if (!old) return moreData;
      return {
        ...moreData,
        changes: [...old.changes, ...moreData.changes],
      };
    });
  }, [applicationId, filters, historyQuery.data, queryClient, historyQueryKey]);

  // Refresh status manually
  const refreshStatus = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: statusQueryKey });
    await queryClient.invalidateQueries({ queryKey: historyQueryKey });
  }, [queryClient, statusQueryKey, historyQueryKey]);

  // Setup cross-tab sync
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window && !syncChannelRef.current) {
    const channel = new BroadcastChannel(`application-status-${applicationId}`);
    syncChannelRef.current = channel;

    channel.onmessage = (event) => {
      const { type } = event.data || {};
      if (type === 'status-update') {
        queryClient.invalidateQueries({ queryKey: statusQueryKey });
      }
    };
  }

  return {
    // Current state
    currentStatus: statusQuery.data?.currentStatus || null,
    statusHistory: historyQuery.data?.changes || [],
    timeline,
    isLoading: statusQuery.isLoading || historyQuery.isLoading,
    error: statusQuery.error?.message || historyQuery.error?.message || null,

    // Actions
    updateStatus: updateStatusMutation.mutateAsync,
    addFeedback: addFeedbackMutation.mutateAsync,
    refreshStatus,

    // Pagination
    loadMoreHistory,
    hasMoreHistory: historyQuery.data?.hasMore || false,

    // Filters
    filters,
    setFilters,
    clearFilters,
  };
}
