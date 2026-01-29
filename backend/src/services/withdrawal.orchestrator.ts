import { supabase } from "../lib/supabase/supabase";
import { logger } from "../utils/logger";
import {
    BadRequestError,
    InternalServerError,
    ValidationError,
    InsufficientFundsError
} from "../utils/AppError";
import { validateUUID, validateEmail } from "../utils/validation";
import { balanceService } from "./balance.service";
import { airtmUserClient } from "../lib/airtm.client";
import { Withdrawal, WithdrawalStatus } from "../types/withdrawal.types";

export class WithdrawalOrchestrator {
    private readonly MIN_AMOUNT = 5;
    private readonly MAX_AMOUNT = 500;

    /**
     * Initiates the withdrawal process.
     * Validates request, checks eligibility, creates record, and holds funds.
     * @param userId - ID of the user withdrawing funds
     * @param amount - Amount to withdraw
     * @param currency - Currency code
     * @param destinationEmail - Email to send funds to
     * @returns Created Withdrawal object
     */
    async initiateWithdrawal(
        userId: string,
        amount: number,
        currency: string,
        destinationEmail: string
    ): Promise<Withdrawal> {
        const correlationId = crypto.randomUUID();
        let withdrawalId: string | undefined;

        try {
            logger.info(`[WithdrawalOrchestrator] Starting initiateWithdrawal ${correlationId} - User: ${userId}, Amount: ${amount} ${currency}`);

            // 1. Basic Validations
            if (!validateUUID(userId)) {
                throw new BadRequestError("Invalid user ID format");
            }

            if (!validateEmail(destinationEmail)) {
                throw new BadRequestError("Invalid destination email format");
            }

            if (amount < this.MIN_AMOUNT || amount > this.MAX_AMOUNT) {
                throw new ValidationError(`Amount must be between ${this.MIN_AMOUNT} and ${this.MAX_AMOUNT}`);
            }

            // 2. Check Sufficient Balance (Preliminary check)
            // Note: usage of balanceService.getUserBalances or let holdBalance handle it. 
            // The requirement says "Validates user has sufficient available balance"
            // calling getUserBalances is safer to fail fast before creating DB record.
            const balances = await balanceService.getUserBalances(userId, currency);
            const userBalance = balances.find(b => b.currency === currency);
            const available = userBalance ? Number(userBalance.available) : 0;

            if (available < amount) {
                throw new InsufficientFundsError(
                    "Insufficient available funds",
                    { userId, currency, requestedAmount: amount, available }
                );
            }

            // 3. Verify Airtm Eligibility
            const isEligible = await airtmUserClient.verifyUserEligibility(destinationEmail);
            if (!isEligible) {
                throw new ValidationError("User is not eligible for Airtm withdrawal with this email");
            }

            // 4. Create Withdrawal Record (Status: CREATED)
            const { data: withdrawal, error: createError } = await supabase
                .from('withdrawals')
                .insert({
                    user_id: userId,
                    amount: amount,
                    currency: currency,
                    destination_email: destinationEmail,
                    status: WithdrawalStatus.WITHDRAWAL_CREATED
                })
                .select()
                .single();

            if (createError || !withdrawal) {
                logger.error(`[WithdrawalOrchestrator] Failed to create withdrawal record ${correlationId}`, createError);
                throw new InternalServerError("Failed to create withdrawal record");
            }

            withdrawalId = withdrawal.id;

            // 5. Hold Balance
            // If this fails, we must rollback the withdrawal record (set to FAILED or delete)
            try {
                await balanceService.holdBalance(
                    userId,
                    amount,
                    currency,
                    { id: withdrawalId!, type: 'withdrawal' }, // Use 'withdrawal' as type for generic reference
                    `Withdrawal hold for ${withdrawalId}`
                );
            } catch (holdError) {
                logger.error(`[WithdrawalOrchestrator] Failed to hold balance ${correlationId}`, holdError);
                // Rollback: Update status to FAILED
                await this.updateWithdrawalStatus(withdrawalId!, WithdrawalStatus.FAILED);
                throw holdError;
            }

            // 6. Transition to PENDING_VERIFICATION
            try {
                await this.updateWithdrawalStatus(withdrawalId!, WithdrawalStatus.WITHDRAWAL_PENDING_VERIFICATION);
            } catch (updateError) {
                // Critical error: Funds held but status not updated.
                // In a real system we might need an admin alert or auto-refund. 
                // For now, we try to mark FAILED but the hold remains? 
                // Ideally we should release hold properly, but we don't have releaseHold yet.
                // We will log critical error.
                logger.error(`[WithdrawalOrchestrator] CRITICAL: Funds held but status update failed ${correlationId}`, updateError);
                throw new InternalServerError("Withdrawal processed but status update failed. Please contact support.");
            }

            // Return updated object
            // We can fetch it again or construct it. Let's fetch to be sure.
            const { data: updatedWithdrawal, error: fetchError } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('id', withdrawalId)
                .single();

            if (fetchError || !updatedWithdrawal) {
                throw new InternalServerError("Failed to retrieve updated withdrawal");
            }

            logger.info(`[WithdrawalOrchestrator] Success ${correlationId} - Withdrawal ${withdrawalId} initiated`);
            return updatedWithdrawal as Withdrawal;

        } catch (error: any) {
            // If basic validation failed, we just rethrow.
            // If step 4 failed, nothing to rollback.
            // If step 5 failed, we handled rollback inside.
            logger.error(`[WithdrawalOrchestrator] Error ${correlationId}`, error);
            throw error;
        }
    }

    private async updateWithdrawalStatus(id: string, status: WithdrawalStatus): Promise<void> {
        const { error } = await supabase
            .from('withdrawals')
            .update({ status, updated_at: new Date() })
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}

export const withdrawalOrchestrator = new WithdrawalOrchestrator();
