-- ============================================
-- Migración 011: Tablas Projects y Project Skills
-- ============================================
-- Crea las tablas para almacenar proyectos y sus habilidades relacionadas
-- ============================================

-- Crear tabla projects
CREATE TABLE projects (
  -- Identificador único (UUID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia al cliente (usuario que crea el proyecto)
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Información básica del proyecto
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,

  -- Información financiera
  budget DECIMAL(15,2) NOT NULL CHECK (budget > 0),
  budget_type TEXT NOT NULL CHECK (budget_type IN ('fixed', 'hourly')),

  -- Estado y configuración
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'active', 'in_progress', 'completed', 'cancelled', 'archived', 'deleted')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),

  -- Tipo de proyecto y nivel de experiencia
  project_type TEXT NOT NULL DEFAULT 'on-time' CHECK (project_type IN ('on-time', 'ongoing')),
  experience_level TEXT NOT NULL DEFAULT 'intermediate' CHECK (experience_level IN ('entry', 'intermediate', 'expert')),

  -- Información adicional
  duration TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',

  -- Información de blockchain (según el issue)
  on_chain_transaction_hash TEXT,
  on_chain_id TEXT,

  -- Metadata
  version INTEGER DEFAULT 1,
  featured BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla project_skills para relación many-to-many
CREATE TABLE project_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Evitar duplicados
  UNIQUE(project_id, skill_name)
);

-- Crear tabla project_attachments
CREATE TABLE project_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  type TEXT,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES users(id)
);

-- Crear tabla project_milestones
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_subcategory ON projects(subcategory) WHERE subcategory IS NOT NULL;
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_projects_budget ON projects(budget);
CREATE INDEX idx_projects_budget_type ON projects(budget_type);
CREATE INDEX idx_projects_project_type ON projects(project_type);
CREATE INDEX idx_projects_experience_level ON projects(experience_level);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);
CREATE INDEX idx_projects_deadline ON projects(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_projects_tags ON projects USING GIN (tags);

CREATE INDEX idx_project_skills_project_id ON project_skills(project_id);
CREATE INDEX idx_project_skills_skill_name ON project_skills(skill_name);

CREATE INDEX idx_project_attachments_project_id ON project_attachments(project_id);
CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX idx_project_milestones_status ON project_milestones(status);
CREATE INDEX idx_project_milestones_due_date ON project_milestones(due_date) WHERE due_date IS NOT NULL;

-- Función para actualizar automáticamente updated_at en projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE projects IS 'Tabla principal de proyectos en la plataforma';
COMMENT ON COLUMN projects.on_chain_transaction_hash IS 'Hash de transacción en blockchain para proyectos publicados on-chain';
COMMENT ON COLUMN projects.on_chain_id IS 'ID único del proyecto en el contrato inteligente';

COMMENT ON TABLE project_skills IS 'Relación many-to-many entre proyectos y habilidades requeridas';
COMMENT ON TABLE project_attachments IS 'Archivos adjuntos de los proyectos';
COMMENT ON TABLE project_milestones IS 'Hitos/milestones de los proyectos';