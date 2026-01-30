/**
 * @fileoverview Types for Withdrawal Service
 */

/**
 * Withdrawal status enum representing the lifecycle of a withdrawal
 */
export enum WithdrawalStatus {
  CREATED = 'CREATED',
  WITHDRAWAL_CREATED = 'WITHDRAWAL_CREATED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  WITHDRAWAL_PENDING_VERIFICATION = 'WITHDRAWAL_PENDING_VERIFICATION',
  FAILED = 'FAILED',
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
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
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
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
