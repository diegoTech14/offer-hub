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

  /**
   * Retrieves user balances by currency.
   * @param userId - The user ID to get balances for
   * @param currency - Optional currency filter (USD, XLM)
   * @returns Array of balance objects with formatted amounts
   */
  async getUserBalances(
    userId: string,
    currency?: string
  ): Promise<Array<{
    currency: string;
    available: string;
    held: string;
    total: string;
  }>> {
    const correlationId = crypto.randomUUID();
    
    try {
      logger.info(
        `[BalanceService] Starting getUserBalances ${correlationId} - User: ${userId}, Currency: ${currency || 'all'}`
      );

      // 1. Validation
      if (!validateUUID(userId)) {
        throw new BadRequestError("Invalid user ID format");
      }

      if (currency && !SUPPORTED_CURRENCIES.includes(currency as Currency)) {
        throw new ValidationError(`Currency ${currency} is not supported. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`);
      }

      // 2. Build query
      let query = supabase
        .from('balances')
        .select('currency, available, held')
        .eq('user_id', userId);

      // 3. Apply currency filter if provided
      if (currency) {
        query = query.eq('currency', currency);
      }

      // 4. Execute query
      const { data, error } = await query;

      if (error) {
        logger.error(`[BalanceService] Database Error ${correlationId}`, error);
        throw new InternalServerError(`Failed to retrieve balances: ${error.message}`);
      }

      // 5. Transform data to response format
      const balances = (data || []).map((balance) => {
        const available = Number(balance.available) || 0;
        const held = Number(balance.held) || 0;
        const total = available + held;

        return {
          currency: balance.currency,
          available: available.toFixed(2),
          held: held.toFixed(2),
          total: total.toFixed(2),
        };
      });

      logger.info(`[BalanceService] Success ${correlationId} - Found ${balances.length} balance(s)`);

      return balances;

    } catch (err: any) {
      if (err instanceof ValidationError || err instanceof BadRequestError || err instanceof InternalServerError) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }
}

export const balanceService = new BalanceService();
