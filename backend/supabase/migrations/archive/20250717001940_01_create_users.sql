CREATE TABLE users (

  -- Unique identifier for the user (auto-generated UUID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User's unique wallet address (required)
  wallet_address TEXT UNIQUE NOT NULL,

  -- User's email address (optional)
  email TEXT,

  -- Unique username for the user (required)
  username TEXT UNIQUE NOT NULL,

  -- Full name of the user (optional)
  name TEXT,

  -- Short biography or description of the user (optional)
  bio TEXT,

  -- Indicates if the user is a freelancer (default: false)
  is_freelancer BOOLEAN DEFAULT false,

  -- Reputation score for the user (default: 0)
  reputation_score INTEGER DEFAULT 0,

  -- Timestamp when the user was created (default: current timestamp)
  created_at TIMESTAMP DEFAULT NOW(),

  -- Timestamp of the user's last login (optional)
  last_login_at TIMESTAMP
);

-- Token for authentication or validation (optional)
ALTER TABLE users ADD COLUMN IF NOT EXISTS nonce TEXT;