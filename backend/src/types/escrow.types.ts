/**
 * Escrow-related type definitions for Soroban contract integration
 */

/**
 * Parameters required to create a new escrow contract
 */
export interface EscrowCreateParams {
  /** Client's Stellar wallet address */
  client: string;
  /** Freelancer's Stellar wallet address */
  freelancer: string;
  /** Amount in stroops (1 XLM = 10,000,000 stroops) */
  amount: bigint;
  /** Fee manager contract address */
  fee_manager: string;
  /** Unique salt for escrow deployment (32 bytes) */
  salt: Uint8Array;
}

/**
 * Response from escrow service after successful creation
 */
export interface EscrowServiceResponse {
  /** Address of the deployed escrow contract */
  address: string;
  /** Optional transaction ID for tracking */
  transaction_id?: string;
}
