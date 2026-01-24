-- Create task_records table for recording task outcomes with blockchain integration
-- This table stores immutable records of task completion status

CREATE TABLE IF NOT EXISTS task_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    freelancer_id UUID NOT NULL,
    client_id UUID NOT NULL,
    completed BOOLEAN NOT NULL,
    outcome_description TEXT,
    on_chain_tx_hash TEXT,
    on_chain_task_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_task_records_project_id 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_task_records_freelancer_id 
        FOREIGN KEY (freelancer_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_task_records_client_id 
        FOREIGN KEY (client_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Ensure only one task record per project
    CONSTRAINT unique_project_task_record 
        UNIQUE (project_id),
    
    -- Ensure outcome description is not empty if provided
    CONSTRAINT check_outcome_description_not_empty 
        CHECK (outcome_description IS NULL OR length(trim(outcome_description)) > 0),
    
    -- Ensure on_chain_task_id is positive if provided
    CONSTRAINT check_on_chain_task_id_positive 
        CHECK (on_chain_task_id IS NULL OR on_chain_task_id > 0)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_task_records_project_id ON task_records(project_id);
CREATE INDEX IF NOT EXISTS idx_task_records_freelancer_id ON task_records(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_task_records_client_id ON task_records(client_id);
CREATE INDEX IF NOT EXISTS idx_task_records_completed ON task_records(completed);
CREATE INDEX IF NOT EXISTS idx_task_records_created_at ON task_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_records_on_chain_tx_hash ON task_records(on_chain_tx_hash) WHERE on_chain_tx_hash IS NOT NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_task_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_records_updated_at
    BEFORE UPDATE ON task_records
    FOR EACH ROW
    EXECUTE FUNCTION update_task_records_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE task_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view task records where they are the client, freelancer, or admin
CREATE POLICY "Users can view their own task records" ON task_records
    FOR SELECT
    USING (
        auth.uid() = client_id 
        OR auth.uid() = freelancer_id 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy: Only clients can create task records for their projects
CREATE POLICY "Clients can create task records for their projects" ON task_records
    FOR INSERT
    WITH CHECK (
        auth.uid() = client_id
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE id = project_id 
            AND client_id = auth.uid()
            AND status = 'in_progress'
        )
    );

-- Policy: Task records are immutable (no updates or deletes allowed)
-- This ensures the integrity of the reputation system
CREATE POLICY "Task records are immutable" ON task_records
    FOR UPDATE
    USING (false);

CREATE POLICY "Task records cannot be deleted" ON task_records
    FOR DELETE
    USING (false);

-- Add comments for documentation
COMMENT ON TABLE task_records IS 'Immutable records of task completion outcomes with blockchain integration';
COMMENT ON COLUMN task_records.id IS 'Unique identifier for the task record';
COMMENT ON COLUMN task_records.project_id IS 'Reference to the project this task record belongs to';
COMMENT ON COLUMN task_records.freelancer_id IS 'Reference to the freelancer who worked on the task';
COMMENT ON COLUMN task_records.client_id IS 'Reference to the client who created the task record';
COMMENT ON COLUMN task_records.completed IS 'Whether the task was completed successfully (true) or failed/cancelled (false)';
COMMENT ON COLUMN task_records.outcome_description IS 'Optional description of the task outcome';
COMMENT ON COLUMN task_records.on_chain_tx_hash IS 'Blockchain transaction hash for the recorded task outcome';
COMMENT ON COLUMN task_records.on_chain_task_id IS 'Blockchain-generated task ID for cross-referencing';
COMMENT ON COLUMN task_records.created_at IS 'Timestamp when the task record was created';
COMMENT ON COLUMN task_records.updated_at IS 'Timestamp when the task record was last updated';

-- Grant necessary permissions
GRANT SELECT ON task_records TO authenticated;
GRANT INSERT ON task_records TO authenticated;
-- Note: UPDATE and DELETE are intentionally not granted to maintain immutability