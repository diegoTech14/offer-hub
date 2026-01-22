import { useState, useCallback, useEffect } from 'react';
import {
  EscrowContract,
  EscrowCreationRequest,
  EscrowUpdateResponse,
  ReleaseFundsPayload,
  StartDisputePayload,
  DisputeResponse,
  EscrowAnalytics,
  EscrowFundManagement,
  EscrowSecurityValidation,
  EscrowWorkflow,
  EscrowNotification,
  EscrowType,
  EscrowStatus,
  Milestone,
  AutoReleaseSettings,
  SecuritySettings,
  ComplianceSettings,
  TransactionResponse,
} from '@/types/escrow.types';

interface UseEscrowManagementReturn {
  // State
  escrows: EscrowContract[];
  currentEscrow: EscrowContract | null;
  analytics: EscrowAnalytics | null;
  fundManagement: EscrowFundManagement | null;
  securityValidation: EscrowSecurityValidation | null;
  workflows: EscrowWorkflow[];
  notifications: EscrowNotification[];
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  releasing: boolean;
  disputing: boolean;
  validating: boolean;
  
  // Error states
  error: string | null;
  creationError: string | null;
  updateError: string | null;
  releaseError: string | null;
  disputeError: string | null;
  validationError: string | null;
  
  // Actions
  createEscrow: (request: EscrowCreationRequest) => Promise<EscrowContract>;
  updateEscrow: (contractId: string, updates: Partial<EscrowContract>) => Promise<EscrowUpdateResponse>;
  releaseFunds: (payload: ReleaseFundsPayload) => Promise<TransactionResponse>;
  startDispute: (payload: StartDisputePayload) => Promise<DisputeResponse>;
  getEscrow: (contractId: string) => Promise<EscrowContract>;
  getEscrowAnalytics: (period?: { start: string; end: string }) => Promise<EscrowAnalytics>;
  getFundManagement: (contractId: string) => Promise<EscrowFundManagement>;
  validateSecurity: (contractId: string) => Promise<EscrowSecurityValidation>;
  getWorkflows: (type?: EscrowType) => Promise<EscrowWorkflow[]>;
  getNotifications: (contractId?: string) => Promise<EscrowNotification[]>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  executeWorkflow: (workflowId: string, contractId: string, parameters: Record<string, unknown>) => Promise<TransactionResponse>;
  
  // Utility functions
  calculateEscrowFees: (amount: number, type: EscrowType) => number;
  validateEscrowCreation: (request: EscrowCreationRequest) => string[];
  getEscrowStatus: (contractId: string) => EscrowStatus | null;
  getMilestoneProgress: (contractId: string) => { completed: number; total: number; percentage: number };
  canReleaseFunds: (contractId: string, milestoneId?: string) => boolean;
  canStartDispute: (contractId: string) => boolean;
  getAutoReleaseStatus: (contractId: string) => AutoReleaseSettings | null;
  
  // Real-time updates
  subscribeToEscrowUpdates: (contractId: string) => void;
  unsubscribeFromEscrowUpdates: (contractId: string) => void;
  refreshEscrow: (contractId: string) => Promise<void>;
}

export const useEscrowManagement = (): UseEscrowManagementReturn => {
  // State management
  const [escrows, setEscrows] = useState<EscrowContract[]>([]);
  const [currentEscrow, setCurrentEscrow] = useState<EscrowContract | null>(null);
  const [analytics, setAnalytics] = useState<EscrowAnalytics | null>(null);
  const [fundManagement, setFundManagement] = useState<EscrowFundManagement | null>(null);
  const [securityValidation, setSecurityValidation] = useState<EscrowSecurityValidation | null>(null);
  const [workflows, setWorkflows] = useState<EscrowWorkflow[]>([]);
  const [notifications, setNotifications] = useState<EscrowNotification[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [validating, setValidating] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // WebSocket connections for real-time updates
  const [wsConnections, setWsConnections] = useState<Map<string, WebSocket>>(new Map());

  // Create escrow contract
  const createEscrow = useCallback(async (request: EscrowCreationRequest): Promise<EscrowContract> => {
    setCreating(true);
    setCreationError(null);
    
    try {
      // Validate the request
      const validationErrors = validateEscrowCreation(request);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      // Calculate fees
      const fees = calculateEscrowFees(request.amount, request.escrowType);
      
      // Create the escrow contract
      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          fees,
          createdAt: new Date().toISOString(),
          status: 'pending' as EscrowStatus,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create escrow');
      }
      
      const newEscrow: EscrowContract = await response.json();
      
      // Update local state
      setEscrows(prev => [...prev, newEscrow]);
      setCurrentEscrow(newEscrow);
      
      return newEscrow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create escrow';
      setCreationError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setCreating(false);
    }
  }, []);

  // Update escrow contract
  const updateEscrow = useCallback(async (contractId: string, updates: Partial<EscrowContract>): Promise<EscrowUpdateResponse> => {
    setUpdating(true);
    setUpdateError(null);
    
    try {
      const response = await fetch(`/api/escrow/${contractId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update escrow');
      }
      
      const updateResponse: EscrowUpdateResponse = await response.json();
      
      // Update local state
      setEscrows(prev => prev.map(escrow => 
        escrow.id === contractId 
          ? { ...escrow, ...updates, updatedAt: new Date().toISOString() }
          : escrow
      ));
      
      if (currentEscrow?.id === contractId) {
        setCurrentEscrow(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
      }
      
      return updateResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update escrow';
      setUpdateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [currentEscrow]);

  // Release funds from escrow
  const releaseFunds = useCallback(async (payload: ReleaseFundsPayload): Promise<TransactionResponse> => {
    setReleasing(true);
    setReleaseError(null);
    
    try {
      const response = await fetch('/api/escrow/release-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to release funds');
      }
      
      const transactionResponse: TransactionResponse = await response.json();
      
      // Refresh escrow data
      await refreshEscrow(payload.contractId);
      
      return transactionResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to release funds';
      setReleaseError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setReleasing(false);
    }
  }, []);

  // Start dispute
  const startDispute = useCallback(async (payload: StartDisputePayload): Promise<DisputeResponse> => {
    setDisputing(true);
    setDisputeError(null);
    
    try {
      const response = await fetch('/api/escrow/start-dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start dispute');
      }
      
      const disputeResponse: DisputeResponse = await response.json();
      
      // Update escrow status
      await updateEscrow(payload.contractId, { status: 'disputed' });
      
      return disputeResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start dispute';
      setDisputeError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setDisputing(false);
    }
  }, [updateEscrow]);

  // Get escrow by ID
  const getEscrow = useCallback(async (contractId: string): Promise<EscrowContract> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/escrow/${contractId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch escrow');
      }
      
      const escrow: EscrowContract = await response.json();
      setCurrentEscrow(escrow);
      
      return escrow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch escrow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get escrow analytics
  const getEscrowAnalytics = useCallback(async (period?: { start: string; end: string }): Promise<EscrowAnalytics> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (period) {
        params.append('start', period.start);
        params.append('end', period.end);
      }
      
      const response = await fetch(`/api/escrow/analytics?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch analytics');
      }
      
      const analyticsData: EscrowAnalytics = await response.json();
      setAnalytics(analyticsData);
      
      return analyticsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get fund management data
  const getFundManagement = useCallback(async (contractId: string): Promise<EscrowFundManagement> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/escrow/${contractId}/funds`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch fund management data');
      }
      
      const fundData: EscrowFundManagement = await response.json();
      setFundManagement(fundData);
      
      return fundData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch fund management data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate security
  const validateSecurity = useCallback(async (contractId: string): Promise<EscrowSecurityValidation> => {
    setValidating(true);
    setValidationError(null);
    
    try {
      const response = await fetch(`/api/escrow/${contractId}/validate-security`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate security');
      }
      
      const validationData: EscrowSecurityValidation = await response.json();
      setSecurityValidation(validationData);
      
      return validationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate security';
      setValidationError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setValidating(false);
    }
  }, []);

  // Get workflows
  const getWorkflows = useCallback(async (type?: EscrowType): Promise<EscrowWorkflow[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (type) {
        params.append('type', type);
      }
      
      const response = await fetch(`/api/escrow/workflows?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch workflows');
      }
      
      const workflowsData: EscrowWorkflow[] = await response.json();
      setWorkflows(workflowsData);
      
      return workflowsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workflows';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get notifications
  const getNotifications = useCallback(async (contractId?: string): Promise<EscrowNotification[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (contractId) {
        params.append('contractId', contractId);
      }
      
      const response = await fetch(`/api/escrow/notifications?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }
      
      const notificationsData: EscrowNotification[] = await response.json();
      setNotifications(notificationsData);
      
      return notificationsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await fetch(`/api/escrow/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      setNotifications(prev => prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'delivered' as const }
          : notification
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Execute workflow
  const executeWorkflow = useCallback(async (
    workflowId: string,
    contractId: string,
    parameters: Record<string, unknown>
  ): Promise<TransactionResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/escrow/execute-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId,
          contractId,
          parameters,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute workflow');
      }
      
      const transactionResponse: TransactionResponse = await response.json();
      
      // Refresh escrow data
      await refreshEscrow(contractId);
      
      return transactionResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute workflow';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility functions
  const calculateEscrowFees = useCallback((amount: number, type: EscrowType): number => {
    const baseFee = 0.025; // 2.5% base fee
    const typeMultipliers = {
      milestone: 1.0,
      time_based: 1.2,
      deliverable: 1.1,
      hybrid: 1.3,
    };
    
    return amount * baseFee * typeMultipliers[type];
  }, []);

  const validateEscrowCreation = useCallback((request: EscrowCreationRequest): string[] => {
    const errors: string[] = [];
    
    if (!request.clientId || !request.freelancerId) {
      errors.push('Client and freelancer IDs are required');
    }
    
    if (request.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (!request.milestones || request.milestones.length === 0) {
      errors.push('At least one milestone is required');
    }
    
    if (request.milestones) {
      const totalMilestoneAmount = request.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
      if (Math.abs(totalMilestoneAmount - request.amount) > 0.01) {
        errors.push('Total milestone amounts must equal the escrow amount');
      }
    }
    
    if (!request.description || request.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }
    
    return errors;
  }, []);

  const getEscrowStatus = useCallback((contractId: string): EscrowStatus | null => {
    const escrow = escrows.find(e => e.id === contractId);
    return escrow?.status || null;
  }, [escrows]);

  const getMilestoneProgress = useCallback((contractId: string): { completed: number; total: number; percentage: number } => {
    const escrow = escrows.find(e => e.id === contractId);
    if (!escrow) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const completed = escrow.milestones.filter(m => m.status === 'completed').length;
    const total = escrow.milestones.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  }, [escrows]);

  const canReleaseFunds = useCallback((contractId: string, milestoneId?: string): boolean => {
    const escrow = escrows.find(e => e.id === contractId);
    if (!escrow || escrow.status !== 'active') {
      return false;
    }
    
    if (milestoneId) {
      const milestone = escrow.milestones.find(m => m.id === milestoneId);
      return milestone?.status === 'completed' || false;
    }
    
    return escrow.milestones.some(m => m.status === 'completed');
  }, [escrows]);

  const canStartDispute = useCallback((contractId: string): boolean => {
    const escrow = escrows.find(e => e.id === contractId);
    return escrow?.status === 'active' && !escrow.disputeId;
  }, [escrows]);

  const getAutoReleaseStatus = useCallback((contractId: string): AutoReleaseSettings | null => {
    const escrow = escrows.find(e => e.id === contractId);
    return escrow?.autoReleaseSettings || null;
  }, [escrows]);

  // Real-time updates
  const subscribeToEscrowUpdates = useCallback((contractId: string): void => {
    if (wsConnections.has(contractId)) {
      return; // Already subscribed
    }
    
    const ws = new WebSocket(`ws://localhost:3001/escrow/${contractId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      setEscrows(prev => prev.map(escrow =>
        escrow.id === contractId ? { ...escrow, ...update } : escrow
      ));
      
      if (currentEscrow?.id === contractId) {
        setCurrentEscrow(prev => prev ? { ...prev, ...update } : null);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error for escrow', contractId, error);
    };
    
    ws.onclose = () => {
      setWsConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(contractId);
        return newMap;
      });
    };
    
    setWsConnections(prev => new Map(prev).set(contractId, ws));
  }, [wsConnections, currentEscrow]);

  const unsubscribeFromEscrowUpdates = useCallback((contractId: string): void => {
    const ws = wsConnections.get(contractId);
    if (ws) {
      ws.close();
      setWsConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(contractId);
        return newMap;
      });
    }
  }, [wsConnections]);

  const refreshEscrow = useCallback(async (contractId: string): Promise<void> => {
    try {
      await getEscrow(contractId);
    } catch (err) {
      console.error('Failed to refresh escrow:', err);
    }
  }, [getEscrow]);

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      wsConnections.forEach(ws => ws.close());
    };
  }, [wsConnections]);

  return {
    // State
    escrows,
    currentEscrow,
    analytics,
    fundManagement,
    securityValidation,
    workflows,
    notifications,
    
    // Loading states
    loading,
    creating,
    updating,
    releasing,
    disputing,
    validating,
    
    // Error states
    error,
    creationError,
    updateError,
    releaseError,
    disputeError,
    validationError,
    
    // Actions
    createEscrow,
    updateEscrow,
    releaseFunds,
    startDispute,
    getEscrow,
    getEscrowAnalytics,
    getFundManagement,
    validateSecurity,
    getWorkflows,
    getNotifications,
    markNotificationRead,
    executeWorkflow,
    
    // Utility functions
    calculateEscrowFees,
    validateEscrowCreation,
    getEscrowStatus,
    getMilestoneProgress,
    canReleaseFunds,
    canStartDispute,
    getAutoReleaseStatus,
    
    // Real-time updates
    subscribeToEscrowUpdates,
    unsubscribeFromEscrowUpdates,
    refreshEscrow,
  };
};
