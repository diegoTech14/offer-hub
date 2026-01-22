/**
 * Blockchain-related type definitions for Soroban contract interactions
 */

/**
 * Project record structure matching the contract's ProjectRecord
 */
export interface ProjectRecord {
  client_id: string;
  project_id: string;
  timestamp: number;
  recorded_at: number;
}

/**
 * Result of recording a project
 */
export interface RecordProjectResult {
  transactionHash: string;
  success: boolean;
}

/**
 * Error types for blockchain operations
 */
export class BlockchainError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'BlockchainError';
  }
}

export class ContractError extends BlockchainError {
  constructor(message: string, public contractErrorCode?: number) {
    super(message, 'CONTRACT_ERROR');
    this.name = 'ContractError';
  }
}

export class NetworkError extends BlockchainError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

export class ConfigurationError extends BlockchainError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}
