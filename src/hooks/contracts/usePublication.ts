import { useState, useCallback } from 'react';
import { Address, u32, u64, i128 } from '@/types/soroban';

// Types based on the publication contract interface
export interface PublicationData {
  id: u32;
  user: Address;
  publication_type: string;
  title: string;
  category: string;
  amount: i128;
  timestamp: u64;
  status: PublicationStatus;
  metadata: string;
  created_at: u64;
  updated_at: u64;
}

export enum PublicationStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  EXPIRED = 5,
}

export enum PublicationType {
  SERVICE = 'service',
  PROJECT = 'project',
  GIG = 'gig',
  CONSULTATION = 'consultation',
}

interface UsePublicationReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Publication management
  publish: (
    user: Address,
    publicationType: string,
    title: string,
    category: string,
    amount: i128,
    timestamp: u64
  ) => Promise<u32 | null>;
  
  // Query functions
  getPublication: (user: Address, id: u32) => Promise<PublicationData | null>;
  
  // Batch operations
  getPublications: (user: Address, limit?: u32, offset?: u32) => Promise<PublicationData[]>;
  getPublicationsByCategory: (category: string, limit?: u32, offset?: u32) => Promise<PublicationData[]>;
  getPublicationsByType: (publicationType: string, limit?: u32, offset?: u32) => Promise<PublicationData[]>;
  
  // Search and filtering
  searchPublications: (query: string, filters?: PublicationFilters) => Promise<PublicationData[]>;
  
  // Statistics
  getPublicationStats: (user: Address) => Promise<PublicationStats | null>;
  getCategoryStats: () => Promise<CategoryStats[]>;
  
  // Contract control
  pause: (admin: Address) => Promise<boolean>;
  unpause: (admin: Address) => Promise<boolean>;
  isPaused: () => Promise<boolean>;
}

export interface PublicationFilters {
  category?: string;
  publicationType?: string;
  minAmount?: i128;
  maxAmount?: i128;
  status?: PublicationStatus;
  dateFrom?: u64;
  dateTo?: u64;
}

export interface PublicationStats {
  total_publications: u32;
  active_publications: u32;
  completed_publications: u32;
  total_amount: i128;
  average_amount: i128;
  categories: { [key: string]: u32 };
  types: { [key: string]: u32 };
}

export interface CategoryStats {
  category: string;
  count: u32;
  total_amount: i128;
  average_amount: i128;
}

export const usePublication = (contractAddress: string): UsePublicationReturn => {
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
      const response = await fetch('/api/contracts/publication/call', {
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

  // Publication management
  const publish = useCallback(async (
    user: Address,
    publicationType: string,
    title: string,
    category: string,
    amount: i128,
    timestamp: u64
  ): Promise<u32 | null> => {
    try {
      return await handleContractCall('publish', [user, publicationType, title, category, amount, timestamp]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  // Query functions
  const getPublication = useCallback(async (
    user: Address,
    id: u32
  ): Promise<PublicationData | null> => {
    try {
      return await handleContractCall('get_publication', [user, id]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  // Batch operations
  const getPublications = useCallback(async (
    user: Address,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<PublicationData[]> => {
    try {
      return await handleContractCall('get_publications', [user, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getPublicationsByCategory = useCallback(async (
    category: string,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<PublicationData[]> => {
    try {
      return await handleContractCall('get_publications_by_category', [category, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  const getPublicationsByType = useCallback(async (
    publicationType: string,
    limit: u32 = 50,
    offset: u32 = 0
  ): Promise<PublicationData[]> => {
    try {
      return await handleContractCall('get_publications_by_type', [publicationType, limit, offset]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Search and filtering
  const searchPublications = useCallback(async (
    query: string,
    filters: PublicationFilters = {}
  ): Promise<PublicationData[]> => {
    try {
      return await handleContractCall('search_publications', [query, filters]);
    } catch {
      return [];
    }
  }, [handleContractCall]);

  // Statistics
  const getPublicationStats = useCallback(async (user: Address): Promise<PublicationStats | null> => {
    try {
      return await handleContractCall('get_publication_stats', [user]);
    } catch {
      return null;
    }
  }, [handleContractCall]);

  const getCategoryStats = useCallback(async (): Promise<CategoryStats[]> => {
    try {
      return await handleContractCall('get_category_stats');
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

  return {
    loading,
    error,
    publish,
    getPublication,
    getPublications,
    getPublicationsByCategory,
    getPublicationsByType,
    searchPublications,
    getPublicationStats,
    getCategoryStats,
    pause,
    unpause,
    isPaused,
  };
};
