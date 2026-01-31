/**
 * @fileoverview Withdrawal Orchestrator for managing the withdrawal process
 */

import { supabase } from "@/lib/supabase/supabase";
import { Withdrawal, WithdrawalStatus } from "@/types/withdrawal.types";
import { WithdrawalStateMachine } from "./withdrawal.state-machine";
import { airtmPayoutClient } from "./airtm.client";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

export class WithdrawalOrchestrator {
    /**
     * Processes a pending withdrawal by creating and committing a payout in Airtm.
     * @param withdrawalId - The ID of the withdrawal to process
     * @returns Updated Withdrawal object
     */
    async processWithdrawal(withdrawalId: string): Promise<Withdrawal> {
        const correlationId = crypto.randomUUID();
        logger.info(`[WithdrawalOrchestrator] Starting processWithdrawal ${withdrawalId} (${correlationId})`);

        try {
            // 1. Validates withdrawal exists and belongs to valid state
            const { data: withdrawal, error: fetchError } = await supabase
                .from('withdrawals')
                .select('*, users(email)')
                .eq('id', withdrawalId)
                .single();

            if (fetchError || !withdrawal) {
                throw new AppError(`Withdrawal ${withdrawalId} not found`, 404, 'WITHDRAWAL_NOT_FOUND');
            }

            // 2. Validates state transition is allowed via WithdrawalStateMachine
            WithdrawalStateMachine.validateTransition(withdrawal.status as WithdrawalStatus, WithdrawalStatus.PROCESSING);

            // 3. Transitions to WITHDRAWAL_PROCESSING & creates audit log
            await this.updateStatus(withdrawalId, withdrawal.status as WithdrawalStatus, WithdrawalStatus.PROCESSING, correlationId);

            // 4. Calls AirtmPayoutClient.createPayout()
            const userEmail = (withdrawal.users as any)?.email;
            if (!userEmail) {
                throw new AppError('User email not found for withdrawal', 400, 'USER_EMAIL_MISSING');
            }

            let payoutResponse;
            try {
                payoutResponse = await airtmPayoutClient.createPayout(withdrawalId, withdrawal.amount, userEmail);
            } catch (airtmError: any) {
                logger.error(`[WithdrawalOrchestrator] Airtm createPayout error: ${airtmError.message}`);
                await this.handleAirtmError(withdrawalId, WithdrawalStatus.PROCESSING, airtmError);
                throw airtmError;
            }

            // 5. Calls AirtmPayoutClient.commitPayout() with received ID
            try {
                await airtmPayoutClient.commitPayout(payoutResponse.id);
            } catch (airtmError: any) {
                logger.error(`[WithdrawalOrchestrator] Airtm commitPayout error: ${airtmError.message}`);
                await this.handleAirtmError(withdrawalId, WithdrawalStatus.PROCESSING, airtmError);
                throw airtmError;
            }

            // 6. Transitions to WITHDRAWAL_COMMITTED & creates audit log
            const updatedWithdrawal = await this.updateStatus(
                withdrawalId,
                WithdrawalStatus.PROCESSING,
                WithdrawalStatus.COMMITTED,
                correlationId,
                { external_payout_id: payoutResponse.id }
            );

            logger.info(`[WithdrawalOrchestrator] Withdrawal ${withdrawalId} successfully committed`);
            return updatedWithdrawal;

        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(
                `Failed to process withdrawal: ${error.message}`,
                500,
                'WITHDRAWAL_PROCESSING_FAILED'
            );
        }
    }

    /**
     * Updates withdrawal status and creates an audit log entry
     */
    private async updateStatus(
        withdrawalId: string,
        fromStatus: WithdrawalStatus,
        toStatus: WithdrawalStatus,
        correlationId: string,
        additionalData: any = {}
    ): Promise<Withdrawal> {
        // Update withdrawal record
        const { data: updatedWithdrawal, error: updateError } = await supabase
            .from('withdrawals')
            .update({
                status: toStatus,
                ...additionalData,
                updated_at: new Date().toISOString()
            })
            .eq('id', withdrawalId)
            .select()
            .single();

        if (updateError) {
            throw new AppError(`Failed to update withdrawal status: ${updateError.message}`, 500);
        }

        // Create audit log entry
        const { error: logError } = await supabase
            .from('withdrawal_audit_logs')
            .insert({
                withdrawal_id: withdrawalId,
                from_status: fromStatus,
                to_status: toStatus,
                metadata: { correlationId, ...additionalData },
                created_at: new Date().toISOString()
            });

        if (logError) {
            // We log the error but don't fail the whole process if audit log fails
            logger.error(`[WithdrawalOrchestrator] Failed to create audit log: ${logError.message}`);
        }

        return updatedWithdrawal as Withdrawal;
    }

    /**
     * Handles Airtm API errors by transitioning to FAILED state
     */
    private async handleAirtmError(withdrawalId: string, currentStatus: WithdrawalStatus, error: any): Promise<void> {
        try {
            await this.updateStatus(withdrawalId, currentStatus, WithdrawalStatus.FAILED, 'ERROR_HANDLER', {
                error_message: error.message,
                error_context: 'AIRTM_API_FAILURE'
            });
        } catch (logError) {
            logger.error(`[WithdrawalOrchestrator] Failed to log Airtm error: ${logError}`);
        }
    }
}

export const withdrawalOrchestrator = new WithdrawalOrchestrator();
