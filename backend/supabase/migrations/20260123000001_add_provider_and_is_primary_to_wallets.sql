-- ============================================
-- Migration: Add provider and is_primary to wallets table
-- ============================================
-- Adds provider field for external wallets (freighter, albedo, etc.)
-- Adds is_primary field to mark the primary wallet for a user
-- ============================================

-- Add provider column for external wallets
ALTER TABLE wallets ADD COLUMN provider TEXT CHECK (provider IN ('freighter', 'albedo', 'rabet', 'xbull', 'other'));

-- Add is_primary column to mark primary wallet
ALTER TABLE wallets ADD COLUMN is_primary BOOLEAN DEFAULT FALSE;

-- Create index for faster queries on primary wallets
CREATE INDEX idx_wallets_user_primary ON wallets(user_id, is_primary);

-- Comments for documentation
COMMENT ON COLUMN wallets.provider IS 'Wallet provider for external wallets: freighter, albedo, rabet, xbull, or other';
COMMENT ON COLUMN wallets.is_primary IS 'Indicates if this is the primary wallet for the user';
