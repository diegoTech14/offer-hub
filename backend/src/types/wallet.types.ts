/**
 * Wallet type definitions
 */

export type WalletType = 'invisible' | 'external';
export type WalletProvider = 'freighter' | 'albedo' | 'rabet' | 'xbull' | 'other';

export interface Wallet {
  id: string;
  user_id: string;
  address: string;
  encrypted_private_key?: string;
  type: WalletType;
  provider?: WalletProvider;
  is_primary: boolean;
  created_at: string;
}

export interface CreateWalletDTO {
  user_id: string;
  address: string;
  encrypted_private_key?: string;
  type: WalletType;
  provider?: WalletProvider;
  is_primary?: boolean;
}

export interface ConnectExternalWalletDTO {
  public_key: string;
  provider: WalletProvider;
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

/**
 * Safe wallet details for API response (never includes enc_private_key).
 * GET /api/v1/wallets/:id response shape.
 */
export interface WalletDetailsResponse {
  id: string;
  public_key: string;
  type: WalletType;
  provider: string; // "internal" for invisible, or freighter/albedo/rabet/xbull/other for external
  is_primary: boolean;
  created_at: string;
}


