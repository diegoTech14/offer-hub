/**
 * Wallet type definitions for frontend
 */

export type WalletType = 'invisible' | 'external';

export interface Wallet {
  id: string;
  user_id: string;
  address: string;
  type: WalletType;
  created_at: string;
}

export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  error?: string;
}

export interface SignMessageResult {
  success: boolean;
  signature?: string;
  error?: string;
}


