-- ============================================
-- Migración 005: Políticas RLS (Row Level Security)
-- ============================================
-- Configura Row Level Security para proteger datos sensibles
-- ============================================

-- Habilitar RLS en la tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Política: Los admins pueden ver todos los usuarios
-- Nota: Esta política requiere que el rol se verifique en el backend
-- ya que Supabase RLS no tiene acceso directo a la columna 'role'
-- Por ahora, deshabilitamos esta política y manejamos permisos en el backend
-- CREATE POLICY "Admins can view all users"
--   ON users
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM users
--       WHERE id::text = auth.uid()::text
--       AND role = 'admin'
--     )
--   );

-- Habilitar RLS en la tabla refresh_tokens
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios tokens
CREATE POLICY "Users can view own refresh tokens"
  ON refresh_tokens
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Nota importante:
-- Las políticas RLS de Supabase funcionan mejor cuando se usa
-- Supabase Auth. Como estamos usando JWT personalizado en el backend,
-- las políticas RLS pueden no funcionar correctamente.
-- 
-- Por esta razón, recomendamos:
-- 1. Deshabilitar RLS y manejar permisos en el backend (recomendado)
-- 2. O usar Supabase Auth en lugar de JWT personalizado
--
-- Por ahora, dejamos RLS habilitado pero las políticas pueden necesitar ajustes
-- según cómo se implemente la autenticación.

-- Alternativa: Deshabilitar RLS y manejar permisos en el backend
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE refresh_tokens DISABLE ROW LEVEL SECURITY;

-- Comentarios para documentación
COMMENT ON POLICY "Users can view own profile" ON users IS 'Permite que los usuarios vean su propio perfil';
COMMENT ON POLICY "Users can update own profile" ON users IS 'Permite que los usuarios actualicen su propio perfil';
COMMENT ON POLICY "Users can view own refresh tokens" ON refresh_tokens IS 'Permite que los usuarios vean sus propios refresh tokens';
