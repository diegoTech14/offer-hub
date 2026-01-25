/**
 * @fileoverview Types for Balance Service
 */

export type Currency = 'USD' | 'XLM';

export const SUPPORTED_CURRENCIES: Currency[] = ['USD', 'XLM'];

export interface Balance {
  id: string;
  user_id: string;
  currency: string;
  available: number;
  held: number;
  created_at: string;
  updated_at: string;
}

export interface CreditReference {
  id: string;
  type: 'topup' | 'refund' | 'settlement' | 'withdrawal_refund' | 'withdrawal_cancel';
}

export interface DebitReference {
  id: string;
  type: 'withdrawal' | 'payment' | 'fee';
}

export interface BalanceTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit' | 'hold' | 'release' | 'settle_in' | 'settle_out';
  reference_id: string;
  reference_type: string;
  balance_before: number;
  balance_after: number;
  description?: string;
  created_at: string;
}