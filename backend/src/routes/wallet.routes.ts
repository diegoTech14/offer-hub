/**
 * @fileoverview Wallet routes for wallet management operations
 * @author Offer Hub Team
 */

import { Router } from "express";
import {
  connectExternalWalletHandler,
  disconnectWallet,
  getWalletByIdHandler,
  getWalletsHandler,
} from "@/controllers/wallet.controller";
import { verifyToken } from "@/middlewares/auth.middleware";

const router = Router();

// Wallet management routes
// All routes require authentication (applied at app level in index.ts)

/**
 * GET /api/v1/wallets/:id
 * Get wallet details for the authenticated user (ownership validated).
 * Returns 404 if wallet not found, 403 if wallet belongs to another user.
 */
router.get("/:id", getWalletByIdHandler);

/**
 * GET /api/v1/wallets
 * List all wallets for authenticated user
 */
router.get("/", verifyToken, getWalletsHandler);

/**
 * POST /api/v1/wallets/external
 * Connect an external Stellar wallet to the authenticated user
 * Requires: JWT authentication
 * Body: { public_key: string, provider: string }
 */
router.post("/external", verifyToken, connectExternalWalletHandler);

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
router.delete("/:id", disconnectWallet);

export default router;
