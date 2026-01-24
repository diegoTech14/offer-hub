import { Keypair, StrKey, Horizon } from "@stellar/stellar-sdk";
import { supabase } from "@/lib/supabase/supabase";
import { encrypt, decrypt } from "@/utils/crypto.utils";
import {
  Wallet,
  CreateWalletDTO,
  GenerateWalletResult,
  WalletType,
} from "@/types/wallet.types";
import { AppError } from "@/utils/AppError";

/**
 * Wallet Service
 * Manages wallet creation, retrieval, and operations for both invisible and external wallets
 */

/**
 * Generate a new invisible wallet for a user
 * Creates a Stellar keypair, encrypts the private key, and stores it in the database
 * @param userId - The user ID to associate the wallet with
 * @returns The created wallet with address
 */
export async function generateInvisibleWallet(
  userId: string,
): Promise<GenerateWalletResult> {
  try {
    // Generate a new Stellar keypair
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const privateKey = keypair.secret();

    // Encrypt the private key
    const encryptedPrivateKey = encrypt(privateKey);

    // Create wallet record in database
    const { data: wallet, error } = await supabase
      .from("wallets")
      .insert([
        {
          user_id: userId,
          address: publicKey,
          encrypted_private_key: encryptedPrivateKey,
          type: "invisible" as WalletType,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to create invisible wallet: ${error.message}`,
        500,
      );
    }

    return {
      wallet: wallet as Wallet,
      publicKey,
      privateKey, // Return private key only during generation
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error generating regular wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
}

/**
 * Link an external wallet to a user
 * @param userId - The user ID to associate the wallet with
 * @param address - The wallet address to link
 * @returns The created wallet record
 */
export async function linkExternalWallet(
  userId: string,
  address: string,
): Promise<Wallet> {
  try {
    // Check if wallet already exists
    const { data: existingWallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("address", address)
      .single();

    if (existingWallet) {
      throw new AppError("This wallet is already linked to an account", 400);
    }

    // Create external wallet record
    const { data: wallet, error } = await supabase
      .from("wallets")
      .insert([
        {
          user_id: userId,
          address: address,
          type: "external" as WalletType,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to link external wallet: ${error.message}`,
        500,
      );
    }

    return wallet as Wallet;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error linking external wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
}

/**
 * Connect an external wallet to a user with full validation
 * Validates Stellar public key format and checks for duplicates
 * @param userId - The user ID to associate the wallet with
 * @param publicKey - The Stellar public key (must start with 'G' and be 56 characters)
 * @param provider - The wallet provider (freighter, albedo, rabet, xbull, other)
 * @returns The created wallet record
 */
export async function connectExternalWallet(
  userId: string,
  publicKey: string,
  provider: string,
): Promise<Wallet> {
  try {
    // Validate Stellar public key format
    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      throw new AppError("Invalid Stellar public key format", 400);
    }

    // Validate provider
    const validProviders = ["freighter", "albedo", "rabet", "xbull", "other"];
    if (!validProviders.includes(provider)) {
      throw new AppError(
        `Invalid provider. Must be one of: ${validProviders.join(", ")}`,
        400,
      );
    }

    // Check if public key is already registered by ANY user
    const { data: existingWallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("address", publicKey)
      .single();

    if (existingWallet) {
      throw new AppError("This wallet address is already registered", 409);
    }

    // Create external wallet record
    const { data: wallet, error } = await supabase
      .from("wallets")
      .insert([
        {
          user_id: userId,
          address: publicKey,
          type: "external" as WalletType,
          provider: provider,
          is_primary: false, // Default to false as per requirements
        },
      ])
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to connect external wallet: ${error.message}`,
        500,
      );
    }

    return wallet as Wallet;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error connecting external wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
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
      .from("wallets")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new AppError(`Failed to fetch wallets: ${error.message}`, 500);
    }

    return (wallets || []) as Wallet[];
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error fetching wallets: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
}

/**
 * Get a wallet by address
 * @param address - The wallet address
 * @returns The wallet or null if not found
 */
export async function getWalletByAddress(
  address: string,
): Promise<Wallet | null> {
  try {
    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("address", address)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Wallet not found
      }
      throw new AppError(`Failed to fetch wallet: ${error.message}`, 500);
    }

    return wallet as Wallet;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error fetching wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
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
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No wallet found
      }
      throw new AppError(
        `Failed to fetch primary wallet: ${error.message}`,
        500,
      );
    }

    return wallet as Wallet;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error fetching primary wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
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
  if (wallet.type !== "invisible") {
    throw new AppError("Cannot decrypt private key of external wallet", 400);
  }

  if (!wallet.encrypted_private_key) {
    throw new AppError("Wallet does not have an encrypted private key", 400);
  }

  try {
    return decrypt(wallet.encrypted_private_key);
  } catch (error) {
    throw new AppError(
      `Failed to decrypt private key: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
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
      .from("wallets")
      .delete()
      .eq("id", walletId);

    if (error) {
      throw new AppError(`Failed to delete wallet: ${error.message}`, 500);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error deleting wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
}

/**
 * Get a wallet by ID
 * @param walletId - The wallet ID
 * @returns The wallet or null if not found
 */
export async function getWalletById(walletId: string): Promise<Wallet | null> {
  try {
    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", walletId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Wallet not found
      }
      throw new AppError(`Failed to fetch wallet: ${error.message}`, 500);
    }

    return wallet as Wallet;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error fetching wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
}

/**
 * Disconnect (remove) an external wallet from a user's account
 * Validates ownership, type, and ensures user has at least one wallet remaining
 * @param walletId - The wallet ID to disconnect
 * @param userId - The authenticated user's ID
 * @throws AppError with appropriate status codes for various error conditions
 */
export async function disconnectWallet(
  walletId: string,
  userId: string,
): Promise<void> {
  try {
    // 1. Fetch the wallet
    const wallet = await getWalletById(walletId);

    if (!wallet) {
      throw new AppError("Wallet not found", 404, "WALLET_NOT_FOUND");
    }

    // 2. Verify ownership
    if (wallet.user_id !== userId) {
      throw new AppError(
        "You do not have permission to disconnect this wallet",
        403,
        "FORBIDDEN",
      );
    }

    // 3. Validate wallet type (only external wallets can be disconnected)
    if (wallet.type !== "external") {
      throw new AppError(
        "Cannot disconnect system-generated invisible wallets",
        400,
        "INVALID_WALLET_TYPE",
      );
    }

    // 4. Get all user wallets to check if this is the only one
    const userWallets = await getWalletsByUserId(userId);

    if (userWallets.length <= 1) {
      throw new AppError(
        "Cannot disconnect your only wallet. You must have at least one wallet.",
        400,
        "LAST_WALLET",
      );
    }

    // 5. Check if this is the primary wallet (earliest created)
    const sortedWallets = [...userWallets].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const isPrimary = sortedWallets[0].id === walletId;

    // 6. Delete the wallet
    await deleteWallet(walletId);

    // Note: If the deleted wallet was primary, the next oldest wallet automatically becomes primary
    // since primary is determined by created_at ordering in getPrimaryWallet
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Error disconnecting wallet: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
}

// Internal memory cache for wallet balances
// Key: `wallet_balance:${walletId}`
// Value: { data: any, expiresAt: number }
const balanceCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

/**
 * Get real-time Stellar balance for a specific wallet
 * Uses Horizon API and implements 30s caching
 * @param walletId - The UUID of the wallet
 * @param userId - The UUID of the authenticated user
 * @returns Object containing public key, balances, and timestamp
 */
export async function getStellarBalance(
  walletId: string,
  userId: string,
): Promise<any> {
  const cacheKey = `wallet_balance:${walletId}`;
  const now = Date.now();

  // 1. Check Cache (but still validate ownership)
  const cached = balanceCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    // Fetch wallet to confirm it still exists and is owned by this user
    const wallet = await getWalletById(walletId);

    if (!wallet) {
      // Wallet was deleted; invalidate cache and report not found
      balanceCache.delete(cacheKey);
      throw new AppError("Wallet not found", 404, "WALLET_NOT_FOUND");
    }

    if (wallet.user_id !== userId) {
      // Ownership changed; invalidate cache and deny access
      balanceCache.delete(cacheKey);
      throw new AppError("Access denied", 403, "FORBIDDEN");
    }

    // Wallet exists and is still owned by this user; return cached balance
    return cached.data;
  }

  try {
    // 2. Fetch Wallet & Verify Ownership
    const wallet = await getWalletById(walletId);

    if (!wallet) {
      throw new AppError("Wallet not found", 404, "WALLET_NOT_FOUND");
    }

    if (wallet.user_id !== userId) {
      throw new AppError("Access denied", 403, "FORBIDDEN");
    }

    // 3. Query Horizon API
    // Defaults to public Horizon instance
    const server = new Horizon.Server("https://horizon.stellar.org");
    let account: Horizon.AccountResponse;

    try {
      account = await server.loadAccount(wallet.address);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        throw new AppError(
          "Account not found on Stellar network",
          404,
          "STELLAR_ACCOUNT_NOT_FOUND",
        );
      }
      if (err.response && err.response.status === 429) {
        throw new AppError(
          "Rate limit exceeded from Stellar Horizon",
          429,
          "RATE_LIMIT_EXCEEDED",
        );
      }
      throw err;
    }

    // 4. Format Response
    const responseData = {
      wallet_id: wallet.id,
      public_key: wallet.address,
      balances: account.balances.map((b: any) => ({
        asset_type: b.asset_type,
        asset_code: b.asset_code || "XLM",
        asset_issuer: b.asset_issuer,
        balance: b.balance,
      })),
      last_updated: new Date().toISOString(),
    };

    // 5. Update Cache
    balanceCache.set(cacheKey, {
      data: responseData,
      expiresAt: now + CACHE_TTL_MS,
    });

    return responseData;
  } catch (error) {
    if (error instanceof AppError) throw error;
    // Handle generic errors (network timeout etc)
    throw new AppError(
      `Error fetching Stellar balance: ${error instanceof Error ? error.message : "Unknown error"}`,
      503,
    );
  }
}
