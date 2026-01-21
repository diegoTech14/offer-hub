/**
 * Wallet type definitions
 */

export type WalletType = 'invisible' | 'external';

export interface Wallet {
  id: string;
  user_id: string;
  address: string;
  encrypted_private_key?: string;
  type: WalletType;
  created_at: string;
}

export interface CreateWalletDTO {
  user_id: string;
  address: string;
  encrypted_private_key?: string;
  type: WalletType;
}

export interface WalletWithPrivateKey {
  id: string;
  user_id: string;
  address: string;
  private_key: string; // Decrypted private key
  type: WalletType;
  created_at: string;
}

export interface GenerateWalletResult {
  wallet: Wallet;
  publicKey: string;
  privateKey?: string; // Only returned for invisible wallets during generation
}


