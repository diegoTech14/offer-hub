import { useState, useCallback } from 'react';
import { Address, u32, u64, i128, f64 } from '@/types/soroban';

// Types based on the dispute contract interface
export interface DisputeData {
  id: u32;
  escrow_id: Address;
  initiator: Address;
  respondent: Address;
  mediator: Address;
  arbitrator: Address;
  status: DisputeStatus;
  reason: string;
  evidence: Evidence[];
  resolution: string;
  created_at: u64;
  updated_at: u64;
  resolved_at: u64;
  timeout_at: u64;
}

export interface Evidence {
  id: u32;
  submitter: Address;
  evidence_type: string;
  content: string;
  timestamp: u64;
  verified: boolean;
}

export enum DisputeStatus {
  OPEN = 0,
  MEDIATION = 1,
  ARBITRATION = 2,
  RESOLVED = 3,
  CLOSED = 4,
  TIMEOUT = 5,
}

export enum DisputeResolution {
  FAVOR_INITIATOR = 0,
  FAVOR_RESPONDENT = 1,
  SPLIT = 2,
  NO_FAULT = 3,
}

export interface DisputeFilters {
  status?: DisputeStatus;
  mediator?: Address;
  arbitrator?: Address;
  dateFrom?: u64;
  dateTo?: u64;
}

export interface DisputeStats {
  total_disputes: u32;
  open_disputes: u32;
  resolved_disputes: u32;
  average_resolution_time: u64;
  resolution_distribution: { [key: DisputeResolution]: u32 };
}

export interface MediatorStats {
  mediator: Address;
  total_cases: u32;
  resolved_cases: u32;
  success_rate: f64;
  average_resolution_time: u64;
}

interface UseDisputeReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Dispute management
  openDispute: (
    escrowId: Address,
    respondent: Address,
    reason: string
  ) => Promise<u32 | null>;
  
  assignMediator: (
    disputeId: u32,
    mediator: Address
  ) => Promise<boolean>;
  
  escalateToArbitration: (
    disputeId: u32,
    arbitrator: Address
  ) => Promise<boolean>;
  
  resolveDispute: (
    disputeId: u32,
    resolution: DisputeResolution,
    resolution_text: string
  ) => Promise<boolean>;
  
  // Evidence management
  addEvidence: (
    disputeId: u32,
    evidenceType: string,
    content: string
  ) => Promise<u32 | null>;
  
  verifyEvidence: (
    disputeId: u32,
    evidenceId: u32,
    verified: boolean
  ) => Promise<boolean>;
  
  // Timeout management
  checkTimeout: (disputeId: u32) => Promise<boolean>;
  setDisputeTimeout: (
    disputeId: u32,
    timeoutAt: u64
  ) => Promise<boolean>;
  
  // Query functions
  getDispute: (disputeId: u32) => Promise<DisputeData | null>;
  getDisputesByUser: (user: Address, limit?: u32, offset?: u32) => Promise<DisputeData[]>;
  getDisputesByEscrow: (escrowId: Address) => Promise<DisputeData[]>;
  getDisputesByMediator: (mediator: Address, limit?: u32, offset?: u32) => Promise<DisputeData[]>;
  getDisputesByArbitrator: (arbitrator: Address, limit?: u32, offset?: u32) => Promise<DisputeData[]>;
  
  // Search and filtering
  searchDisputes: (filters: DisputeFilters) => Promise<DisputeData[]>;
  getOpenDisputes: (limit?: u32, offset?: u32) => Promise<DisputeData[]>;
  
  // Mediator and arbitrator management
  addMediator: (mediator: Address) => Promise<boolean>;
  removeMediator: (mediator: Address) => Promise<boolean>;
  addArbitrator: (arbitrator: Address) => Promise<boolean>;
  removeArbitrator: (arbitrator: Address) => Promise<boolean>;
  getMediators: () => Promise<Address[]>;
  getArbitrators: () => Promise<Address[]>;
  
  // Statistics
  getDisputeStats: () => Promise<DisputeStats | null>;
  getMediatorStats: (mediator: Address) => Promise<MediatorStats | null>;
  getArbitratorStats: (arbitrator: Address) => Promise<MediatorStats | null>;
  
  // Access control
  getAdmin: () => Promise<Address | null>;
  transferAdmin: (newAdmin: Address) => Promise<boolean>;
  
  // Contract control
  pause: (admin: Address) => Promise<boolean>;
  unpause: (admin: Address) => Promise<boolean>;
  isPaused: () => Promise<boolean>;
  
  // Configuration
  setConfig: (config: DisputeConfig) => Promise<boolean>;
  getConfig: () => Promise<DisputeConfig | null>;
}

export interface DisputeConfig {
  mediation_timeout: u64;
  arbitration_timeout: u64;
  max_evidence_per_dispute: u32;
  mediation_fee: i128;
  arbitration_fee: i128;
  auto_assign_mediators: boolean;
}

export const useDispute = (contractAddress: string): UseDisputeReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContractCall = useCallback(async (
    method: string,
    args: any[] = [],
    adminRequired: boolean = false
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contracts/dispute/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract_address: contractAddress,
          method,
          args,
          admin_required: adminRequired,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to call ${method}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to call ${method}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractAddress]);

  // Dispute management
  const openDispute = useCallback(async (
    escrowId: Address,
    respondent: Address,
    reason: string
  ): Promise<u32 | null> => {
    try {
      return await handleContractCall('open_dispute', [escrowId, respondent, reason]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const assignMediator = useCallback(async (
    disputeId: u32,
    mediator: Address
  ): Promise<boolean> => {
    try {
      await handleContractCall('assign_mediator', [disputeId, mediator], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const escalateToArbitration = useCallback(async (
    disputeId: u32,
    arbitrator: Address
  ): Promise<boolean> => {
    try {
      await handleContractCall('escalate_to_arbitration', [disputeId, arbitrator], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const resolveDispute = useCallback(async (
    disputeId: u32,
    resolution: DisputeResolution,
    resolutionText: string
  ): Promise<boolean> => {
    try {
      await handleContractCall('resolve_dispute', [disputeId, resolution, resolutionText], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Evidence management
  const addEvidence = useCallback(async (
    disputeId: u32,
    evidenceType: string,
    content: string
  ): Promise<u32 | null> => {
    try {
      return await handleContractCall('add_evidence', [disputeId, evidenceType, content]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const verifyEvidence = useCallback(async (
    disputeId: u32,
    evidenceId: u32,
    verified: boolean
  ): Promise<boolean> => {
    try {
      await handleContractCall('verify_evidence', [disputeId, evidenceId, verified], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Timeout management
  const checkTimeout = useCallback(async (disputeId: u32): Promise<boolean> => {
    try {
      return await handleContractCall('check_timeout', [disputeId]);
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const setDisputeTimeout = useCallback(async (
    disputeId: u32,
    timeoutAt: u64
  ): Promise<boolean> => {
    try {
      await handleContractCall('set_dispute_timeout', [disputeId, timeoutAt], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Query functions
  const getDispute = useCallback(async (disputeId: u32): Promise<DisputeData | null> => {
    try {
      return await handleContractCall('get_dispute', [disputeId]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getDisputesByUser = useCallback(async (
    user: Address,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<DisputeData[]> => {
    try {
      return await handleContractCall('get_disputes_by_user', [user, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getDisputesByEscrow = useCallback(async (escrowId: Address): Promise<DisputeData[]> => {
    try {
      return await handleContractCall('get_disputes_by_escrow', [escrowId]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getDisputesByMediator = useCallback(async (
    mediator: Address,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<DisputeData[]> => {
    try {
      return await handleContractCall('get_disputes_by_mediator', [mediator, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getDisputesByArbitrator = useCallback(async (
    arbitrator: Address,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<DisputeData[]> => {
    try {
      return await handleContractCall('get_disputes_by_arbitrator', [arbitrator, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Search and filtering
  const searchDisputes = useCallback(async (filters: DisputeFilters): Promise<DisputeData[]> => {
    try {
      return await handleContractCall('search_disputes', [filters]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getOpenDisputes = useCallback(async (
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<DisputeData[]> => {
    try {
      return await handleContractCall('get_open_disputes', [limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Mediator and arbitrator management
  const addMediator = useCallback(async (mediator: Address): Promise<boolean> => {
    try {
      await handleContractCall('add_mediator', [mediator], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const removeMediator = useCallback(async (mediator: Address): Promise<boolean> => {
    try {
      await handleContractCall('remove_mediator', [mediator], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const addArbitrator = useCallback(async (arbitrator: Address): Promise<boolean> => {
    try {
      await handleContractCall('add_arbitrator', [arbitrator], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const removeArbitrator = useCallback(async (arbitrator: Address): Promise<boolean> => {
    try {
      await handleContractCall('remove_arbitrator', [arbitrator], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const getMediators = useCallback(async (): Promise<Address[]> => {
    try {
      return await handleContractCall('get_mediators');
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getArbitrators = useCallback(async (): Promise<Address[]> => {
    try {
      return await handleContractCall('get_arbitrators');
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Statistics
  const getDisputeStats = useCallback(async (): Promise<DisputeStats | null> => {
    try {
      return await handleContractCall('get_dispute_stats');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getMediatorStats = useCallback(async (mediator: Address): Promise<MediatorStats | null> => {
    try {
      return await handleContractCall('get_mediator_stats', [mediator]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getArbitratorStats = useCallback(async (arbitrator: Address): Promise<MediatorStats | null> => {
    try {
      return await handleContractCall('get_arbitrator_stats', [arbitrator]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  // Access control
  const getAdmin = useCallback(async (): Promise<Address | null> => {
    try {
      return await handleContractCall('get_admin');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const transferAdmin = useCallback(async (newAdmin: Address): Promise<boolean> => {
    try {
      await handleContractCall('transfer_admin', [newAdmin], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Contract control
  const pause = useCallback(async (admin: Address): Promise<boolean> => {
    try {
      await handleContractCall('pause', [admin], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const unpause = useCallback(async (admin: Address): Promise<boolean> => {
    try {
      await handleContractCall('unpause', [admin], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const isPaused = useCallback(async (): Promise<boolean> => {
    try {
      return await handleContractCall('is_paused');
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Configuration
  const setConfig = useCallback(async (config: DisputeConfig): Promise<boolean> => {
    try {
      await handleContractCall('set_config', [config], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const getConfig = useCallback(async (): Promise<DisputeConfig | null> => {
    try {
      return await handleContractCall('get_config');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  return {
    loading,
    error,
    openDispute,
    assignMediator,
    escalateToArbitration,
    resolveDispute,
    addEvidence,
    verifyEvidence,
    checkTimeout,
    setDisputeTimeout,
    getDispute,
    getDisputesByUser,
    getDisputesByEscrow,
    getDisputesByMediator,
    getDisputesByArbitrator,
    searchDisputes,
    getOpenDisputes,
    addMediator,
    removeMediator,
    addArbitrator,
    removeArbitrator,
    getMediators,
    getArbitrators,
    getDisputeStats,
    getMediatorStats,
    getArbitratorStats,
    getAdmin,
    transferAdmin,
    pause,
    unpause,
    isPaused,
    setConfig,
    getConfig,
  };
};
