-- ============================================
-- Migración 004: Funciones y Triggers
-- ============================================
-- Crea funciones útiles y triggers automáticos
-- ============================================

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM refresh_tokens
  WHERE expires_at < NOW()
     OR (is_revoked = true AND revoked_at < NOW() - INTERVAL '30 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para generar token de verificación de email seguro
CREATE OR REPLACE FUNCTION generate_email_verification_token()
RETURNS TEXT AS $$
BEGIN
  -- Genera un token seguro de 32 caracteres hexadecimales
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Función para generar token de reset de contraseña seguro
CREATE OR REPLACE FUNCTION generate_password_reset_token()
RETURNS TEXT AS $$
BEGIN
  -- Genera un token seguro de 32 caracteres hexadecimales
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON FUNCTION update_updated_at_column() IS 'Actualiza automáticamente el campo updated_at cuando se modifica un registro';
COMMENT ON FUNCTION cleanup_expired_tokens() IS 'Elimina tokens expirados o revocados hace más de 30 días. Retorna el número de tokens eliminados';
COMMENT ON FUNCTION generate_email_verification_token() IS 'Genera un token seguro de 32 caracteres hexadecimales para verificación de email';
COMMENT ON FUNCTION generate_password_reset_token() IS 'Genera un token seguro de 32 caracteres hexadecimales para reset de contraseña';
