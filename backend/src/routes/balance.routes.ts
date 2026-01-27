/**
 * @fileoverview Balance routes for balance retrieval operations
 * @author Offer Hub Team
 */

import { Router } from "express";
import { getBalances, getTransactionHistory } from "@/controllers/balance.controller";
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

/**
 * GET /api/v1/balances/transactions
 * Retrieve authenticated user's balance transaction history with filtering and pagination
 * 
 * Query Parameters:
 * - currency (optional): Filter by currency (USD, XLM)
 * - type (optional): Filter by transaction type (credit, debit, hold, release, settle_in, settle_out)
 * - from (optional): Start date filter (YYYY-MM-DD)
 * - to (optional): End date filter (YYYY-MM-DD)
 * - page (optional): Page number (default: 1)
 * - limit (optional): Items per page (default: 20, max: 100)
 * 
 * Authentication: Required (JWT)
 * 
 * Returns:
 * - 200 OK: Paginated transaction history
 * - 400 Bad Request: Invalid parameters
 * - 401 Unauthorized: Missing or invalid JWT token
 */
router.get("/transactions", authenticateToken(), getTransactionHistory);

export default router;
