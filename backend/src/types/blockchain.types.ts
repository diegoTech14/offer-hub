/**
 * Blockchain integration types for Stellar/Soroban contracts
 */

export enum VerificationLevel {
  NONE = 0,
  BASIC = 1,
  VERIFIED = 2,
  PREMIUM = 3,
  ENTERPRISE = 4,
}

export interface UserBlockchainProfile {
  address: string;
  verification_level: VerificationLevel;
  is_verified: boolean;
  is_blacklisted: boolean;
  metadata: string;
  verified_at?: Date;
  expires_at?: Date;
}

export interface BlockchainVerificationMetadata {
  userId: string;
  verifiedAt: string;
  method: 'email_registration' | 'wallet_connection' | 'manual_verification';
  ipAddress?: string;
  userAgent?: string;
}

export interface BlockchainVerificationResult {
  success: boolean;
  transactionHash?: string;
  verificationLevel: VerificationLevel;
  error?: string;
}

