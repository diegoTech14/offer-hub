import { supabase } from '@/lib/supabase/supabase';
import { BalanceService as IBalanceService } from '@/types/withdrawal.types';
import {
  InternalServerError,
  BusinessLogicError,
  NotFoundError,
} from '@/utils/AppError';

/**
 * Balance Service
 * Manages user balances, holds, debits, and refunds
 */
export class BalanceService implements IBalanceService {
  /**
   * Debit available balance
   * Called when a withdrawal is successfully processed
   */
  async debitAvailable(
    userId: string,
    amount: number,
    referenceId: string
  ): Promise<void> {
    // Fetch current balance
    const { data: balance, error: fetchError } = await supabase
      .from('user_balances')
      .select('available_balance, held_balance')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(
          `Balance not found for user: ${userId}`,
          'BALANCE_NOT_FOUND'
        );
      }
      throw new InternalServerError('Error fetching user balance', fetchError);
    }

    // Validate sufficient balance
    if (balance.available_balance < amount) {
      throw new BusinessLogicError(
        'Insufficient available balance',
        'INSUFFICIENT_BALANCE'
      );
    }

    // Update balance - deduct from available
    const { error: updateError } = await supabase
      .from('user_balances')
      .update({
        available_balance: balance.available_balance - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new InternalServerError('Error debiting available balance', updateError);
    }

    // Record transaction
    await this.recordTransaction({
      user_id: userId,
      type: 'DEBIT',
      amount,
      reference_id: referenceId,
      description: 'Withdrawal processed successfully',
    });
  }

  /**
   * Release a hold on balance
   * Called after successful withdrawal to release the held amount
   */
  async releaseHold(userId: string, holdId: string): Promise<void> {
    // Fetch the hold
    const { data: hold, error: fetchError } = await supabase
      .from('balance_holds')
      .select('*')
      .eq('id', holdId)
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(
          `Active hold not found: ${holdId}`,
          'HOLD_NOT_FOUND'
        );
      }
      throw new InternalServerError('Error fetching hold', fetchError);
    }

    // Update hold status to RELEASED
    const { error: updateError } = await supabase
      .from('balance_holds')
      .update({
        status: 'RELEASED',
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', holdId);

    if (updateError) {
      throw new InternalServerError('Error releasing hold', updateError);
    }

    // Update user balance - reduce held balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_balances')
      .select('held_balance')
      .eq('user_id', userId)
      .single();

    if (balanceError) {
      throw new InternalServerError('Error fetching balance', balanceError);
    }

    const { error: balanceUpdateError } = await supabase
      .from('user_balances')
      .update({
        held_balance: Math.max(0, balance.held_balance - hold.amount),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (balanceUpdateError) {
      throw new InternalServerError('Error updating held balance', balanceUpdateError);
    }
  }

  /**
   * Initiate a refund
   * Called when a withdrawal fails - returns funds to user's available balance
   */
  async initiateRefund(
    userId: string,
    amount: number,
    withdrawalId: string
  ): Promise<void> {
    // Fetch current balance
    const { data: balance, error: fetchError } = await supabase
      .from('user_balances')
      .select('available_balance, held_balance')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(
          `Balance not found for user: ${userId}`,
          'BALANCE_NOT_FOUND'
        );
      }
      throw new InternalServerError('Error fetching user balance', fetchError);
    }

    // Create refund record
    const { error: refundError } = await supabase.from('refunds').insert({
      user_id: userId,
      withdrawal_id: withdrawalId,
      amount,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    });

    if (refundError) {
      throw new InternalServerError('Error creating refund record', refundError);
    }

    // Release hold and return funds to available balance
    const { error: updateError } = await supabase
      .from('user_balances')
      .update({
        available_balance: balance.available_balance + amount,
        held_balance: Math.max(0, balance.held_balance - amount),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new InternalServerError('Error processing refund', updateError);
    }

    // Update refund status to COMPLETED
    const { error: refundUpdateError } = await supabase
      .from('refunds')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('withdrawal_id', withdrawalId);

    if (refundUpdateError) {
      throw new InternalServerError('Error updating refund status', refundUpdateError);
    }

    // Record transaction
    await this.recordTransaction({
      user_id: userId,
      type: 'REFUND',
      amount,
      reference_id: withdrawalId,
      description: 'Refund for failed withdrawal',
    });
  }

  /**
   * Record a transaction
   */
  private async recordTransaction(transaction: {
    user_id: string;
    type: string;
    amount: number;
    reference_id: string;
    description: string;
  }): Promise<void> {
    const { error } = await supabase.from('transactions').insert({
      ...transaction,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Log but don't throw - transaction recording shouldn't break the main flow
      console.error('Error recording transaction:', error);
    }
  }
}
