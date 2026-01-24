/**
 * @fileoverview Balance controller handling balance retrieval operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types/auth.types";
import { balanceService } from "@/services/balance.service";
import { ValidationError, BadRequestError } from "@/utils/AppError";
import { buildListResponse } from "@/utils/responseBuilder";
import { SUPPORTED_CURRENCIES } from "@/types/balance.types";

/**
 * GET /api/v1/balances
 * Retrieve authenticated user's balance breakdown by currency
 * 
 * Query Parameters:
 * - currency (optional): Filter by currency (USD, XLM)
 * 
 * Returns:
 * - 200 OK: Array of balance objects with currency, available, held, and total
 * - 400 Bad Request: Invalid currency parameter
 * - 401 Unauthorized: Missing or invalid JWT token (handled by middleware)
 */
export const getBalances = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Guard check: ensure user is authenticated (middleware should handle this, but TypeScript needs this)
    if (!req.user) {
      throw new BadRequestError("Authentication required");
    }

    const { currency } = req.query;
    const userId = req.user.id;

    // Validate currency if provided
    if (currency) {
      const currencyStr = typeof currency === 'string' ? currency : String(currency);
      
      if (!SUPPORTED_CURRENCIES.includes(currencyStr as any)) {
        throw new ValidationError(
          `Invalid currency: ${currencyStr}. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`
        );
      }

      // Get balances with currency filter
      const balances = await balanceService.getUserBalances(userId, currencyStr);
      
      return res.status(200).json(
        buildListResponse(balances, "Balances retrieved successfully")
      );
    }

    // Get all balances
    const balances = await balanceService.getUserBalances(userId);
    
    return res.status(200).json(
      buildListResponse(balances, "Balances retrieved successfully")
    );
  } catch (error: any) {
    next(error);
  }
};
