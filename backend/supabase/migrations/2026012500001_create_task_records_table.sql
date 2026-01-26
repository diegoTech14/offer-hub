-- enable uuid generation (pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

-- optional: sample minimal freelancers table (remove if you already have it)
-- CREATE TABLE IF NOT EXISTS freelancers (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   first_name text,
--   last_name text,
--   created_at timestamptz NOT NULL DEFAULT now()
-- );

-- Main table: task_records
CREATE TABLE IF NOT EXISTS task_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,                -- the client who commissioned the work
  project_id uuid NOT NULL,               -- referenced project
  freelancer_id uuid,                     -- referenced freelancer (nullable if freelancer removed)
  completed boolean NOT NULL DEFAULT false,
  rating smallint CHECK (rating >= 1 AND rating <= 5), -- rating given by client (1..5), nullable until given
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- foreign keys (optional if you don't want FK constraints)
  CONSTRAINT fk_task_project FOREIGN KEY (project_id)
    REFERENCES projects (id) ON DELETE CASCADE,

  CONSTRAINT fk_task_freelancer FOREIGN KEY (freelancer_id)
    REFERENCES freelancers (id) ON DELETE SET NULL
);

-- Indexes: crucial for efficient per-client queries and ordering
CREATE INDEX IF NOT EXISTS idx_task_records_client_created ON task_records (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_records_project ON task_records (project_id);
CREATE INDEX IF NOT EXISTS idx_task_records_freelancer ON task_records (freelancer_id);

-- A view that joins project title and freelancer name for easy selects
CREATE OR REPLACE VIEW vw_task_records_for_client AS
SELECT
  tr.id,
  tr.client_id,
  tr.project_id,
  p.title AS project_title,
  tr.freelancer_id,
  (coalesce(f.first_name, '') || ' ' || coalesce(f.last_name, ''))::text AS freelancer_name,
  tr.completed,
  tr.rating,
  tr.notes,
  tr.created_at,
  tr.updated_at
FROM task_records tr
LEFT JOIN projects p ON p.id = tr.project_id
LEFT JOIN freelancers f ON f.id = tr.freelancer_id;

COMMIT;
