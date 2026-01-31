/**
 * @fileoverview Withdrawal State Machine for managing status transitions
 */

import { WithdrawalStatus } from "@/types/withdrawal.types";
import { AppError } from "@/utils/AppError";

export class WithdrawalStateMachine {
    private static readonly transitions: Record<WithdrawalStatus, WithdrawalStatus[]> = {
        [WithdrawalStatus.PENDING]: [WithdrawalStatus.PROCESSING, WithdrawalStatus.CANCELLED, WithdrawalStatus.FAILED],
        [WithdrawalStatus.PROCESSING]: [WithdrawalStatus.COMMITTED, WithdrawalStatus.FAILED],
        [WithdrawalStatus.COMMITTED]: [],
        [WithdrawalStatus.FAILED]: [],
        [WithdrawalStatus.CANCELLED]: [],
    };

    /**
     * Validates if a transition from current status to next status is allowed
     * @param currentStatus - Current withdrawal status
     * @param nextStatus - Requested next status
     * @throws AppError if transition is not allowed
     */
    static validateTransition(currentStatus: WithdrawalStatus, nextStatus: WithdrawalStatus): void {
        const allowedTransitions = this.transitions[currentStatus] || [];

        if (!allowedTransitions.includes(nextStatus)) {
            throw new AppError(
                `Invalid status transition from ${currentStatus} to ${nextStatus}`,
                400,
                'INVALID_STATUS_TRANSITION'
            );
        }
    }

    /**
     * Checks if a transition is valid without throwing
     * @param currentStatus - Current withdrawal status
     * @param nextStatus - Requested next status
     * @returns boolean
     */
    static canTransition(currentStatus: WithdrawalStatus, nextStatus: WithdrawalStatus): boolean {
        const allowedTransitions = this.transitions[currentStatus] || [];
        return allowedTransitions.includes(nextStatus);
    }
}
