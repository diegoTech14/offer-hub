/**
 * Blockchain Service
 * Handles REAL integration with Stellar blockchain contracts
 * Uses stellar-sdk to interact with deployed contracts
 */

import { 
  VerificationLevel, 
  UserBlockchainProfile, 
  BlockchainVerificationMetadata,
  BlockchainVerificationResult 
} from '@/types/blockchain.types';
import { AppError } from '@/utils/AppError';
import * as StellarSdk from '@stellar/stellar-sdk';

// Contract address from environment
const USER_REGISTRY_CONTRACT_ID = process.env.USER_REGISTRY_CONTRACT_ID || '';
const STELLAR_ADMIN_SECRET_KEY = process.env.STELLAR_ADMIN_SECRET_KEY || '';
const STELLAR_RPC_URL = process.env.STELLAR_RPC_URL || 'https://rpc-futurenet.stellar.org:443';
const STELLAR_NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Future Network ; October 2022';

// Initialize Soroban RPC Server
const getSorobanServer = () => {
  return new StellarSdk.rpc.Server(STELLAR_RPC_URL, {
    allowHttp: STELLAR_RPC_URL.includes('http://'),
  });
};

/**
 * Register user on Stellar blockchain
 * Calls UserRegistry contract to verify user
 * @param userId - Internal user ID from database
 * @param walletAddress - Stellar wallet address
 * @param verificationLevel - Initial verification level (default: BASIC)
 * @returns Blockchain verification result
 */
export async function registerUserOnBlockchain(
  userId: string,
  walletAddress: string,
  verificationLevel: VerificationLevel = VerificationLevel.BASIC
): Promise<BlockchainVerificationResult> {
  try {
    // Validate inputs
    if (!walletAddress) {
      throw new AppError('Wallet address is required', 400);
    }

    // Validate contract configuration
    if (!USER_REGISTRY_CONTRACT_ID || !STELLAR_ADMIN_SECRET_KEY) {
      throw new AppError(
        'Blockchain integration not configured. Set USER_REGISTRY_CONTRACT_ID and STELLAR_ADMIN_SECRET_KEY in environment variables.',
        500
      );
    }

    // Create metadata
    const metadata: BlockchainVerificationMetadata = {
      userId,
      verifiedAt: new Date().toISOString(),
      method: 'email_registration',
    };

    // Calculate expiration (1 year from now)
    const expiresAt = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

    console.log(`[Blockchain] Registering user on Stellar:`, {
      walletAddress,
      verificationLevel,
      expiresAt,
      contractId: USER_REGISTRY_CONTRACT_ID,
    });

    try {
      // Load admin keypair
      const adminKeypair = StellarSdk.Keypair.fromSecret(STELLAR_ADMIN_SECRET_KEY);
      const server = getSorobanServer();

      console.log(`[Blockchain] Loading admin account...`);
      
      // Load admin account from Soroban RPC
      const adminAccount = await server.getAccount(adminKeypair.publicKey());

      console.log(`[Blockchain] Building contract call...`);

      // Build contract instance
      const contract = new StellarSdk.Contract(USER_REGISTRY_CONTRACT_ID);
      
      // Contract signature: verify_user(admin, user, level, expires_at, metadata)
      console.log(`[Blockchain] Building params: admin, user, level, expires_at, metadata`);
      const params = [
        new StellarSdk.Address(adminKeypair.publicKey()).toScVal(),  // admin (who signs)
        new StellarSdk.Address(walletAddress).toScVal(),             // user (to verify)
        StellarSdk.xdr.ScVal.scvU32(verificationLevel),              // level
        StellarSdk.xdr.ScVal.scvU64(StellarSdk.xdr.Uint64.fromString(String(expiresAt))), // expires_at
        StellarSdk.xdr.ScVal.scvString(JSON.stringify(metadata)),    // metadata
      ];

      // Build contract call operation
      const operation = contract.call('verify_user', ...params);

      // Build transaction
      let transaction = new StellarSdk.TransactionBuilder(adminAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      console.log(`[Blockchain] Simulating transaction...`);

      // Simulate transaction first
      const simulated = await server.simulateTransaction(transaction);
      
      if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
        console.error('[Blockchain] Simulation error:', simulated);
        throw new Error(`Simulation failed: ${JSON.stringify(simulated)}`);
      }

      console.log(`[Blockchain] Assembling transaction...`);

      // Prepare transaction with simulation results
      transaction = StellarSdk.rpc.assembleTransaction(transaction, simulated).build();

      // Sign transaction
      transaction.sign(adminKeypair);

      console.log(`[Blockchain] Sending transaction...`);

      // Submit transaction
      const sendResponse = await server.sendTransaction(transaction);

      console.log(`[Blockchain] Transaction sent:`, sendResponse.hash);

      // Wait for confirmation
      console.log(`[Blockchain] Waiting for confirmation...`);
      let getResponse = await server.getTransaction(sendResponse.hash);
      let attempts = 0;
      
      while (getResponse.status === 'NOT_FOUND' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        getResponse = await server.getTransaction(sendResponse.hash);
        attempts++;
      }

      if (getResponse.status === 'SUCCESS') {
        console.log(`[Blockchain] ✅ Transaction confirmed:`, sendResponse.hash);
        return {
          success: true,
          transactionHash: sendResponse.hash,
          verificationLevel,
        };
      } else {
        console.error(`[Blockchain] Transaction status:`, getResponse.status);
        throw new Error(`Transaction failed with status: ${getResponse.status}`);
      }
    } catch (txError) {
      console.error('[Blockchain] Transaction failed:', txError);
      // MUST verify on blockchain - throw error to block registration
      throw new AppError(
        `❌ Blockchain verification REQUIRED. Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown error'}`,
        500
      );
    }
  } catch (error) {
    console.error('[Blockchain] Error registering user:', error);
    // MUST verify on blockchain - throw error to block registration
    throw new AppError(
      `❌ Blockchain verification REQUIRED: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Get user verification status from blockchain
 * @param walletAddress - Stellar wallet address
 * @returns User profile from blockchain or null if not found
 */
export async function getUserVerificationStatus(
  walletAddress: string
): Promise<UserBlockchainProfile | null> {
  try {
    if (!USER_REGISTRY_CONTRACT_ID) {
      console.warn('USER_REGISTRY_CONTRACT_ID not configured');
      return null;
    }

    // TODO: Call actual Stellar contract to get user profile
    // This would query the UserRegistry contract

    console.log(`[Blockchain] Fetching verification status for:`, walletAddress);

    // Placeholder return (replace with actual blockchain query)
    return {
      address: walletAddress,
      verification_level: VerificationLevel.BASIC,
      is_verified: true,
      is_blacklisted: false,
      metadata: JSON.stringify({
        verifiedAt: new Date().toISOString(),
        method: 'email_registration',
      }),
      verified_at: new Date(),
      expires_at: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)),
    };
  } catch (error) {
    console.error('[Blockchain] Error fetching verification status:', error);
    return null;
  }
}

/**
 * Upgrade user verification level on blockchain
 * @param walletAddress - Stellar wallet address
 * @param newLevel - New verification level
 * @returns Success status
 */
export async function upgradeUserVerification(
  walletAddress: string,
  newLevel: VerificationLevel
): Promise<boolean> {
  try {
    if (!USER_REGISTRY_CONTRACT_ID || !STELLAR_ADMIN_SECRET_KEY) {
      throw new AppError('Blockchain configuration missing', 500);
    }

    // TODO: Call actual Stellar contract to upgrade verification
    console.log(`[Blockchain] Upgrading user verification:`, { walletAddress, newLevel });

    return true;
  } catch (error) {
    console.error('[Blockchain] Error upgrading verification:', error);
    throw new AppError(
      `Failed to upgrade verification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Check if blockchain integration is enabled
 */
export function isBlockchainEnabled(): boolean {
  return Boolean(USER_REGISTRY_CONTRACT_ID && STELLAR_ADMIN_SECRET_KEY);
}

