import { Keypair } from '@stellar/stellar-sdk';
import { supabase } from '@/lib/supabase/supabase';
import { encrypt, decrypt } from '@/utils/crypto.utils';
import { 
  Wallet, 
  CreateWalletDTO, 
  GenerateWalletResult,
  WalletType 
} from '@/types/wallet.types';
import { AppError } from '@/utils/AppError';

/**
 * Wallet Service
 * Manages wallet creation, retrieval, and operations for both invisible and external wallets
 */

/**
 * Generate a new invisible wallet for a user
 * Creates a Stellar keypair, encrypts the private key, and stores it in the database
 * @param userId - The user ID to associate the wallet with
 * @returns The created wallet with public and private keys
 */
export async function generateInvisibleWallet(userId: string): Promise<GenerateWalletResult> {
  try {
    // Generate a new Stellar keypair
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const privateKey = keypair.secret();

    // Encrypt the private key
    const encryptedPrivateKey = encrypt(privateKey);

    // Create wallet record in database
    const { data: wallet, error } = await supabase
      .from('wallets')
      .insert([
        {
          user_id: userId,
          address: publicKey,
          encrypted_private_key: encryptedPrivateKey,
          type: 'invisible' as WalletType,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create invisible wallet: ${error.message}`, 500);
    }

    return {
      wallet: wallet as Wallet,
      publicKey,
      privateKey, // Return private key only during generation
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error generating invisible wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Link an external wallet to a user
 * @param userId - The user ID to associate the wallet with
 * @param address - The wallet address to link
 * @returns The created wallet record
 */
export async function linkExternalWallet(userId: string, address: string): Promise<Wallet> {
  try {
    // Check if wallet already exists
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('address', address)
      .single();

    if (existingWallet) {
      throw new AppError('This wallet is already linked to an account', 400);
    }

    // Create external wallet record
    const { data: wallet, error } = await supabase
      .from('wallets')
      .insert([
        {
          user_id: userId,
          address: address,
          type: 'external' as WalletType,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to link external wallet: ${error.message}`, 500);
    }

    return wallet as Wallet;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error linking external wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Get all wallets for a user
 * @param userId - The user ID
 * @returns Array of wallets (without decrypted private keys)
 */
export async function getWalletsByUserId(userId: string): Promise<Wallet[]> {
  try {
    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new AppError(`Failed to fetch wallets: ${error.message}`, 500);
    }

    return (wallets || []) as Wallet[];
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error fetching wallets: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Get a wallet by address
 * @param address - The wallet address
 * @returns The wallet or null if not found
 */
export async function getWalletByAddress(address: string): Promise<Wallet | null> {
  try {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('address', address)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Wallet not found
      }
      throw new AppError(`Failed to fetch wallet: ${error.message}`, 500);
    }

    return wallet as Wallet;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error fetching wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Get the primary wallet for a user (first wallet)
 * @param userId - The user ID
 * @returns The primary wallet or null if no wallets exist
 */
export async function getPrimaryWallet(userId: string): Promise<Wallet | null> {
  try {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No wallet found
      }
      throw new AppError(`Failed to fetch primary wallet: ${error.message}`, 500);
    }

    return wallet as Wallet;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error fetching primary wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Decrypt the private key of an invisible wallet
 * WARNING: This should only be used for signing transactions, never expose to frontend
 * @param wallet - The wallet object with encrypted private key
 * @returns The decrypted private key
 */
export function decryptPrivateKey(wallet: Wallet): string {
  if (wallet.type !== 'invisible') {
    throw new AppError('Cannot decrypt private key of external wallet', 400);
  }

  if (!wallet.encrypted_private_key) {
    throw new AppError('Wallet does not have an encrypted private key', 400);
  }

  try {
    return decrypt(wallet.encrypted_private_key);
  } catch (error) {
    throw new AppError(
      `Failed to decrypt private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Delete a wallet
 * @param walletId - The wallet ID to delete
 */
export async function deleteWallet(walletId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', walletId);

    if (error) {
      throw new AppError(`Failed to delete wallet: ${error.message}`, 500);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error deleting wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

