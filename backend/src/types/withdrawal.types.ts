/**
 * @fileoverview Withdrawal types and enums
 */

export enum WithdrawalStatus {
    PENDING = 'WITHDRAWAL_PENDING',
    PROCESSING = 'WITHDRAWAL_PROCESSING',
    COMMITTED = 'WITHDRAWAL_COMMITTED',
    FAILED = 'WITHDRAWAL_FAILED',
    CANCELLED = 'WITHDRAWAL_CANCELLED',
}

export interface Withdrawal {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: WithdrawalStatus;
    external_payout_id?: string;
    created_at: string;
    updated_at: string;
}

export interface WithdrawalAuditLog {
    id: string;
    withdrawal_id: string;
    from_status: WithdrawalStatus;
    to_status: WithdrawalStatus;
    created_at: string;
    metadata?: any;
}
