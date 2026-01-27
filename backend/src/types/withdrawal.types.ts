/**
 * @fileoverview Types for Withdrawal Orchestrator
 */

export enum WithdrawalStatus {
    WITHDRAWAL_CREATED = 'WITHDRAWAL_CREATED',
    WITHDRAWAL_PENDING_VERIFICATION = 'WITHDRAWAL_PENDING_VERIFICATION',
    PROVIDER_PROCESSING = 'PROVIDER_PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface Withdrawal {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    destination_email: string;
    status: WithdrawalStatus;
    created_at: Date;
    updated_at: Date;
    // Additional fields likely needed for DB sync, assume standard fields
}
