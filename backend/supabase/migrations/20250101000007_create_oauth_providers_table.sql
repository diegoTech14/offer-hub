-- ============================================
-- Migración 007: Tabla OAuth Providers
-- ============================================
-- Crea la tabla para almacenar vínculos OAuth
-- con soporte para múltiples proveedores
-- ============================================

CREATE TABLE oauth_providers (
  -- Identificador único
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia al usuario
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Proveedor OAuth (google, apple, microsoft, github)
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple', 'microsoft', 'github')),

  -- ID del usuario en el proveedor OAuth
  provider_user_id TEXT NOT NULL,

  -- Email del usuario en el proveedor
  email TEXT,

  -- Tokens encriptados (BYTEA para almacenar datos binarios encriptados)
  access_token BYTEA,
  refresh_token BYTEA,

  -- Fecha de expiración del access token
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Scopes otorgados por el proveedor
  scopes TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_oauth_providers_user_id ON oauth_providers(user_id);
CREATE INDEX idx_oauth_providers_provider ON oauth_providers(provider);
CREATE INDEX idx_oauth_providers_provider_user_id ON oauth_providers(provider, provider_user_id);
CREATE INDEX idx_oauth_providers_email ON oauth_providers(email) WHERE email IS NOT NULL;

-- Constraint único: un usuario del proveedor solo puede estar vinculado una vez
CREATE UNIQUE INDEX ux_oauth_providers_provider_user ON oauth_providers(provider, provider_user_id);

-- Comentarios para documentación
COMMENT ON TABLE oauth_providers IS 'Tabla para almacenar vínculos OAuth con múltiples proveedores (Google, Apple, Microsoft, GitHub)';
COMMENT ON COLUMN oauth_providers.provider IS 'Proveedor OAuth: google, apple, microsoft, github';
COMMENT ON COLUMN oauth_providers.provider_user_id IS 'ID único del usuario en el proveedor OAuth';
COMMENT ON COLUMN oauth_providers.access_token IS 'Access token encriptado del proveedor OAuth';
COMMENT ON COLUMN oauth_providers.refresh_token IS 'Refresh token encriptado del proveedor OAuth';
COMMENT ON COLUMN oauth_providers.scopes IS 'Array de scopes otorgados por el proveedor';

