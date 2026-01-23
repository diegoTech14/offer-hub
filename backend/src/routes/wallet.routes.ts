/**
 * @fileoverview Wallet routes for wallet management operations
 * @author Offer Hub Team
 */

import { Router } from "express";
import { disconnectWallet } from "@/controllers/wallet.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";

const router = Router();

// Wallet management routes
// All routes require authentication (applied at app level in index.ts)

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
