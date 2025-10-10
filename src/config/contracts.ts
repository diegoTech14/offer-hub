// Contract configuration and addresses
export interface ContractConfig {
  network: string;
  adminAddress: string;
  feeManagerAddress: string;
  contracts: {
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
  };
}

// Load contract addresses from environment variables
export const getContractConfig = (): ContractConfig => {
  const network = process.env.NEXT_PUBLIC_SOROBAN_NETWORK || 'testnet';
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '';
  const feeManagerAddress = process.env.NEXT_PUBLIC_FEE_MANAGER_ADDRESS || adminAddress;

  return {
    network,
    adminAddress,
    feeManagerAddress,
    contracts: {
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
    },
  };
};

// Validate contract configuration
export const validateContractConfig = (config: ContractConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.network) {
    errors.push('Network is required');
  }

  if (!config.adminAddress) {
    errors.push('Admin address is required');
  }

  if (!config.feeManagerAddress) {
    errors.push('Fee manager address is required');
  }

  // Check if all contract addresses are provided
  const requiredContracts = [
    'userRegistry',
    'escrow',
    'publication',
    'rating',
    'dispute',
    'feeManager',
    'reputation',
    'escrowFactory',
    'emergency',
    'stat',
  ] as const;

  for (const contract of requiredContracts) {
    if (!config.contracts[contract]) {
      errors.push(`${contract} contract address is required`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Get contract address by name
export const getContractAddress = (contractName: keyof ContractConfig['contracts']): string => {
  const config = getContractConfig();
  return config.contracts[contractName];
};

// Contract names for easy reference
export const CONTRACT_NAMES = {
  USER_REGISTRY: 'userRegistry',
  ESCROW: 'escrow',
  PUBLICATION: 'publication',
  RATING: 'rating',
  DISPUTE: 'dispute',
  FEE_MANAGER: 'feeManager',
  REPUTATION: 'reputation',
  ESCROW_FACTORY: 'escrowFactory',
  EMERGENCY: 'emergency',
  STAT: 'stat',
} as const;

// Network configurations
export const NETWORKS = {
  TESTNET: 'testnet',
  FUTURENET: 'futurenet',
  MAINNET: 'mainnet',
} as const;

// Default configuration
export const DEFAULT_CONFIG: ContractConfig = {
  network: NETWORKS.TESTNET,
  adminAddress: '',
  feeManagerAddress: '',
  contracts: {
    userRegistry: '',
    escrow: '',
    publication: '',
    rating: '',
    dispute: '',
    feeManager: '',
    reputation: '',
    escrowFactory: '',
    emergency: '',
    stat: '',
  },
};
