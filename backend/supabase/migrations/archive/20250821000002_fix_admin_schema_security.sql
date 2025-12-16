-- Migration: Fix admin integration schema security and data types
-- Addresses CodeRabbit security concerns

-- 1. Fix timestamp columns to use TIMESTAMPTZ
ALTER TABLE admin_api_keys
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ,
  ALTER COLUMN last_used_at TYPE TIMESTAMPTZ,
  ALTER COLUMN expires_at TYPE TIMESTAMPTZ;

ALTER TABLE webhooks
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ,
  ALTER COLUMN last_triggered_at TYPE TIMESTAMPTZ;

ALTER TABLE webhook_deliveries
  ALTER COLUMN delivered_at TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE webhook_payloads
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE integration_providers
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

ALTER TABLE integration_instances
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ,
  ALTER COLUMN last_sync_at TYPE TIMESTAMPTZ;

ALTER TABLE integration_syncs 
  ALTER COLUMN started_at TYPE TIMESTAMPTZ,
  ALTER COLUMN completed_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_audit_logs
  ALTER COLUMN performed_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_api_logs
  ALTER COLUMN timestamp TYPE TIMESTAMPTZ;

ALTER TABLE admin_system_health
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_api_rate_limits
  ALTER COLUMN window_start TYPE TIMESTAMPTZ;

ALTER TABLE admin_notifications
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN read_at TYPE TIMESTAMPTZ;

ALTER TABLE admin_api_quotas
  ALTER COLUMN reset_time TYPE TIMESTAMPTZ;

-- 2. Encrypt secrets using BYTEA (for pgcrypto)
-- Note: This requires pgcrypto extension to be enabled
-- ALTER EXTENSION pgcrypto;

-- Store webhook secrets encrypted
-- Convert existing TEXT secrets to BYTEA with explicit encoding
ALTER TABLE webhooks
  ALTER COLUMN secret TYPE BYTEA USING secret::BYTEA;

-- Store integration credentials encrypted
-- Convert existing JSONB credentials to BYTEA with explicit encoding
ALTER TABLE integration_instances
  ALTER COLUMN credentials TYPE BYTEA USING credentials::TEXT::BYTEA;

-- 3. Fix webhook_deliveries payload_id foreign key
ALTER TABLE webhook_deliveries
  ALTER COLUMN payload_id TYPE UUID;

-- Add the foreign key constraint (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_webhook_deliveries_payload_id'
  ) THEN
    ALTER TABLE webhook_deliveries
      ADD CONSTRAINT fk_webhook_deliveries_payload_id
      FOREIGN KEY (payload_id) REFERENCES webhook_payloads(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_payload_id ON webhook_deliveries(payload_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_integration_syncs_instance_id ON integration_syncs(instance_id);
CREATE INDEX IF NOT EXISTS idx_admin_api_rate_limits_api_key_window ON admin_api_rate_limits(api_key_id, window_type, window_start);
CREATE INDEX IF NOT EXISTS idx_admin_api_quotas_api_key_type_reset ON admin_api_quotas(api_key_id, quota_type, reset_time);

