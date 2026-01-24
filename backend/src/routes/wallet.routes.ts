/**
 * @fileoverview Wallet routes for wallet management operations
 * @author Offer Hub Team
 */

import { Router } from "express";
import { 
  connectExternalWalletHandler, 
  disconnectWallet,
  setPrimaryWallet
} from "@/controllers/wallet.controller";
import { verifyToken } from "@/middlewares/auth.middleware";

const router = Router();

// Wallet management routes
// All routes require authentication (applied at app level in index.ts)

/**
 * POST /api/v1/wallets/external
 * Connect an external Stellar wallet to the authenticated user
 * Requires: JWT authentication
 * Body: { public_key: string, provider: string }
 */
router.post("/external", verifyToken, connectExternalWalletHandler);

/**
 * PUT /api/v1/wallets/:id/primary
 * Set a wallet as the primary wallet for the authenticated user
 * - Requires valid JWT authentication
 * - Validates UUID format for :id parameter
 * - Uses database transaction for atomicity
 * - Sets is_primary = false on ALL user's wallets
 * - Sets is_primary = true on the selected wallet
 * - Returns 404 if wallet not found
 * - Returns 403 if wallet belongs to another user
 * - Returns 400 if invalid UUID format
 * - Returns 200 with updated wallet data on success
 */
router.put("/:id/primary", verifyToken, setPrimaryWallet);

/**
 * DELETE /api/v1/wallets/:id
 * Disconnect (remove) an external wallet from the authenticated user's account
 * - Requires valid JWT authentication
 * - Only allows deletion of type='external' wallets
 * - Cannot delete the user's only wallet
 * - Returns 404 if wallet not found
 * - Returns 403 if wallet belongs to another user
 * - Returns 400 if trying to delete invisible wallet or last wallet
 */
router.delete("/:id", verifyToken, disconnectWallet);

export default router;
