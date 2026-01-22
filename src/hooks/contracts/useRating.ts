import { useState, useCallback } from 'react';
import { Address, u32, u64, i128, f64 } from '@/types/soroban';

// Types based on the rating contract interface
export interface RatingData {
  id: u32;
  rater: Address;
  ratee: Address;
  rating: u32;
  review: string;
  category: string;
  timestamp: u64;
  status: RatingStatus;
  metadata: string;
}

export interface RatingSummary {
  total_ratings: u32;
  average_rating: f64;
  rating_distribution: { [key: u32]: u32 };
  recent_ratings: RatingData[];
}

export interface UserRatingStats {
  user: Address;
  total_ratings_received: u32;
  average_rating: f64;
  rating_distribution: { [key: u32]: u32 };
  total_ratings_given: u32;
  reputation_score: u32;
}

export enum RatingStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  DISPUTED = 3,
  RESOLVED = 4,
}

export interface RatingFilters {
  minRating?: u32;
  maxRating?: u32;
  category?: string;
  status?: RatingStatus;
  dateFrom?: u64;
  dateTo?: u64;
}

export interface ModerationAction {
  rating_id: u32;
  action: string;
  moderator: Address;
  reason: string;
  timestamp: u64;
}

interface UseRatingReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Rating management
  submitRating: (
    ratee: Address,
    rating: u32,
    review: string,
    category: string,
    metadata: string
  ) => Promise<u32 | null>;
  
  updateRating: (
    ratingId: u32,
    rating: u32,
    review: string,
    metadata: string
  ) => Promise<boolean>;
  
  deleteRating: (ratingId: u32) => Promise<boolean>;
  
  // Query functions
  getRating: (ratingId: u32) => Promise<RatingData | null>;
  getUserRatings: (user: Address, limit?: u32, offset?: u32) => Promise<RatingData[]>;
  getRatingsForUser: (user: Address, limit?: u32, offset?: u32) => Promise<RatingData[]>;
  getUserRatingStats: (user: Address) => Promise<UserRatingStats | null>;
  getRatingSummary: (user: Address) => Promise<RatingSummary | null>;
  
  // Search and filtering
  searchRatings: (query: string, filters?: RatingFilters) => Promise<RatingData[]>;
  getRatingsByCategory: (category: string, limit?: u32, offset?: u32) => Promise<RatingData[]>;
  
  // Moderation
  moderateRating: (
    ratingId: u32,
    action: string,
    reason: string
  ) => Promise<boolean>;
  
  getModerationQueue: (limit?: u32, offset?: u32) => Promise<RatingData[]>;
  getModerationHistory: (ratingId: u32) => Promise<ModerationAction[]>;
  
  // Analytics
  getPlatformRatingStats: () => Promise<PlatformRatingStats | null>;
  getCategoryRatingStats: () => Promise<CategoryRatingStats[]>;
  getRatingTrends: (period: string) => Promise<RatingTrend[]>;
  
  // Incentives
  claimRatingReward: (ratingId: u32) => Promise<boolean>;
  getAvailableRewards: (user: Address) => Promise<RewardInfo[]>;
  
  // Access control
  addModerator: (moderator: Address) => Promise<boolean>;
  removeModerator: (moderator: Address) => Promise<boolean>;
  getModerators: () => Promise<Address[]>;
  
  // Contract control
  pause: (admin: Address) => Promise<boolean>;
  unpause: (admin: Address) => Promise<boolean>;
  isPaused: () => Promise<boolean>;
  
  // Configuration
  setConfig: (config: RatingConfig) => Promise<boolean>;
  getConfig: () => Promise<RatingConfig | null>;
}

export interface PlatformRatingStats {
  total_ratings: u32;
  average_rating: f64;
  total_users_rated: u32;
  rating_distribution: { [key: u32]: u32 };
  categories: { [key: string]: u32 };
  recent_activity: u32;
}

export interface CategoryRatingStats {
  category: string;
  total_ratings: u32;
  average_rating: f64;
  rating_distribution: { [key: u32]: u32 };
}

export interface RatingTrend {
  period: string;
  total_ratings: u32;
  average_rating: f64;
  new_users: u32;
}

export interface RewardInfo {
  rating_id: u32;
  amount: i128;
  token: Address;
  claimable: boolean;
  claimed_at: u64;
}

export interface RatingConfig {
  min_rating: u32;
  max_rating: u32;
  moderation_required: boolean;
  auto_approve_threshold: u32;
  reward_per_rating: i128;
  max_review_length: u32;
}

export const useRating = (contractAddress: string): UseRatingReturn => {
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
      const response = await fetch('/api/contracts/rating/call', {
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

  // Rating management
  const submitRating = useCallback(async (
    ratee: Address,
    rating: u32,
    review: string,
    category: string,
    metadata: string
  ): Promise<u32 | null> => {
    try {
      return await handleContractCall('submit_rating', [ratee, rating, review, category, metadata]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const updateRating = useCallback(async (
    ratingId: u32,
    rating: u32,
    review: string,
    metadata: string
  ): Promise<boolean> => {
    try {
      await handleContractCall('update_rating', [ratingId, rating, review, metadata]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const deleteRating = useCallback(async (ratingId: u32): Promise<boolean> => {
    try {
      await handleContractCall('delete_rating', [ratingId]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  // Query functions
  const getRating = useCallback(async (ratingId: u32): Promise<RatingData | null> => {
    try {
      return await handleContractCall('get_rating', [ratingId]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getUserRatings = useCallback(async (
    user: Address,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<RatingData[]> => {
    try {
      return await handleContractCall('get_user_ratings', [user, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getRatingsForUser = useCallback(async (
    user: Address,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<RatingData[]> => {
    try {
      return await handleContractCall('get_ratings_for_user', [user, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getUserRatingStats = useCallback(async (user: Address): Promise<UserRatingStats | null> => {
    try {
      return await handleContractCall('get_user_rating_stats', [user]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getRatingSummary = useCallback(async (user: Address): Promise<RatingSummary | null> => {
    try {
      return await handleContractCall('get_rating_summary', [user]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  // Search and filtering
  const searchRatings = useCallback(async (
    query: string,
    filters: RatingFilters = {}
  ): Promise<RatingData[]> => {
    try {
      return await handleContractCall('search_ratings', [query, filters]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getRatingsByCategory = useCallback(async (
    category: string,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<RatingData[]> => {
    try {
      return await handleContractCall('get_ratings_by_category', [category, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Moderation
  const moderateRating = useCallback(async (
    ratingId: u32,
    action: string,
    reason: string
  ): Promise<boolean> => {
    try {
      await handleContractCall('moderate_rating', [ratingId, action, reason], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const getModerationQueue = useCallback(async (
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<RatingData[]> => {
    try {
      return await handleContractCall('get_moderation_queue', [limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getModerationHistory = useCallback(async (ratingId: u32): Promise<ModerationAction[]> => {
    try {
      return await handleContractCall('get_moderation_history', [ratingId]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Analytics
  const getPlatformRatingStats = useCallback(async (): Promise<PlatformRatingStats | null> => {
    try {
      return await handleContractCall('get_platform_rating_stats');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getCategoryRatingStats = useCallback(async (): Promise<CategoryRatingStats[]> => {
    try {
      return await handleContractCall('get_category_rating_stats');
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getRatingTrends = useCallback(async (period: string): Promise<RatingTrend[]> => {
    try {
      return await handleContractCall('get_rating_trends', [period]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Incentives
  const claimRatingReward = useCallback(async (ratingId: u32): Promise<boolean> => {
    try {
      await handleContractCall('claim_rating_reward', [ratingId]);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const getAvailableRewards = useCallback(async (user: Address): Promise<RewardInfo[]> => {
    try {
      return await handleContractCall('get_available_rewards', [user]);
    } catch {
      return [];
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

  const getModerators = useCallback(async (): Promise<Address[]> => {
    try {
      return await handleContractCall('get_moderators');
    } catch {
      return [];
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
  const setConfig = useCallback(async (config: RatingConfig): Promise<boolean> => {
    try {
      await handleContractCall('set_config', [config], true);
      return true;
    } catch {
      return false;
    }
  }, [handleContractCall]);

  const getConfig = useCallback(async (): Promise<RatingConfig | null> => {
    try {
      return await handleContractCall('get_config');
    } catch {
      return null;
    }
  }, [handleContractCall]);

  return {
    loading,
    error,
    submitRating,
    updateRating,
    deleteRating,
    getRating,
    getUserRatings,
    getRatingsForUser,
    getUserRatingStats,
    getRatingSummary,
    searchRatings,
    getRatingsByCategory,
    moderateRating,
    getModerationQueue,
    getModerationHistory,
    getPlatformRatingStats,
    getCategoryRatingStats,
    getRatingTrends,
    claimRatingReward,
    getAvailableRewards,
    addModerator,
    removeModerator,
    getModerators,
    pause,
    unpause,
    isPaused,
    setConfig,
    getConfig,
  };
};
