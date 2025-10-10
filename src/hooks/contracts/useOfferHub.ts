import { useMemo } from 'react';
import { useUserRegistry } from './useUserRegistry';
import { useEscrow } from './useEscrow';
import { usePublication } from './usePublication';
import { useRating } from './useRating';
import { useDispute } from './useDispute';

// Contract addresses type
export interface ContractAddresses {
  userRegistry: string;
  escrow: string;
  publication: string;
  rating: string;
  dispute: string;
  feeManager: string;
  reputation: string;
  escrowFactory: string;
  emergency: string;
  stat: string;
}

// Main hook that provides access to all contracts
export interface UseOfferHubReturn {
  // Individual contract hooks
  userRegistry: ReturnType<typeof useUserRegistry>;
  escrow: ReturnType<typeof useEscrow>;
  publication: ReturnType<typeof usePublication>;
  rating: ReturnType<typeof useRating>;
  dispute: ReturnType<typeof useDispute>;
  
  // Combined state
  loading: boolean;
  error: string | null;
  
  // Utility functions
  refreshAll: () => Promise<void>;
  isAnyContractPaused: () => Promise<boolean>;
  getContractStatuses: () => Promise<ContractStatus[]>;
}

export interface ContractStatus {
  name: string;
  address: string;
  paused: boolean;
  admin: string | null;
  lastChecked: number;
}

// Default contract addresses (should be loaded from environment)
const DEFAULT_CONTRACT_ADDRESSES: ContractAddresses = {
  userRegistry: process.env.NEXT_PUBLIC_USER_REGISTRY_CONTRACT_ID || '',
  escrow: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || '',
  publication: process.env.NEXT_PUBLIC_PUBLICATION_CONTRACT_ID || '',
  rating: process.env.NEXT_PUBLIC_RATING_CONTRACT_ID || '',
  dispute: process.env.NEXT_PUBLIC_DISPUTE_CONTRACT_ID || '',
  feeManager: process.env.NEXT_PUBLIC_FEE_MANAGER_CONTRACT_ID || '',
  reputation: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ID || '',
  escrowFactory: process.env.NEXT_PUBLIC_ESCROW_FACTORY_CONTRACT_ID || '',
  emergency: process.env.NEXT_PUBLIC_EMERGENCY_CONTRACT_ID || '',
  stat: process.env.NEXT_PUBLIC_STAT_CONTRACT_ID || '',
};

export const useOfferHub = (contractAddresses?: Partial<ContractAddresses>): UseOfferHubReturn => {
  // Merge provided addresses with defaults
  const addresses = useMemo(() => ({
    ...DEFAULT_CONTRACT_ADDRESSES,
    ...contractAddresses,
  }), [contractAddresses]);

  // Initialize all contract hooks
  const userRegistry = useUserRegistry(addresses.userRegistry);
  const escrow = useEscrow(addresses.escrow);
  const publication = usePublication(addresses.publication);
  const rating = useRating(addresses.rating);
  const dispute = useDispute(addresses.dispute);

  // Combined loading state
  const loading = useMemo(() => 
    userRegistry.loading || 
    escrow.loading || 
    publication.loading || 
    rating.loading || 
    dispute.loading,
    [userRegistry.loading, escrow.loading, publication.loading, rating.loading, dispute.loading]
  );

  // Combined error state
  const error = useMemo(() => 
    userRegistry.error || 
    escrow.error || 
    publication.error || 
    rating.error || 
    dispute.error,
    [userRegistry.error, escrow.error, publication.error, rating.error, dispute.error]
  );

  // Utility functions
  const refreshAll = async (): Promise<void> => {
    // This would trigger a refresh of all contract data
    // Implementation depends on how you want to handle data refresh
    console.log('Refreshing all contract data...');
  };

  const isAnyContractPaused = async (): Promise<boolean> => {
    try {
      const [
        userRegistryPaused,
        escrowPaused,
        publicationPaused,
        ratingPaused,
        disputePaused,
      ] = await Promise.all([
        userRegistry.isPaused(),
        escrow.isPaused(),
        publication.isPaused(),
        rating.isPaused(),
        dispute.isPaused(),
      ]);

      return userRegistryPaused || escrowPaused || publicationPaused || ratingPaused || disputePaused;
    } catch (error) {
      console.error('Error checking contract pause status:', error);
      return false;
    }
  };

  const getContractStatuses = async (): Promise<ContractStatus[]> => {
    try {
      const [
        userRegistryPaused,
        escrowPaused,
        publicationPaused,
        ratingPaused,
        disputePaused,
        userRegistryAdmin,
        escrowAdmin,
        publicationAdmin,
        ratingAdmin,
        disputeAdmin,
      ] = await Promise.all([
        userRegistry.isPaused(),
        escrow.isPaused(),
        publication.isPaused(),
        rating.isPaused(),
        dispute.isPaused(),
        userRegistry.getAdmin(),
        escrow.getAdmin?.() || Promise.resolve(null),
        publication.getAdmin?.() || Promise.resolve(null),
        rating.getAdmin?.() || Promise.resolve(null),
        dispute.getAdmin(),
      ]);

      const now = Date.now();

      return [
        {
          name: 'User Registry',
          address: addresses.userRegistry,
          paused: userRegistryPaused,
          admin: userRegistryAdmin,
          lastChecked: now,
        },
        {
          name: 'Escrow',
          address: addresses.escrow,
          paused: escrowPaused,
          admin: escrowAdmin,
          lastChecked: now,
        },
        {
          name: 'Publication',
          address: addresses.publication,
          paused: publicationPaused,
          admin: publicationAdmin,
          lastChecked: now,
        },
        {
          name: 'Rating',
          address: addresses.rating,
          paused: ratingPaused,
          admin: ratingAdmin,
          lastChecked: now,
        },
        {
          name: 'Dispute',
          address: addresses.dispute,
          paused: disputePaused,
          admin: disputeAdmin,
          lastChecked: now,
        },
      ];
    } catch (error) {
      console.error('Error getting contract statuses:', error);
      return [];
    }
  };

  return {
    userRegistry,
    escrow,
    publication,
    rating,
    dispute,
    loading,
    error,
    refreshAll,
    isAnyContractPaused,
    getContractStatuses,
  };
};

// Export individual hooks for direct use
export {
  useUserRegistry,
  useEscrow,
  usePublication,
  useRating,
  useDispute,
};

// Export types
export type {
  ContractAddresses,
  UseOfferHubReturn,
  ContractStatus,
};
