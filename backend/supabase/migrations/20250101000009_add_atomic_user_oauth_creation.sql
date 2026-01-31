-- Migration: Add atomic function for user and OAuth creation
-- Purpose: Prevent race conditions in concurrent OAuth logins
-- Date: 2025-01-01

CREATE OR REPLACE FUNCTION create_or_link_oauth_user(
  p_provider TEXT,
  p_provider_user_id TEXT,
  p_email TEXT,
  p_name TEXT,
  p_first_name TEXT,
  p_is_email_verified BOOLEAN,
  p_access_token BYTEA,
  p_refresh_token BYTEA,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_scopes TEXT[]
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_existing_oauth_user_id UUID;
  v_existing_user RECORD;
  v_is_new_user BOOLEAN;
  v_result JSON;
BEGIN
  -- Start transaction with serializable isolation for maximum safety
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  -- Lock tables to prevent concurrent modifications
  LOCK TABLE oauth_providers IN SHARE ROW EXCLUSIVE MODE;
  LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE;

  -- Step 1: Check if OAuth account already exists
  SELECT user_id INTO v_existing_oauth_user_id
  FROM oauth_providers
  WHERE provider = p_provider
    AND provider_user_id = p_provider_user_id
  LIMIT 1;

  IF v_existing_oauth_user_id IS NOT NULL THEN
    -- OAuth exists, update it
    v_user_id := v_existing_oauth_user_id;
    v_is_new_user := FALSE;

    UPDATE oauth_providers SET
      email = p_email,
      access_token = p_access_token,
      refresh_token = p_refresh_token,
      expires_at = p_expires_at,
      scopes = p_scopes,
      updated_at = NOW()
    WHERE provider = p_provider
      AND provider_user_id = p_provider_user_id;

  ELSE
    -- OAuth doesn't exist, check if user exists by email
    SELECT * INTO v_existing_user
    FROM users
    WHERE email = p_email
    LIMIT 1;

    IF v_existing_user IS NOT NULL THEN
      -- User exists, link OAuth to them
      v_user_id := v_existing_user.id;
      v_is_new_user := FALSE;

      -- Insert OAuth record (will fail with unique constraint if already exists)
      INSERT INTO oauth_providers (
        user_id, provider, provider_user_id, email,
        access_token, refresh_token, expires_at, scopes, created_at, updated_at
      ) VALUES (
        v_user_id, p_provider, p_provider_user_id, p_email,
        p_access_token, p_refresh_token, p_expires_at, p_scopes, NOW(), NOW()
      )
      ON CONFLICT (provider, provider_user_id) DO UPDATE SET
        email = EXCLUDED.email,
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        scopes = EXCLUDED.scopes,
        updated_at = NOW();

    ELSE
      -- Create new user
      v_is_new_user := TRUE;

      INSERT INTO users (
        email, username, name, is_email_verified, is_active, role, created_at, updated_at
      ) VALUES (
        p_email,
        p_first_name || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
        COALESCE(p_name, p_first_name, p_email),
        p_is_email_verified,
        TRUE,
        'client',
        NOW(),
        NOW()
      )
      RETURNING id INTO v_user_id;

      -- Create OAuth record for new user
      INSERT INTO oauth_providers (
        user_id, provider, provider_user_id, email,
        access_token, refresh_token, expires_at, scopes, created_at, updated_at
      ) VALUES (
        v_user_id, p_provider, p_provider_user_id, p_email,
        p_access_token, p_refresh_token, p_expires_at, p_scopes, NOW(), NOW()
      );
    END IF;
  END IF;

  -- Fetch user data
  SELECT json_build_object(
    'user', json_build_object(
      'id', u.id,
      'email', u.email,
      'username', u.username,
      'name', u.name,
      'is_email_verified', u.is_email_verified,
      'is_active', u.is_active,
      'role', u.role,
      'created_at', u.created_at,
      'updated_at', u.updated_at
    ),
    'is_new_user', v_is_new_user
  ) INTO v_result
  FROM users u
  WHERE u.id = v_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create index on (provider, provider_user_id) for unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_providers_unique
  ON oauth_providers(provider, provider_user_id);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id
  ON oauth_providers(user_id);

-- Create index on email for email lookups
CREATE INDEX IF NOT EXISTS idx_oauth_providers_email
  ON oauth_providers(email);
