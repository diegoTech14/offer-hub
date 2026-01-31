-- ============================================
-- Migración 001: Extensions y Types
-- ============================================
-- Habilita extensiones necesarias y crea tipos ENUM
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- Para funciones de hashing (digest, gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Para generación de UUIDs (opcional, pgcrypto ya incluye gen_random_uuid)

-- Crear tipo ENUM para roles de usuario
CREATE TYPE user_role AS ENUM (
  'admin',
  'client',
  'freelancer',
  'moderator',
  'user'
);

-- Crear tipo ENUM para estado de usuario
CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended',
  'deleted'
);

-- Comentarios para documentación
COMMENT ON TYPE user_role IS 'Roles disponibles en el sistema: admin, client, freelancer, moderator, user';
COMMENT ON TYPE user_status IS 'Estados posibles de un usuario: active, inactive, suspended, deleted';
