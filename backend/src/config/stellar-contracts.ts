import { Networks } from "@stellar/stellar-sdk";
import { CONTRACT_IDS } from "./contract-ids";

/**
 * Stellar Contract Configuration
 * Manages contract IDs, network settings, and RPC configuration for Stellar smart contracts
 */

export interface StellarContractConfig {
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
  contracts: {
    escrowFactory: string;
    feeManager: string;
    userRegistry: string;
  };
  signerSecretKey: string;
}

/**
 * Get Stellar contract configuration from environment variables
 */
export const getStellarContractConfig = (): StellarContractConfig => {
  const network = (process.env.STELLAR_NETWORK || "testnet").toLowerCase();

  // Determine network passphrase
  let networkPassphrase: string;
  if (process.env.STELLAR_NETWORK_PASSPHRASE) {
    networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE;
  } else {
    networkPassphrase = network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
  }

  // Determine RPC URL
  let rpcUrl: string;
  if (process.env.STELLAR_RPC_URL) {
    rpcUrl = process.env.STELLAR_RPC_URL;
  } else {
    rpcUrl =
      network === "mainnet"
        ? "https://soroban-rpc.mainnet.stellar.org"
        : "https://soroban-testnet.stellar.org";
  }

  const signerSecretKey = process.env.STELLAR_BACKEND_SECRET_KEY || "";

  return {
    network,
    networkPassphrase,
    rpcUrl,
    contracts: {
      escrowFactory: CONTRACT_IDS.ESCROW_FACTORY,
      feeManager: CONTRACT_IDS.FEE_MANAGER,
      userRegistry: CONTRACT_IDS.USER_REGISTRY,
    },
    signerSecretKey,
  };
};

/**
 * Validate Stellar contract configuration
 * Returns validation result with detailed error messages
 */
export const validateStellarContractConfig = (
  config: StellarContractConfig
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate network
  if (!config.network) {
    errors.push("STELLAR_NETWORK is required");
  } else if (!["testnet", "futurenet", "mainnet"].includes(config.network)) {
    errors.push(
      `Invalid STELLAR_NETWORK: ${config.network}. Must be one of: testnet, futurenet, mainnet`
    );
  }

  // Validate network passphrase
  if (!config.networkPassphrase) {
    errors.push("STELLAR_NETWORK_PASSPHRASE is required");
  }

  // Validate RPC URL
  if (!config.rpcUrl) {
    errors.push("STELLAR_RPC_URL is required");
  } else {
    try {
      new URL(config.rpcUrl);
    } catch {
      errors.push(`Invalid STELLAR_RPC_URL: ${config.rpcUrl}`);
    }
  }

  // Validate signer secret key
  if (!config.signerSecretKey) {
    errors.push("STELLAR_BACKEND_SECRET_KEY is required");
  } else if (!config.signerSecretKey.startsWith("S")) {
    errors.push("STELLAR_BACKEND_SECRET_KEY must be a valid Stellar secret key (starts with 'S')");
  }

  // Validate contract IDs
  const requiredContracts = ["escrowFactory", "feeManager", "userRegistry"] as const;

  for (const contract of requiredContracts) {
    if (!config.contracts[contract]) {
      errors.push(`${contract.toUpperCase()}_CONTRACT_ID is required`);
    } else if (!config.contracts[contract].startsWith("C")) {
      errors.push(
        `${contract.toUpperCase()}_CONTRACT_ID must be a valid Stellar contract address (starts with 'C')`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get a specific contract address by name
 */
export const getContractAddress = (
  contractName: keyof StellarContractConfig["contracts"]
): string => {
  const config = getStellarContractConfig();
  return config.contracts[contractName];
};

// Re-export contract IDs and validation for convenience
export { CONTRACT_IDS, validateContractIds } from "./contract-ids";

/**
 * Network type definitions
 */
export const STELLAR_NETWORKS = {
  TESTNET: "testnet",
  FUTURENET: "futurenet",
  MAINNET: "mainnet",
} as const;

export type StellarNetworkType = (typeof STELLAR_NETWORKS)[keyof typeof STELLAR_NETWORKS];

/**
 * Contract names for easy reference
 */
export const STELLAR_CONTRACT_NAMES = {
  ESCROW_FACTORY: "escrowFactory",
  FEE_MANAGER: "feeManager",
  USER_REGISTRY: "userRegistry",
} as const;

/**
 * Default configuration (for reference/documentation)
 */
export const DEFAULT_STELLAR_CONFIG: StellarContractConfig = {
  network: STELLAR_NETWORKS.TESTNET,
  networkPassphrase: Networks.TESTNET,
  rpcUrl: "https://soroban-testnet.stellar.org",
  contracts: {
    escrowFactory: "",
    feeManager: "",
    userRegistry: "",
  },
  signerSecretKey: "",
};
