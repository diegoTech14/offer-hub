-- ============================================
-- Migración 003: Tabla Refresh Tokens
-- ============================================
-- Crea la tabla para almacenar refresh tokens
-- con soporte para token rotation y revocación
-- ============================================

CREATE TABLE refresh_tokens (
  -- Identificador único
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia al usuario
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Hash del token (SHA-256)
  token_hash BYTEA NOT NULL,

  -- Estado del token
  is_revoked BOOLEAN DEFAULT false,

  -- Fechas
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,

  -- Token rotation: referencia al token que reemplazó este
  replaced_by_token_id UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL
);

-- Índices para optimizar búsquedas
CREATE UNIQUE INDEX ux_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);
CREATE INDEX idx_refresh_tokens_created_at ON refresh_tokens(created_at);

-- Comentarios para documentación
COMMENT ON TABLE refresh_tokens IS 'Tabla para almacenar refresh tokens con soporte para token rotation y revocación';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'Hash SHA-256 del refresh token (almacenado como BYTEA)';
COMMENT ON COLUMN refresh_tokens.is_revoked IS 'Indica si el token ha sido revocado';
COMMENT ON COLUMN refresh_tokens.replaced_by_token_id IS 'Referencia al token que reemplazó este (para token rotation)';
