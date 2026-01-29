/**
 * @fileoverview Withdrawal Service for managing withdrawal operations
 */

import { supabase } from "../lib/supabase/supabase";
import {
  InternalServerError,
  ValidationError,
  BadRequestError,
  BusinessLogicError,
} from "../utils/AppError";
import { validateUUID } from "../utils/validation";
import { Withdrawal, WithdrawalStatus } from "../types/withdrawal.types";
import { WithdrawalStateMachine } from "../utils/withdrawal-state-machine";
import { balanceService } from "./balance.service";
import { emailService } from "./email.service";
import { logger } from "../utils/logger";

export class WithdrawalService {
  /**
   * Cancels a pending withdrawal and returns funds to user's available balance
   * @param withdrawalId - The UUID of the withdrawal to cancel
   * @param reason - Optional cancellation reason
   * @returns Updated Withdrawal object
   * @throws ValidationError if withdrawalId is invalid
   * @throws BadRequestError if withdrawal doesn't exist
   * @throws BusinessLogicError if cancellation is not allowed from current state
   */
  async cancelWithdrawal(
    withdrawalId: string,
    reason?: string
  ): Promise<Withdrawal> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[WithdrawalService] Starting cancelWithdrawal ${correlationId} - Withdrawal: ${withdrawalId}`
      );

      // 1. Validation
      if (!validateUUID(withdrawalId)) {
        throw new BadRequestError("Invalid withdrawal ID format");
      }

      // 2. Fetch withdrawal from database
      const { data: withdrawal, error: fetchError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("id", withdrawalId)
        .single();

      if (fetchError || !withdrawal) {
        logger.error(
          `[WithdrawalService] Fetch Error ${correlationId}`,
          fetchError
        );
        throw new BadRequestError(
          `Withdrawal not found with ID: ${withdrawalId}`
        );
      }

      const currentStatus = withdrawal.status as WithdrawalStatus;

      // 3. Validate state transition
      if (!WithdrawalStateMachine.canCancel(currentStatus)) {
        const validStates = [
          WithdrawalStatus.CREATED,
          WithdrawalStatus.PENDING_VERIFICATION,
        ];
        throw new BusinessLogicError(
          `Cannot cancel withdrawal from status ${currentStatus}. Only withdrawals in ${validStates.join(" or ")} status can be canceled.`,
          "INVALID_STATE_TRANSITION"
        );
      }

      // 4. Release funds back to available balance
      await balanceService.releaseBalance(
        withdrawal.user_id,
        withdrawal.amount,
        withdrawal.currency,
        {
          id: withdrawalId,
          type: "withdrawal_cancel",
        },
        reason || `Withdrawal canceled`
      );

      // 5. Update withdrawal status
      const { data: updatedWithdrawal, error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: WithdrawalStatus.WITHDRAWAL_CANCELED,
          cancellation_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId)
        .select()
        .single();

      if (updateError || !updatedWithdrawal) {
        logger.error(
          `[WithdrawalService] Update Error ${correlationId}`,
          updateError
        );
        throw new InternalServerError(
          `Failed to update withdrawal status: ${updateError?.message}`
        );
      }

      // 6. Create audit log entry
      await this.createAuditLog({
        withdrawalId,
        action: "CANCEL",
        previousStatus: currentStatus,
        newStatus: WithdrawalStatus.WITHDRAWAL_CANCELED,
        reason,
        correlationId,
      });

      logger.info(
        `[WithdrawalService] Success ${correlationId} - Withdrawal canceled`
      );

      return updatedWithdrawal as Withdrawal;
    } catch (err: any) {
      if (
        err instanceof ValidationError ||
        err instanceof BadRequestError ||
        err instanceof InternalServerError ||
        err instanceof BusinessLogicError
      ) {
        throw err;
      }
      throw new InternalServerError(
        `Unexpected error in withdrawal service: ${err.message}`
      );
    }
  }

  /**
   * Refunds a failed withdrawal and returns funds to user's available balance
   * @param withdrawalId - The UUID of the withdrawal to refund
   * @returns Updated Withdrawal object
   * @throws ValidationError if withdrawalId is invalid
   * @throws BadRequestError if withdrawal doesn't exist
   * @throws BusinessLogicError if refund is not allowed from current state
   */
  async refundWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[WithdrawalService] Starting refundWithdrawal ${correlationId} - Withdrawal: ${withdrawalId}`
      );

      // 1. Validation
      if (!validateUUID(withdrawalId)) {
        throw new BadRequestError("Invalid withdrawal ID format");
      }

      // 2. Fetch withdrawal from database
      const { data: withdrawal, error: fetchError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("id", withdrawalId)
        .single();

      if (fetchError || !withdrawal) {
        logger.error(
          `[WithdrawalService] Fetch Error ${correlationId}`,
          fetchError
        );
        throw new BadRequestError(
          `Withdrawal not found with ID: ${withdrawalId}`
        );
      }

      const currentStatus = withdrawal.status as WithdrawalStatus;

      // 3. Validate state transition
      if (!WithdrawalStateMachine.canRefund(currentStatus)) {
        throw new BusinessLogicError(
          `Cannot refund withdrawal from status ${currentStatus}. Only withdrawals in ${WithdrawalStatus.WITHDRAWAL_FAILED} status can be refunded.`,
          "INVALID_STATE_TRANSITION"
        );
      }

      // 4. Release funds back to available balance
      await balanceService.releaseBalance(
        withdrawal.user_id,
        withdrawal.amount,
        withdrawal.currency,
        {
          id: withdrawalId,
          type: "withdrawal_refund",
        },
        `Withdrawal refund - Failed withdrawal`
      );

      // 5. Update withdrawal status
      const { data: updatedWithdrawal, error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: WithdrawalStatus.WITHDRAWAL_REFUNDED,
          updated_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId)
        .select()
        .single();

      if (updateError || !updatedWithdrawal) {
        logger.error(
          `[WithdrawalService] Update Error ${correlationId}`,
          updateError
        );
        throw new InternalServerError(
          `Failed to update withdrawal status: ${updateError?.message}`
        );
      }

      // 6. Create audit log entry
      await this.createAuditLog({
        withdrawalId,
        action: "REFUND",
        previousStatus: currentStatus,
        newStatus: WithdrawalStatus.WITHDRAWAL_REFUNDED,
        correlationId,
      });

      // 7. Send notification email
      try {
        // Fetch user email
        const { data: user } = await supabase
          .from("users")
          .select("email")
          .eq("id", withdrawal.user_id)
          .single();

        if (user?.email) {
          await emailService.sendWithdrawalRefundEmail(
            user.email,
            withdrawal.amount,
            withdrawal.currency
          );
        }
      } catch (emailError) {
        // Log email error but don't fail the refund
        logger.error(
          `[WithdrawalService] Email Error ${correlationId}`,
          emailError
        );
      }

      logger.info(
        `[WithdrawalService] Success ${correlationId} - Withdrawal refunded`
      );

      return updatedWithdrawal as Withdrawal;
    } catch (err: any) {
      if (
        err instanceof ValidationError ||
        err instanceof BadRequestError ||
        err instanceof InternalServerError ||
        err instanceof BusinessLogicError
      ) {
        throw err;
      }
      throw new InternalServerError(
        `Unexpected error in withdrawal service: ${err.message}`
      );
    }
  }

  /**
   * Creates an audit log entry for withdrawal operations
   * @param params - Audit log parameters
   */
  private async createAuditLog(params: {
    withdrawalId: string;
    action: string;
    previousStatus: WithdrawalStatus;
    newStatus: WithdrawalStatus;
    reason?: string;
    correlationId: string;
  }): Promise<void> {
    try {
      await supabase.from("withdrawal_audit_logs").insert({
        withdrawal_id: params.withdrawalId,
        action: params.action,
        previous_status: params.previousStatus,
        new_status: params.newStatus,
        reason: params.reason || null,
        correlation_id: params.correlationId,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      // Log the error but don't fail the operation
      logger.error(
        `[WithdrawalService] Audit Log Error ${params.correlationId}`,
        error
      );
    }
  }
}

export const withdrawalService = new WithdrawalService();
