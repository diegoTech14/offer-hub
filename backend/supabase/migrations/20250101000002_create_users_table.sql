-- ============================================
-- Migración 002: Tabla Users
-- ============================================
-- Crea la tabla de usuarios con todos los campos necesarios
-- para autenticación con email/password y wallet
-- ============================================

CREATE TABLE users (
  -- Identificador único (UUID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Autenticación con email/password
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Nullable para permitir usuarios solo con wallet

  -- Información básica del usuario
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,

  -- Roles y permisos
  role user_role NOT NULL DEFAULT 'client',
  
  -- Autenticación con wallet (opcional)
  wallet_address TEXT UNIQUE, -- Nullable, unique cuando no es null
  nonce TEXT, -- Para autenticación con wallet

  -- Tipo de usuario
  is_freelancer BOOLEAN DEFAULT false,

  -- Verificación de email
  is_email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT,
  email_verification_expires_at TIMESTAMP WITH TIME ZONE,

  -- Recuperación de contraseña
  password_reset_token TEXT,
  password_reset_expires_at TIMESTAMP WITH TIME ZONE,

  -- Estado del usuario
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_email_verified ON users(is_email_verified);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Constraint para asegurar que al menos email o wallet_address existe
ALTER TABLE users ADD CONSTRAINT check_auth_method 
  CHECK (email IS NOT NULL OR wallet_address IS NOT NULL);

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema. Soporta autenticación con email/password y wallet.';
COMMENT ON COLUMN users.email IS 'Email único del usuario, requerido para autenticación con email/password';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt de la contraseña, nullable para usuarios solo con wallet';
COMMENT ON COLUMN users.wallet_address IS 'Dirección de wallet del usuario, nullable para usuarios con email/password';
COMMENT ON COLUMN users.nonce IS 'Nonce temporal para autenticación con wallet';
COMMENT ON COLUMN users.role IS 'Rol del usuario en el sistema (admin, client, freelancer, moderator, user)';
COMMENT ON COLUMN users.is_email_verified IS 'Indica si el email del usuario ha sido verificado';
COMMENT ON COLUMN users.is_active IS 'Indica si la cuenta del usuario está activa';
