/**
 * User verification types for blockchain integration
 */

export enum VerificationLevel {
  NONE = 0,
  BASIC = 1,
  VERIFIED = 2,
  PREMIUM = 3,
  ENTERPRISE = 4,
}

export interface UserVerificationStatus {
  verification_level: VerificationLevel;
  verified_on_blockchain: boolean;
  verified_at?: string;
  verification_metadata?: {
    transactionHash?: string;
    verifiedAt?: string;
    method?: 'email_registration' | 'wallet_connection' | 'manual_verification';
  };
}

export interface VerificationBadgeConfig {
  level: VerificationLevel;
  label: string;
  icon: string;
  gradient: string;
  textColor: string;
  description: string;
}

export const VERIFICATION_CONFIGS: Record<VerificationLevel, VerificationBadgeConfig> = {
  [VerificationLevel.NONE]: {
    level: VerificationLevel.NONE,
    label: 'Not Verified',
    icon: 'shield-off',
    gradient: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-600',
    description: 'Complete registration to verify your account',
  },
  [VerificationLevel.BASIC]: {
    level: VerificationLevel.BASIC,
    label: 'Verified',
    icon: 'shield-check',
    gradient: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    description: 'Verified on Stellar Network',
  },
  [VerificationLevel.VERIFIED]: {
    level: VerificationLevel.VERIFIED,
    label: 'Identity Verified',
    icon: 'badge-check',
    gradient: 'from-amber-500 to-yellow-500',
    textColor: 'text-amber-600',
    description: 'Identity verified with documents',
  },
  [VerificationLevel.PREMIUM]: {
    level: VerificationLevel.PREMIUM,
    label: 'Premium Member',
    icon: 'sparkles',
    gradient: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-600',
    description: 'Premium verified member',
  },
  [VerificationLevel.ENTERPRISE]: {
    level: VerificationLevel.ENTERPRISE,
    label: 'Enterprise',
    icon: 'building',
    gradient: 'from-indigo-600 to-blue-600',
    textColor: 'text-indigo-600',
    description: 'Enterprise verified account',
  },
};

