-- Crear tabla task_records
CREATE TABLE task_records (
  -- Identificador único
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones principales
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Estado de la tarea
  completed BOOLEAN NOT NULL,

  -- Feedback del cliente
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT CHECK (char_length(comment) <= 500),

  -- Información blockchain
  on_chain_tx_hash VARCHAR(66),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_task_records_project_id
  ON task_records(project_id);

CREATE INDEX idx_task_records_freelancer_id
  ON task_records(freelancer_id);

CREATE INDEX idx_task_records_client_id
  ON task_records(client_id);

-- Función para actualizar automáticamente updated_at en task_records
CREATE TRIGGER update_task_records_updated_at
  BEFORE UPDATE ON task_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
