-- ============================================
-- Script de Validación de Migraciones
-- ============================================
-- Verifica que todas las migraciones se aplicaron correctamente
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  function_count INTEGER;
  type_count INTEGER;
  trigger_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Validación de Migraciones de Autenticación';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Verificar extensiones
  RAISE NOTICE 'Verificando extensiones...';
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    RAISE NOTICE '✅ Extensión pgcrypto está habilitada';
  ELSE
    RAISE WARNING '❌ Extensión pgcrypto NO está habilitada';
  END IF;

  -- Verificar tipos
  RAISE NOTICE '';
  RAISE NOTICE 'Verificando tipos ENUM...';
  SELECT COUNT(*) INTO type_count
  FROM pg_type
  WHERE typname IN ('user_role', 'user_status');
  
  IF type_count = 2 THEN
    RAISE NOTICE '✅ Tipos ENUM creados correctamente (%)', type_count;
  ELSE
    RAISE WARNING '❌ Faltan tipos ENUM. Encontrados: %', type_count;
  END IF;

  -- Verificar tablas
  RAISE NOTICE '';
  RAISE NOTICE 'Verificando tablas...';
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('users', 'refresh_tokens');
  
  IF table_count = 2 THEN
    RAISE NOTICE '✅ Tablas creadas correctamente (%)', table_count;
  ELSE
    RAISE WARNING '❌ Faltan tablas. Encontradas: %', table_count;
  END IF;

  -- Verificar que la tabla users existe y tiene las columnas necesarias
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE NOTICE '';
    RAISE NOTICE 'Verificando columnas de la tabla users...';
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
      RAISE NOTICE '✅ Columna email existe';
    ELSE
      RAISE WARNING '❌ Columna email NO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
      RAISE NOTICE '✅ Columna password_hash existe';
    ELSE
      RAISE WARNING '❌ Columna password_hash NO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
      RAISE NOTICE '✅ Columna role existe';
    ELSE
      RAISE WARNING '❌ Columna role NO existe';
    END IF;
  END IF;

  -- Verificar índices
  RAISE NOTICE '';
  RAISE NOTICE 'Verificando índices...';
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename IN ('users', 'refresh_tokens');
  
  IF index_count >= 8 THEN
    RAISE NOTICE '✅ Índices creados correctamente (%)', index_count;
  ELSE
    RAISE WARNING '⚠️  Pocos índices encontrados. Esperados: >=8, Encontrados: %', index_count;
  END IF;

  -- Verificar funciones
  RAISE NOTICE '';
  RAISE NOTICE 'Verificando funciones...';
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN ('update_updated_at_column', 'cleanup_expired_tokens', 
                    'generate_email_verification_token', 'generate_password_reset_token');
  
  IF function_count = 4 THEN
    RAISE NOTICE '✅ Funciones creadas correctamente (%)', function_count;
  ELSE
    RAISE WARNING '❌ Faltan funciones. Encontradas: %', function_count;
  END IF;

  -- Verificar triggers
  RAISE NOTICE '';
  RAISE NOTICE 'Verificando triggers...';
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname = 'update_users_updated_at';
  
  IF trigger_count = 1 THEN
    RAISE NOTICE '✅ Trigger update_users_updated_at creado correctamente';
  ELSE
    RAISE WARNING '❌ Trigger update_users_updated_at NO existe';
  END IF;

  -- Verificar RLS
  RAISE NOTICE '';
  RAISE NOTICE 'Verificando Row Level Security...';
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS está habilitado en la tabla users';
  ELSE
    RAISE NOTICE 'ℹ️  RLS no está habilitado en la tabla users (esto es normal si se maneja en el backend)';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Validación completada';
  RAISE NOTICE '========================================';
END $$;
