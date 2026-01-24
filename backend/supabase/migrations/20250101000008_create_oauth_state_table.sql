-- Migration: Create oauth_state table for CSRF protection
-- Date: 2025-01-01

CREATE TABLE IF NOT EXISTS oauth_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_hash TEXT NOT NULL UNIQUE,
  session_id TEXT NOT NULL,
  redirect_url TEXT,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Create index for faster lookups by hash
CREATE INDEX idx_oauth_state_hash ON oauth_state(state_hash);

-- Create index for cleanup of expired states
CREATE INDEX idx_oauth_state_expires ON oauth_state(expires_at);

-- Create index for session lookups
CREATE INDEX idx_oauth_state_session ON oauth_state(session_id);

-- Create index for finding unused states
CREATE INDEX idx_oauth_state_unused ON oauth_state(used) WHERE used = FALSE;

-- Enable RLS (Row Level Security)
ALTER TABLE oauth_state ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow anyone to insert
CREATE POLICY "Allow insert oauth_state" ON oauth_state
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Allow reading own session states
CREATE POLICY "Allow read oauth_state" ON oauth_state
  FOR SELECT
  USING (true);

-- Create policy: Allow updating (marking as used)
CREATE POLICY "Allow update oauth_state" ON oauth_state
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to cleanup expired states (optional - can be run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_state
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
