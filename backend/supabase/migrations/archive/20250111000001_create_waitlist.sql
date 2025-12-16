-- Create waitlist table for early access signups
CREATE TABLE IF NOT EXISTS waitlist (
  -- Unique identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User information
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  comments TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'registered')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Add comment to table
COMMENT ON TABLE waitlist IS 'Early access waitlist signups from landing page';

