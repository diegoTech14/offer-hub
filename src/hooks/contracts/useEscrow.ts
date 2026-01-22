import { useState, useCallback } from 'react';
import { Address, u32, u64, i128 } from '@/types/soroban';

// Types based on the escrow contract interface
export interface EscrowData {
  client: Address;
  freelancer: Address;
  arbitrator: Address;
  token: Address;
  amount: i128;
  status: EscrowStatus;
  dispute_result: u32;
  timeout_secs: u64;
  created_at: u64;
  updated_at: u64;
}

export interface EscrowSummary {
  contract_id: Address;
  client: Address;
  freelancer: Address;
  amount: i128;
  status: EscrowStatus;
  created_at: u64;
}

export interface Milestone {
  id: u32;
  description: string;
  amount: i128;
  status: MilestoneStatus;
  created_at: u64;
  approved_at: u64;
  released_at: u64;
}

export interface MilestoneHistory {
  milestone_id: u32;
  action: string;
  timestamp: u64;
  actor: Address;
}

export interface ContractConfig {
  fee_percentage: u32;
  dispute_timeout: u64;
  auto_release_timeout: u64;
  max_milestones: u32;
}

export enum EscrowStatus {
  PENDING = 0,
  FUNDED = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  DISPUTED = 4,
  RESOLVED = 5,
  CANCELLED = 6,
}

export enum MilestoneStatus {
  PENDING = 0,
  APPROVED = 1,
  RELEASED = 2,
  DISPUTED = 3,
}

interface UseEscrowReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Contract initialization
  initContract: (client: Address, freelancer: Address, amount: i128, feeManager: Address) => Promise<boolean>;
  initContractFull: (
    client: Address,
    freelancer: Address,
    arbitrator: Address,
    token: Address,
    amount: i128,
    timeoutSecs: u64
  ) => Promise<boolean>;
  initializeContract: (admin: Address) => Promise<boolean>;
  
  // Fund management
  depositFunds: (client: Address) => Promise<boolean>;
  releaseFunds: (freelancer: Address) => Promise<boolean>;
  autoRelease: () => Promise<boolean>;
  emergencyWithdraw: (admin: Address) => Promise<boolean>;
  
  // Milestone management
  addMilestone: (client: Address, description: string, amount: i128) => Promise<u32 | null>;
  approveMilestone: (client: Address, milestoneId: u32) => Promise<boolean>;
  releaseMilestone: (freelancer: Address, milestoneId: u32) => Promise<boolean>;
  
  // Dispute management
  dispute: (caller: Address) => Promise<boolean>;
  resolveDispute: (caller: Address, result: string) => Promise<boolean>;
  
  // Configuration
  setConfig: (config: ContractConfig) => Promise<boolean>;
  getConfig: () => Promise<ContractConfig | null>;
  
  // Query functions
  getEscrowData: () => Promise<EscrowData | null>;
  getMilestones: () => Promise<Milestone[]>;
  getMilestoneHistory: () => Promise<MilestoneHistory[]>;
  getContractStatus: (contractId: Address) => Promise<EscrowSummary | null>;
  getTotalTransactions: () => Promise<u64 | null>;
  
  // Rate limiting
  setRateLimitBypass: (user: Address, bypass: boolean) => Promise<boolean>;
  resetRateLimit: (user: Address, limitType: string) => Promise<boolean>;
  resetTransactionCount: (admin: Address) => Promise<boolean>;
  
  // Contract control
  pause: (admin: Address) => Promise<boolean>;
  unpause: (admin: Address) => Promise<boolean>;
  isPaused: () => Promise<boolean>;
  
  // Testing (remove in production)
  testSetDisputeResult: (result: u32) => Promise<boolean>;
}

export const useEscrow = (contractAddress: string): UseEscrowReturn => {
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
      const response = await fetch('/api/contracts/escrow/call', {
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

  // Contract initialization
  const initContract = useCallback(async (
    client: Address,
    freelancer: Address,
    amount: i128,
    feeManager: Address
  ): Promise<boolean> => {
    try {
      await handleContractCall('init_contract', [client, freelancer, amount, feeManager]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const initContractFull = useCallback(async (
    client: Address,
    freelancer: Address,
    arbitrator: Address,
    token: Address,
    amount: i128,
    timeoutSecs: u64
  ): Promise<boolean> => {
    try {
      await handleContractCall('init_contract_full', [client, freelancer, arbitrator, token, amount, timeoutSecs]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const initializeContract = useCallback(async (admin: Address): Promise<boolean> => {
    try {
      await handleContractCall('initialize_contract', [admin]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Fund management
  const depositFunds = useCallback(async (client: Address): Promise<boolean> => {
    try {
      await handleContractCall('deposit_funds', [client]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const releaseFunds = useCallback(async (freelancer: Address): Promise<boolean> => {
    try {
      await handleContractCall('release_funds', [freelancer]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const autoRelease = useCallback(async (): Promise<boolean> => {
    try {
      await handleContractCall('auto_release');
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const emergencyWithdraw = useCallback(async (admin: Address): Promise<boolean> => {
    try {
      await handleContractCall('emergency_withdraw', [admin], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Milestone management
  const addMilestone = useCallback(async (
    client: Address,
    description: string,
    amount: i128
  ): Promise<u32 | null> => {
    try {
      return await handleContractCall('add_milestone', [client, description, amount]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const approveMilestone = useCallback(async (
    client: Address,
    milestoneId: u32
  ): Promise<boolean> => {
    try {
      await handleContractCall('approve_milestone', [client, milestoneId]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const releaseMilestone = useCallback(async (
    freelancer: Address,
    milestoneId: u32
  ): Promise<boolean> => {
    try {
      await handleContractCall('release_milestone', [freelancer, milestoneId]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Dispute management
  const dispute = useCallback(async (caller: Address): Promise<boolean> => {
    try {
      await handleContractCall('dispute', [caller]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const resolveDispute = useCallback(async (
    caller: Address,
    result: string
  ): Promise<boolean> => {
    try {
      await handleContractCall('resolve_dispute', [caller, result]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Configuration
  const setConfig = useCallback(async (config: ContractConfig): Promise<boolean> => {
    try {
      await handleContractCall('set_config', [config]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const getConfig = useCallback(async (): Promise<ContractConfig | null> => {
    try {
      return await handleContractCall('get_config');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  // Query functions
  const getEscrowData = useCallback(async (): Promise<EscrowData | null> => {
    try {
      return await handleContractCall('get_escrow_data');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getMilestones = useCallback(async (): Promise<Milestone[]> => {
    try {
      return await handleContractCall('get_milestones');
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getMilestoneHistory = useCallback(async (): Promise<MilestoneHistory[]> => {
    try {
      return await handleContractCall('get_milestone_history');
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getContractStatus = useCallback(async (contractId: Address): Promise<EscrowSummary | null> => {
    try {
      return await handleContractCall('get_contract_status', [contractId]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getTotalTransactions = useCallback(async (): Promise<u64 | null> => {
    try {
      return await handleContractCall('get_total_transactions');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  // Rate limiting
  const setRateLimitBypass = useCallback(async (user: Address, bypass: boolean): Promise<boolean> => {
    try {
      await handleContractCall('set_rate_limit_bypass', [user, bypass]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const resetRateLimit = useCallback(async (user: Address, limitType: string): Promise<boolean> => {
    try {
      await handleContractCall('reset_rate_limit', [user, limitType]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const resetTransactionCount = useCallback(async (admin: Address): Promise<boolean> => {
    try {
      await handleContractCall('reset_transaction_count', [admin], true);
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

  // Testing (remove in production)
  const testSetDisputeResult = useCallback(async (result: u32): Promise<boolean> => {
    try {
      await handleContractCall('test_set_dispute_result', [result]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  return {
    loading,
    error,
    initContract,
    initContractFull,
    initializeContract,
    depositFunds,
    releaseFunds,
    autoRelease,
    emergencyWithdraw,
    addMilestone,
    approveMilestone,
    releaseMilestone,
    dispute,
    resolveDispute,
    setConfig,
    getConfig,
    getEscrowData,
    getMilestones,
    getMilestoneHistory,
    getContractStatus,
    getTotalTransactions,
    setRateLimitBypass,
    resetRateLimit,
    resetTransactionCount,
    pause,
    unpause,
    isPaused,
    testSetDisputeResult,
  };
};
