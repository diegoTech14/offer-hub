/**
 * @fileoverview Withdrawal types and enums
 */

/**
 * Withdrawal status enum representing the lifecycle of a withdrawal
 */
export enum WithdrawalStatus {
    // Workflow Issue #958
    PENDING = 'WITHDRAWAL_PENDING',
    WITHDRAWAL_PENDING = 'WITHDRAWAL_PENDING', // Alias
    PROCESSING = 'WITHDRAWAL_PROCESSING',
    WITHDRAWAL_PROCESSING = 'WITHDRAWAL_PROCESSING', // Alias
    COMMITTED = 'WITHDRAWAL_COMMITTED',
    WITHDRAWAL_COMMITTED = 'WITHDRAWAL_COMMITTED', // Alias
    FAILED = 'FAILED', // Key from main
    WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED', // Key from main and my FAILED value
    CANCELLED = 'WITHDRAWAL_CANCELLED',
    WITHDRAWAL_CANCELLED = 'WITHDRAWAL_CANCELLED', // Alias

    // Workflow from main/initiation
    CREATED = 'CREATED',
    WITHDRAWAL_CREATED = 'WITHDRAWAL_CREATED',
    PENDING_VERIFICATION = 'PENDING_VERIFICATION',
    WITHDRAWAL_PENDING_VERIFICATION = 'WITHDRAWAL_PENDING_VERIFICATION',
    WITHDRAWAL_CANCELED = 'WITHDRAWAL_CANCELED',
    WITHDRAWAL_REFUNDED = 'WITHDRAWAL_REFUNDED',
    WITHDRAWAL_COMPLETED = 'WITHDRAWAL_COMPLETED',
}

/**
 * Withdrawal record interface matching database schema
 */
export interface Withdrawal {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: WithdrawalStatus;
    external_payout_id?: string;
    destination_email?: string;
    cancellation_reason?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Audit log entry for withdrawal process
 */
export interface WithdrawalAuditLog {
    id: string;
    withdrawal_id: string;
    from_status: WithdrawalStatus;
    to_status: WithdrawalStatus;
    created_at: string;
    metadata?: any;
}

/**
 * State transition type for withdrawal state machine
 */
export interface WithdrawalStateTransition {
    from: WithdrawalStatus;
    to: WithdrawalStatus;
    allowed: boolean;
}

/**
 * Cancel withdrawal parameters
 */
export interface CancelWithdrawalParams {
    withdrawalId: string;
    reason?: string;
}

/**
 * Refund withdrawal parameters
 */
export interface RefundWithdrawalParams {
    withdrawalId: string;
}
