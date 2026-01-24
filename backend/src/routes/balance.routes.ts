/**
 * @fileoverview Balance routes for balance retrieval operations
 * @author Offer Hub Team
 */

import { Router } from "express";
import { getBalances } from "@/controllers/balance.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";

const router = Router();

/**
 * GET /api/v1/balances
 * Retrieve authenticated user's balance breakdown by currency
 * 
 * Query Parameters:
 * - currency (optional): Filter by currency (USD, XLM)
 * 
 * Authentication: Required (JWT)
 * 
 * Returns:
 * - 200 OK: Array of balance objects
 * - 400 Bad Request: Invalid currency parameter
 * - 401 Unauthorized: Missing or invalid JWT token
 */
router.get("/", authenticateToken(), getBalances);

export default router;
