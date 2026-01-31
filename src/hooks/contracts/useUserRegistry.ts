import { useState, useCallback } from 'react';
import { Address, u32, u64 } from '@/types/soroban';

// Types based on the contract interface
export interface UserProfile {
  address: Address;
  verification_level: VerificationLevel;
  expires_at: u64;
  metadata: string;
  is_blacklisted: boolean;
  created_at: u64;
  updated_at: u64;
}

export interface UserProfileSummary {
  address: Address;
  verification_level: VerificationLevel;
  is_verified: boolean;
  is_blacklisted: boolean;
  metadata: string;
}

export enum VerificationLevel {
  NONE = 0,
  BASIC = 1,
  VERIFIED = 2,
  PREMIUM = 3,
  ENTERPRISE = 4,
}

export interface UserStatus {
  is_verified: boolean;
  verification_level: VerificationLevel;
  is_blacklisted: boolean;
  expires_at: u64;
}

export interface UserDataExport {
  profile: UserProfile;
  verification_history: any[];
  metadata: string;
}

export interface AllUsersExport {
  users: UserProfile[];
  total_count: u64;
  export_timestamp: u64;
}

export interface PlatformDataExport {
  users: UserProfile[];
  total_users: u64;
  export_timestamp: u64;
}

interface UseUserRegistryReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // User verification functions
  verifyUser: (user: Address, level: VerificationLevel, expiresAt: u64, metadata: string) => Promise<boolean>;
  unverifyUser: (user: Address) => Promise<boolean>;
  updateVerificationLevel: (user: Address, newLevel: VerificationLevel) => Promise<boolean>;
  renewVerification: (user: Address, newExpiresAt: u64) => Promise<boolean>;
  
  // Blacklist functions
  blacklistUser: (user: Address) => Promise<boolean>;
  unblacklistUser: (user: Address) => Promise<boolean>;
  
  // Bulk operations
  bulkVerifyUsers: (users: Address[], level: VerificationLevel, expiresAt: u64, metadata: string) => Promise<boolean>;
  
  // Profile management
  updateUserMetadata: (user: Address, metadata: string) => Promise<boolean>;
  
  // Query functions
  getUserStatus: (user: Address) => Promise<UserStatus | null>;
  getUserProfile: (user: Address) => Promise<UserProfile | null>;
  getUserProfileFormatted: (user: Address) => Promise<UserProfileSummary | null>;
  getVerificationLevel: (user: Address) => Promise<VerificationLevel | null>;
  isVerified: (user: Address) => Promise<boolean>;
  isUserBlacklisted: (user: Address) => Promise<boolean>;
  getTotalUsers: () => Promise<u64 | null>;
  
  // Access control
  addModerator: (moderator: Address) => Promise<boolean>;
  removeModerator: (moderator: Address) => Promise<boolean>;
  transferAdmin: (newAdmin: Address) => Promise<boolean>;
  getAdmin: () => Promise<Address | null>;
  getModerators: () => Promise<Address[]>;
  
  // Contract management
  setRatingContract: (contractAddress: Address) => Promise<boolean>;
  addEscrowContract: (contractAddress: Address) => Promise<boolean>;
  addDisputeContract: (contractAddress: Address) => Promise<boolean>;
  
  // Data export
  exportUserData: (user: Address) => Promise<UserDataExport | null>;
  exportAllData: (limit: u32) => Promise<AllUsersExport | null>;
  exportPlatformData: (limit: u32) => Promise<PlatformDataExport | null>;
  
  // Rate limiting
  setRateLimitBypass: (user: Address, bypass: boolean) => Promise<boolean>;
  resetRateLimit: (user: Address, limitType: string) => Promise<boolean>;
  
  // Contract control
  pause: () => Promise<boolean>;
  unpause: () => Promise<boolean>;
  isPaused: () => Promise<boolean>;
}

export const useUserRegistry = (contractAddress: string): UseUserRegistryReturn => {
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
      const response = await fetch('/api/contracts/user-registry/call', {
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

  // User verification functions
  const verifyUser = useCallback(async (
    user: Address,
    level: VerificationLevel,
    expiresAt: u64,
    metadata: string
  ): Promise<boolean> => {
    try {
      await handleContractCall('verify_user', [user, level, expiresAt, metadata], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const unverifyUser = useCallback(async (user: Address): Promise<boolean> => {
    try {
      await handleContractCall('unverify_user', [user], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const updateVerificationLevel = useCallback(async (
    user: Address,
    newLevel: VerificationLevel
  ): Promise<boolean> => {
    try {
      await handleContractCall('update_verification_level', [user, newLevel], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const renewVerification = useCallback(async (
    user: Address,
    newExpiresAt: u64
  ): Promise<boolean> => {
    try {
      await handleContractCall('renew_verification', [user, newExpiresAt], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Blacklist functions
  const blacklistUser = useCallback(async (user: Address): Promise<boolean> => {
    try {
      await handleContractCall('blacklist_user', [user], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const unblacklistUser = useCallback(async (user: Address): Promise<boolean> => {
    try {
      await handleContractCall('unblacklist_user', [user], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Bulk operations
  const bulkVerifyUsers = useCallback(async (
    users: Address[],
    level: VerificationLevel,
    expiresAt: u64,
    metadata: string
  ): Promise<boolean> => {
    try {
      await handleContractCall('bulk_verify_users', [users, level, expiresAt, metadata], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Profile management
  const updateUserMetadata = useCallback(async (
    user: Address,
    metadata: string
  ): Promise<boolean> => {
    try {
      await handleContractCall('update_user_metadata', [user, metadata]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Query functions
  const getUserStatus = useCallback(async (user: Address): Promise<UserStatus | null> => {
    try {
      return await handleContractCall('get_user_status', [user]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getUserProfile = useCallback(async (user: Address): Promise<UserProfile | null> => {
    try {
      return await handleContractCall('get_user_profile', [user]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getUserProfileFormatted = useCallback(async (user: Address): Promise<UserProfileSummary | null> => {
    try {
      return await handleContractCall('get_user_profile_formatted', [user]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getVerificationLevel = useCallback(async (user: Address): Promise<VerificationLevel | null> => {
    try {
      return await handleContractCall('get_verification_level', [user]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const isVerified = useCallback(async (user: Address): Promise<boolean> => {
    try {
      return await handleContractCall('is_verified', [user]);
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const isUserBlacklisted = useCallback(async (user: Address): Promise<boolean> => {
    try {
      return await handleContractCall('is_user_blacklisted', [user]);
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const getTotalUsers = useCallback(async (): Promise<u64 | null> => {
    try {
      return await handleContractCall('get_total_users');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  // Access control
  const addModerator = useCallback(async (moderator: Address): Promise<boolean> => {
    try {
      await handleContractCall('add_moderator', [moderator], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const removeModerator = useCallback(async (moderator: Address): Promise<boolean> => {
    try {
      await handleContractCall('remove_moderator', [moderator], true);
      return true;
    } catch {
      return false;
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

  const getAdmin = useCallback(async (): Promise<Address | null> => {
    try {
      return await handleContractCall('get_admin');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getModerators = useCallback(async (): Promise<Address[]> => {
    try {
      return await handleContractCall('get_moderators');
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Contract management
  const setRatingContract = useCallback(async (contractAddress: Address): Promise<boolean> => {
    try {
      await handleContractCall('set_rating_contract', [contractAddress], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const addEscrowContract = useCallback(async (contractAddress: Address): Promise<boolean> => {
    try {
      await handleContractCall('add_escrow_contract', [contractAddress], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const addDisputeContract = useCallback(async (contractAddress: Address): Promise<boolean> => {
    try {
      await handleContractCall('add_dispute_contract', [contractAddress], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Data export
  const exportUserData = useCallback(async (user: Address): Promise<UserDataExport | null> => {
    try {
      return await handleContractCall('export_user_data', [user]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const exportAllData = useCallback(async (limit: u32): Promise<AllUsersExport | null> => {
    try {
      return await handleContractCall('export_all_data', [limit], true);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const exportPlatformData = useCallback(async (limit: u32): Promise<PlatformDataExport | null> => {
    try {
      return await handleContractCall('export_platform_data', [limit], true);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  // Rate limiting
  const setRateLimitBypass = useCallback(async (user: Address, bypass: boolean): Promise<boolean> => {
    try {
      await handleContractCall('set_rate_limit_bypass', [user, bypass], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const resetRateLimit = useCallback(async (user: Address, limitType: string): Promise<boolean> => {
    try {
      await handleContractCall('reset_rate_limit', [user, limitType], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Contract control
  const pause = useCallback(async (): Promise<boolean> => {
    try {
      await handleContractCall('pause', [], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const unpause = useCallback(async (): Promise<boolean> => {
    try {
      await handleContractCall('unpause', [], true);
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

  return {
    loading,
    error,
    verifyUser,
    unverifyUser,
    updateVerificationLevel,
    renewVerification,
    blacklistUser,
    unblacklistUser,
    bulkVerifyUsers,
    updateUserMetadata,
    getUserStatus,
    getUserProfile,
    getUserProfileFormatted,
    getVerificationLevel,
    isVerified,
    isUserBlacklisted,
    getTotalUsers,
    addModerator,
    removeModerator,
    transferAdmin,
    getAdmin,
    getModerators,
    setRatingContract,
    addEscrowContract,
    addDisputeContract,
    exportUserData,
    exportAllData,
    exportPlatformData,
    setRateLimitBypass,
    resetRateLimit,
    pause,
    unpause,
    isPaused,
  };
};
