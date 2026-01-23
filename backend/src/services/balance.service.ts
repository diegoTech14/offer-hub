/**
 * @fileoverview Balance Service for managing user funds
 */

import { supabase } from "../lib/supabase/supabase";
import { 
  InternalServerError, 
  ValidationError, 
  BadRequestError 
} from "../utils/AppError";
import { validateUUID } from "../utils/validation";
import { 
  Balance, 
  Currency, 
  CreditReference, 
  SUPPORTED_CURRENCIES 
} from "../types/balance.types";
import { logger } from "../utils/logger"; 

export class BalanceService {
  /**
   * Adds funds to a user's available balance.
   * * @param userId - The user to credit
   * @param amount - Amount to credit (must be positive)
   * @param currency - Currency code (USD, XLM)
   * @param reference - Source of the credit
   * @param description - Optional description
   * @returns Updated Balance object
   */
  async creditAvailable(
    userId: string,
    amount: number,
    currency: string,
    reference: CreditReference,
    description?: string
  ): Promise<Balance> {
    const correlationId = crypto.randomUUID();
    
    try {
      logger.info(
        `[BalanceService] Starting creditAvailable ${correlationId} - User: ${userId}, Amount: ${amount} ${currency}`
      );

      // 1. Validation
      if (!validateUUID(userId)) {
        throw new BadRequestError("Invalid user ID format");
      }

      if (amount <= 0) {
        throw new ValidationError("Amount must be positive");
      }

      if (!SUPPORTED_CURRENCIES.includes(currency as Currency)) {
        throw new ValidationError(`Currency ${currency} is not supported`);
      }

      if (!reference.id || !reference.type) {
        throw new ValidationError("Invalid reference data");
      }

      // 2. Atomic Transaction (via RPC)
      // We rely on a database function to lock the row, update balance, 
      // AND insert the log in one go.
      const { data, error } = await supabase.rpc('credit_available_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_currency: currency,
        p_ref_id: reference.id,
        p_ref_type: reference.type,
        p_description: description || ''
      });

      if (error) {
        logger.error(`[BalanceService] RPC Error ${correlationId}`, error);
        throw new InternalServerError(`Balance credit failed: ${error.message}`);
      }

      if (!data) {
        throw new InternalServerError("Balance update failed: No data returned");
      }

      logger.info(`[BalanceService] Success ${correlationId} - New Balance: ${data.available}`);

      return data as Balance;

    } catch (err: any) {
      if (err instanceof ValidationError || err instanceof BadRequestError || err instanceof InternalServerError) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }
}

export const balanceService = new BalanceService();
