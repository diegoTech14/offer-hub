-- Add verification fields to users table for blockchain integration

-- Add verification level (matches Stellar UserRegistry contract)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0;

-- Add flag to track blockchain registration status
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_on_blockchain BOOLEAN DEFAULT false;

-- Add metadata for verification details
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_metadata JSONB;

-- Add timestamp for when verification occurred
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Add index on verification_level for faster queries
CREATE INDEX IF NOT EXISTS idx_users_verification_level ON users(verification_level);

-- Add index on verified_on_blockchain
CREATE INDEX IF NOT EXISTS idx_users_verified_on_blockchain ON users(verified_on_blockchain);

-- Add comments
COMMENT ON COLUMN users.verification_level IS 'Verification level from Stellar blockchain: 0=NONE, 1=BASIC, 2=VERIFIED, 3=PREMIUM, 4=ENTERPRISE';
COMMENT ON COLUMN users.verified_on_blockchain IS 'Whether user is registered on Stellar UserRegistry contract';
COMMENT ON COLUMN users.verification_metadata IS 'Additional verification data from blockchain (JSON)';
COMMENT ON COLUMN users.verified_at IS 'Timestamp when user was verified on blockchain';

