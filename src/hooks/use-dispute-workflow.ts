/**
 * @fileoverview Custom hook for dispute workflow management and state tracking
 * @author Offer Hub Team
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  WorkflowState,
  WorkflowStageName,
  WorkflowProgress,
  WorkflowNotification,
  WorkflowAnalytics,
  UseDisputeWorkflowReturn,
  WorkflowApiRequest,
  WorkflowApiResponse,
  DisputeInitiationData,
  MediatorAssignmentData,
  EvidenceCollectionData,
  MediationData,
  ResolutionData,
  ArbitrationData,
  ResolutionImplementationData
} from '@/types/workflow.types';

// API endpoints
const API_BASE = '/api/workflow';

// Default workflow configuration
const DEFAULT_WORKFLOW_CONFIG = {
  disputeType: 'standard',
  stages: [
    {
      stageName: 'dispute_initiation' as WorkflowStageName,
      duration: 2,
      requirements: ['Valid dispute reason', 'Project identification', 'Initial description'],
      actions: ['Submit dispute form', 'Receive confirmation', 'Await mediator assignment'],
      autoAdvance: false,
    },
    {
      stageName: 'mediator_assignment' as WorkflowStageName,
      duration: 24,
      requirements: ['Automatic mediator assignment', 'Manual assignment by admin', 'Mediator acceptance'],
      actions: ['Mediator receives notification', 'Mediator reviews details', 'Mediator accepts/declines'],
      autoAdvance: false,
      escalationAfter: 24,
    },
    {
      stageName: 'evidence_collection' as WorkflowStageName,
      duration: 72,
      requirements: ['Both parties submit evidence', 'Mediator reviews evidence', 'Evidence validation'],
      actions: ['Upload supporting documents', 'Request additional evidence', 'Review and categorize'],
      autoAdvance: false,
      escalationAfter: 72,
    },
    {
      stageName: 'mediation_process' as WorkflowStageName,
      duration: 168,
      requirements: ['Mediator facilitates communication', 'Settlement negotiation', 'Progress documentation'],
      actions: ['Conduct mediation sessions', 'Negotiate settlement terms', 'Document progress'],
      autoAdvance: false,
      escalationAfter: 168,
    },
    {
      stageName: 'resolution_or_escalation' as WorkflowStageName,
      duration: 24,
      requirements: ['Mediation outcome documentation', 'Escalation decision', 'Resolution implementation'],
      actions: ['Execute settlement agreement', 'Escalate to arbitration', 'Implement resolution'],
      autoAdvance: false,
    },
    {
      stageName: 'arbitration' as WorkflowStageName,
      duration: 336,
      requirements: ['Arbitrator assignment', 'Final evidence review', 'Binding decision'],
      actions: ['Assign arbitrator', 'Review evidence', 'Make final decision'],
      autoAdvance: false,
      escalationAfter: 336,
    },
    {
      stageName: 'resolution_implementation' as WorkflowStageName,
      duration: 48,
      requirements: ['Fund release execution', 'Resolution documentation', 'Final notifications'],
      actions: ['Release funds', 'Distribute according to decision', 'Close dispute'],
      autoAdvance: true,
    },
  ],
  timeouts: {
    dispute_initiation: 2,
    mediator_assignment: 24,
    evidence_collection: 72,
    mediation_process: 168,
    resolution_or_escalation: 24,
    arbitration: 336,
    resolution_implementation: 48,
  },
  escalationRules: [
    {
      fromStage: 'mediator_assignment' as WorkflowStageName,
      toStage: 'evidence_collection' as WorkflowStageName,
      trigger: 'timeout',
    },
    {
      fromStage: 'evidence_collection' as WorkflowStageName,
      toStage: 'mediation_process' as WorkflowStageName,
      trigger: 'timeout',
    },
    {
      fromStage: 'mediation_process' as WorkflowStageName,
      toStage: 'arbitration' as WorkflowStageName,
      trigger: 'condition',
      condition: 'mediation_failed',
    },
    {
      fromStage: 'arbitration' as WorkflowStageName,
      toStage: 'resolution_implementation' as WorkflowStageName,
      trigger: 'timeout',
    },
  ],
  notificationSettings: {
    enabled: true,
    channels: ['in_app', 'email', 'push'],
    timing: {
      immediate: ['stage_transition', 'action_required', 'deadline_alert'],
      daily: ['evidence_request', 'mediator_assignment'],
      weekly: ['resolution_update'],
    },
  },
};

// API functions
const fetchWorkflowState = async (disputeId: string): Promise<WorkflowState> => {
  const response = await fetch(`${API_BASE}/disputes/${disputeId}/workflow`);
  if (!response.ok) {
    throw new Error(`Failed to fetch workflow state: ${response.statusText}`);
  }
  const result: WorkflowApiResponse<WorkflowState> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch workflow state');
  }
  return result.data!;
};

const transitionStage = async (
  disputeId: string,
  stage: WorkflowStageName,
  data?: Record<string, any>
): Promise<WorkflowState> => {
  const request: WorkflowApiRequest = {
    disputeId,
    action: 'transition_stage',
    data: { stage, ...data },
  };

  const response = await fetch(`${API_BASE}/disputes/${disputeId}/stages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to transition stage: ${response.statusText}`);
  }

  const result: WorkflowApiResponse<WorkflowState> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to transition stage');
  }
  return result.data!;
};

const updateProgress = async (
  disputeId: string,
  progress: Partial<WorkflowProgress>
): Promise<WorkflowProgress> => {
  const response = await fetch(`${API_BASE}/disputes/${disputeId}/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(progress),
  });

  if (!response.ok) {
    throw new Error(`Failed to update progress: ${response.statusText}`);
  }

  const result: WorkflowApiResponse<WorkflowProgress> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to update progress');
  }
  return result.data!;
};

const sendNotification = async (
  disputeId: string,
  notification: Omit<WorkflowNotification, 'id' | 'sentAt'>
): Promise<WorkflowNotification> => {
  const response = await fetch(`${API_BASE}/disputes/${disputeId}/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notification),
  });

  if (!response.ok) {
    throw new Error(`Failed to send notification: ${response.statusText}`);
  }

  const result: WorkflowApiResponse<WorkflowNotification> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to send notification');
  }
  return result.data!;
};

const fetchAnalytics = async (disputeId?: string): Promise<WorkflowAnalytics> => {
  const url = disputeId 
    ? `${API_BASE}/analytics/workflow?disputeId=${disputeId}`
    : `${API_BASE}/analytics/workflow`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  const result: WorkflowApiResponse<WorkflowAnalytics> = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch analytics');
  }
  return result.data!;
};

// Custom hook
export const useDisputeWorkflow = (disputeId: string): UseDisputeWorkflowReturn => {
  const [error, setError] = useState<string | null>(null);

  // Fetch workflow state
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadWorkflowState = async () => {
      if (!disputeId) return;
      
      try {
        setIsLoading(true);
        const state = await fetchWorkflowState(disputeId);
        setWorkflowState(state);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow state');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWorkflowState();
    
    // Set up polling every 30 seconds
    const interval = setInterval(loadWorkflowState, 30000);
    return () => clearInterval(interval);
  }, [disputeId]);

  // Actions
  const transitionStageAction = useCallback(async (stage: WorkflowStageName, data?: Record<string, any>) => {
    try {
      const newState = await transitionStage(disputeId, stage, data);
      setWorkflowState(newState);
      toast.success(`Successfully transitioned to ${stage}`);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transition stage';
      setError(errorMessage);
      toast.error(`Failed to transition stage: ${errorMessage}`);
    }
  }, [disputeId]);

  const updateProgressAction = useCallback(async (progress: Partial<WorkflowProgress>) => {
    try {
      await updateProgress(disputeId, progress);
      // Reload workflow state to get updated progress
      const newState = await fetchWorkflowState(disputeId);
      setWorkflowState(newState);
      toast.success('Progress updated successfully');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update progress';
      setError(errorMessage);
      toast.error(`Failed to update progress: ${errorMessage}`);
    }
  }, [disputeId]);

  const sendNotificationAction = useCallback(async (notification: Omit<WorkflowNotification, 'id' | 'sentAt'>) => {
    try {
      await sendNotification(disputeId, notification);
      toast.success('Notification sent successfully');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send notification';
      setError(errorMessage);
      toast.error(`Failed to send notification: ${errorMessage}`);
    }
  }, [disputeId]);

  const fetchAnalyticsAction = useCallback(async () => {
    try {
      const analytics = await fetchAnalytics(disputeId);
      setError(null);
      return analytics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
      setError(errorMessage);
      toast.error(`Failed to fetch analytics: ${errorMessage}`);
      throw error;
    }
  }, [disputeId]);

  // Computed values
  const currentStage = workflowState?.currentStage || null;
  const progressPercentage = workflowState?.progress 
    ? workflowState.progress.reduce(
        (acc, p) => acc + p.progressPercentage,
        0
      ) / workflowState.progress.length
    : 0;

  const nextDeadline = workflowState?.progress
    ? workflowState.progress
        .filter(p => !p.notes?.includes('completed'))
        .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())[0]
        ?.updatedAt
    : undefined;

  const canAdvanceStage = useCallback(() => {
    if (!workflowState || !currentStage) return false;
    
    const currentStageConfig = DEFAULT_WORKFLOW_CONFIG.stages.find(
      s => s.stageName === currentStage
    );
    
    if (!currentStageConfig) return false;
    
    // Check if current stage is completed
    const currentStageProgress = workflowState.progress.find(
      p => p.stageId === currentStage
    );
    
    return currentStageProgress?.progressPercentage === 100;
  }, [workflowState, currentStage]);

  // Action handlers
  const handleTransitionStage = useCallback(
    async (stage: WorkflowStageName, data?: Record<string, any>) => {
      await transitionStageAction(stage, data);
    },
    [transitionStageAction]
  );

  const handleUpdateProgress = useCallback(
    async (progress: Partial<WorkflowProgress>) => {
      await updateProgressAction(progress);
    },
    [updateProgressAction]
  );

  const handleSendNotification = useCallback(
    async (notification: Omit<WorkflowNotification, 'id' | 'sentAt'>) => {
      await sendNotificationAction(notification);
    },
    [sendNotificationAction]
  );

  const handleGetAnalytics = useCallback(async () => {
    try {
      const analytics = await fetchAnalyticsAction();
      return analytics;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }, [fetchAnalyticsAction]);

  // Initialize workflow if it doesn't exist
  useEffect(() => {
    if (disputeId && !workflowState && !isLoading && !error) {
      // Initialize workflow with default configuration
      const initWorkflow = async () => {
        try {
          await transitionStage(disputeId, 'dispute_initiation');
          // Reload workflow state
          const newState = await fetchWorkflowState(disputeId);
          setWorkflowState(newState);
        } catch (error) {
          console.error('Failed to initialize workflow:', error);
        }
      };
      initWorkflow();
    }
  }, [disputeId, workflowState, isLoading, error]);

  // Error handling

  return {
    workflowState: workflowState || null,
    isLoading,
    error,
    currentStage,
    progressPercentage: Math.round(progressPercentage),
    nextDeadline,
    canAdvanceStage: canAdvanceStage(),
    actions: {
      transitionStage: handleTransitionStage,
      updateProgress: handleUpdateProgress,
      sendNotification: handleSendNotification,
      getAnalytics: handleGetAnalytics,
    },
  };
};

// Stage-specific data handlers
export const useDisputeInitiation = (disputeId: string) => {
  const { actions } = useDisputeWorkflow(disputeId);

  const initiateDispute = async (data: DisputeInitiationData) => {
    // Call transitionStage directly with proper typing
    await (actions.transitionStage as any)('dispute_initiation', data);
  };

  return { initiateDispute };
};

export const useMediatorAssignment = (disputeId: string) => {
  const { actions } = useDisputeWorkflow(disputeId);

  const assignMediator = useCallback(
    async (data: MediatorAssignmentData) => {
      await (actions.transitionStage as any)('mediator_assignment', data);
    },
    [actions]
  );

  return { assignMediator };
};

export const useEvidenceCollection = (disputeId: string) => {
  const { actions } = useDisputeWorkflow(disputeId);

  const collectEvidence = useCallback(
    async (data: EvidenceCollectionData) => {
      await (actions.transitionStage as any)('evidence_collection', data);
    },
    [actions]
  );

  return { collectEvidence };
};

export const useMediationProcess = (disputeId: string) => {
  const { actions } = useDisputeWorkflow(disputeId);

  const conductMediation = useCallback(
    async (data: MediationData) => {
      await (actions.transitionStage as any)('mediation_process', data);
    },
    [actions]
  );

  return { conductMediation };
};

export const useResolution = (disputeId: string) => {
  const { actions } = useDisputeWorkflow(disputeId);

  const resolveDispute = useCallback(
    async (data: ResolutionData) => {
      await (actions.transitionStage as any)('resolution_or_escalation', data);
    },
    [actions]
  );

  return { resolveDispute };
};

export const useArbitration = (disputeId: string) => {
  const { actions } = useDisputeWorkflow(disputeId);

  const conductArbitration = useCallback(
    async (data: ArbitrationData) => {
      await (actions.transitionStage as any)('arbitration', data);
    },
    [actions]
  );

  return { conductArbitration };
};

export const useResolutionImplementation = (disputeId: string) => {
  const { actions } = useDisputeWorkflow(disputeId);

  const implementResolution = useCallback(
    async (data: ResolutionImplementationData) => {
      await (actions.transitionStage as any)('resolution_implementation', data);
    },
    [actions]
  );

  return { implementResolution };
};
