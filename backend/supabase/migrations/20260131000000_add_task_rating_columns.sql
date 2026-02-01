-- Add rating columns to task_records table
ALTER TABLE task_records
  ADD COLUMN rating INTEGER,
  ADD COLUMN rating_comment TEXT;

-- Add constraints for rating validation
ALTER TABLE task_records
  ADD CONSTRAINT chk_task_records_rating
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  ADD CONSTRAINT chk_task_records_rating_comment
    CHECK (rating_comment IS NULL OR char_length(rating_comment) <= 500);

-- Create index for rated tasks
CREATE INDEX idx_task_records_rating
  ON task_records (rating)
  WHERE rating IS NOT NULL;

-- Update RLS policy to allow clients to update rating on their own task records
CREATE POLICY "Clients can update rating on their task records"
  ON task_records
  FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());
