-- Update users table to support email/password authentication

-- Add password_hash column (nullable to support wallet-only users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make wallet_address nullable (users can register with email without wallet initially)
ALTER TABLE users ALTER COLUMN wallet_address DROP NOT NULL;

-- Make email unique when not null (for email-based authentication)
CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE email IS NOT NULL;

-- Add index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Add comment explaining the changes
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for email/password authentication, nullable for wallet-only users';
COMMENT ON COLUMN users.wallet_address IS 'Primary wallet address, nullable for email-registered users who will get an invisible wallet';

