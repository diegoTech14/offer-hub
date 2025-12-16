-- ============================================
-- SCRIPT DE RESET COMPLETO DE BASE DE DATOS
-- ============================================
-- ⚠️ ADVERTENCIA: Este script eliminará TODAS las tablas y datos
-- Ejecutar solo en desarrollo o cuando se necesite un reset completo
-- ============================================

-- Deshabilitar triggers temporalmente
SET session_replication_role = 'replica';

-- Eliminar todas las tablas en orden (respetando foreign keys)
-- Empezar con tablas que tienen dependencias

DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS workflow_escalations CASCADE;
DROP TABLE IF EXISTS workflow_analytics CASCADE;
DROP TABLE IF EXISTS workflow_configurations CASCADE;
DROP TABLE IF EXISTS workflow_deadline_extensions CASCADE;
DROP TABLE IF EXISTS workflow_deadlines CASCADE;
DROP TABLE IF EXISTS workflow_audit_trail CASCADE;
DROP TABLE IF EXISTS workflow_notifications CASCADE;
DROP TABLE IF EXISTS workflow_progress CASCADE;
DROP TABLE IF EXISTS workflow_stages CASCADE;
DROP TABLE IF EXISTS mediation_analytics CASCADE;
DROP TABLE IF EXISTS mediation_escalations CASCADE;
DROP TABLE IF EXISTS mediation_notifications CASCADE;
DROP TABLE IF EXISTS settlement_agreements CASCADE;
DROP TABLE IF EXISTS mediation_assignments CASCADE;
DROP TABLE IF EXISTS mediation_sessions CASCADE;
DROP TABLE IF EXISTS mediators CASCADE;
DROP TABLE IF EXISTS admin_api_quotas CASCADE;
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS admin_api_rate_limits CASCADE;
DROP TABLE IF EXISTS admin_system_health CASCADE;
DROP TABLE IF EXISTS admin_api_logs CASCADE;
DROP TABLE IF EXISTS admin_audit_logs CASCADE;
DROP TABLE IF EXISTS integration_syncs CASCADE;
DROP TABLE IF EXISTS integration_instances CASCADE;
DROP TABLE IF EXISTS integration_providers CASCADE;
DROP TABLE IF EXISTS webhook_payloads CASCADE;
DROP TABLE IF EXISTS webhook_deliveries CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS admin_api_keys CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS review_responses CASCADE;
DROP TABLE IF EXISTS response_analytics CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS nfts_awarded CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar funciones personalizadas si existen
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_tokens() CASCADE;

-- Eliminar tipos personalizados si existen
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS workflow_stage_status CASCADE;

-- Eliminar extensiones (opcional, comentado por si se necesitan después)
-- DROP EXTENSION IF EXISTS pgcrypto CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Rehabilitar triggers
SET session_replication_role = 'origin';

-- Verificar que no queden tablas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    IF table_count > 0 THEN
        RAISE NOTICE 'Aún quedan % tablas en el esquema public', table_count;
    ELSE
        RAISE NOTICE 'Base de datos completamente limpia. Lista para nuevas migraciones.';
    END IF;
END $$;
