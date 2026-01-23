-- Add freelancer_id and escrow_address columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS escrow_address TEXT;

-- Create index for freelancer_id lookups
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);

-- Update status constraint to include 'open' status
-- First, drop the existing constraint if it exists (PostgreSQL doesn't support IF EXISTS for constraints)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_project_status'
    ) THEN
        ALTER TABLE projects DROP CONSTRAINT check_project_status;
    END IF;
END $$;

-- Add constraint to ensure status transitions are valid
ALTER TABLE projects ADD CONSTRAINT check_project_status 
  CHECK (status IN ('pending', 'open', 'in_progress', 'completed', 'cancelled', 'deleted'));
