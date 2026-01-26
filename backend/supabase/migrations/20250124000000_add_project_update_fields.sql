-- Add new fields to projects table for update functionality
-- Fields: updated_at, freelancer_id, on_chain_tx_hash

-- Add updated_at column with automatic timestamp update
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add freelancer_id column to track assigned freelancer
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add on_chain_tx_hash for blockchain transaction reference
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS on_chain_tx_hash TEXT;

-- Create trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on update
DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Create index on freelancer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
