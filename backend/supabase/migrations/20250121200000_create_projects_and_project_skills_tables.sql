-- ============================================
-- Migración 011: Tablas Projects y Project Skills
-- ============================================
-- Crea las tablas para almacenar proyectos y sus habilidades relacionadas
-- ============================================

-- Crear enum para status de proyectos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
  END IF;
END$$;

-- Crear tabla projects (según #890)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL,

  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),

  budget_amount DECIMAL(12,2) NOT NULL CHECK (budget_amount > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'XLM',

  status project_status NOT NULL DEFAULT 'open',
  deadline TIMESTAMP WITH TIME ZONE,

  -- Hash de transacción on-chain (Soroban)
  on_chain_tx_hash VARCHAR(66),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla project_skills para relación many-to-many (skills como strings por ahora)
CREATE TABLE project_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Evitar duplicados
  UNIQUE(project_id, skill_name)
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_freelancer_id ON projects(freelancer_id);

CREATE INDEX idx_project_skills_project_id ON project_skills(project_id);
CREATE INDEX idx_project_skills_skill_name ON project_skills(skill_name);

-- Función para actualizar automáticamente updated_at en projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE projects IS 'Tabla principal de proyectos en la plataforma';
COMMENT ON COLUMN projects.on_chain_tx_hash IS 'Hash de transacción Soroban para proyectos publicados on-chain';

COMMENT ON TABLE project_skills IS 'Relación many-to-many entre proyectos y habilidades requeridas';