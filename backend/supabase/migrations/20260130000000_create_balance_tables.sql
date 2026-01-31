-- ============================================
-- Migration: Create Balance Tables
-- ============================================
-- Creates the database tables for the balance service:
-- - balances: Stores user balance information per currency
-- - balance_transactions: Logs all balance changes with before/after snapshots
-- ============================================

-- ============================================
-- Table: balances
-- ============================================
-- Stores available and held amounts per user per currency
-- ============================================

CREATE TABLE IF NOT EXISTS balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  available DECIMAL(18, 8) NOT NULL DEFAULT 0,
  held DECIMAL(18, 8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, currency),
  CONSTRAINT positive_available CHECK (available >= 0),
  CONSTRAINT positive_held CHECK (held >= 0)
);

-- Indexes for balances table
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_balances_currency ON balances(currency);

-- Trigger for automatic updated_at
CREATE TRIGGER update_balances_updated_at
  BEFORE UPDATE ON balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: balance_transactions
-- ============================================
-- Logs all balance changes with before/after snapshots
-- Transaction types:
--   credit     - Add funds to available balance (top-up completed)
--   debit      - Remove funds from available balance (withdrawal completed)
--   hold       - Move funds from available to held (escrow start)
--   release    - Move funds from held to available (escrow cancel)
--   settle_in  - Receive funds from settlement (contract completed)
--   settle_out - Send funds via settlement (contract completed)
-- ============================================

CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  reference_id VARCHAR(255),
  reference_type VARCHAR(50),
  balance_before DECIMAL(18, 8) NOT NULL,
  balance_after DECIMAL(18, 8) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_type CHECK (type IN ('credit', 'debit', 'hold', 'release', 'settle_in', 'settle_out'))
);

-- Indexes for balance_transactions table
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_reference ON balance_transactions(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at);

-- ============================================
-- Documentation
-- ============================================

COMMENT ON TABLE balances IS 'Stores user balance information per currency with available and held amounts';
COMMENT ON COLUMN balances.id IS 'Unique identifier for the balance record';
COMMENT ON COLUMN balances.user_id IS 'Reference to the user who owns this balance';
COMMENT ON COLUMN balances.currency IS 'Currency code (e.g., USD, XLM)';
COMMENT ON COLUMN balances.available IS 'Available balance that can be used or withdrawn';
COMMENT ON COLUMN balances.held IS 'Balance held in escrow or pending transactions';
COMMENT ON COLUMN balances.created_at IS 'Timestamp when the balance record was created';
COMMENT ON COLUMN balances.updated_at IS 'Timestamp when the balance was last updated';

COMMENT ON TABLE balance_transactions IS 'Logs all balance changes with before/after snapshots for audit trail';
COMMENT ON COLUMN balance_transactions.id IS 'Unique identifier for the transaction record';
COMMENT ON COLUMN balance_transactions.user_id IS 'Reference to the user whose balance was affected';
COMMENT ON COLUMN balance_transactions.type IS 'Transaction type: credit, debit, hold, release, settle_in, settle_out';
COMMENT ON COLUMN balance_transactions.amount IS 'Amount involved in the transaction';
COMMENT ON COLUMN balance_transactions.currency IS 'Currency code for the transaction';
COMMENT ON COLUMN balance_transactions.reference_id IS 'External reference ID (e.g., payment ID, contract ID)';
COMMENT ON COLUMN balance_transactions.reference_type IS 'Type of the reference (e.g., payment, contract, withdrawal)';
COMMENT ON COLUMN balance_transactions.balance_before IS 'Balance snapshot before the transaction';
COMMENT ON COLUMN balance_transactions.balance_after IS 'Balance snapshot after the transaction';
COMMENT ON COLUMN balance_transactions.description IS 'Human-readable description of the transaction';
COMMENT ON COLUMN balance_transactions.created_at IS 'Timestamp when the transaction was recorded';

-- ============================================
-- Rollback Instructions (for manual rollback if needed)
-- ============================================
-- DROP TRIGGER IF EXISTS update_balances_updated_at ON balances;
-- DROP TABLE IF EXISTS balance_transactions;
-- DROP TABLE IF EXISTS balances;
-- ============================================
