# Database Migrations Guide

This document explains how to create and manage database migrations for the Offer Hub project using Supabase.

## Table of Contents

- [Overview](#overview)
- [Migration File Structure](#migration-file-structure)
- [Creating Migrations](#creating-migrations)
- [Running Migrations](#running-migrations)
- [Migration Best Practices](#migration-best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Overview

Offer Hub uses Supabase for database management. All database changes are tracked through SQL migration files located in `/backend/supabase/migrations/`.

### Migration Directory Structure

```
backend/
└── supabase/
    ├── config.toml           # Supabase configuration
    └── migrations/
        ├── 20250101000001_enable_extensions_and_types.sql
        ├── 20250101000002_create_users_table.sql
        ├── 20250101000003_create_refresh_tokens_table.sql
        ├── 20250101000004_create_functions_and_triggers.sql
        └── ...
```

## Migration File Structure

### Naming Convention

Migration files follow this pattern:

```
<YYYYMMDDHHMMSS>_<descriptive_name>.sql
```

| Component | Description | Example |
|-----------|-------------|---------|
| Timestamp | Year, month, day, hour, minute, second | `20250107120000` |
| Separator | Underscore | `_` |
| Name | Descriptive, snake_case | `create_users_table` |
| Extension | SQL file | `.sql` |

**Examples**:
```
20250107120000_create_users_table.sql
20250107120001_add_email_index_to_users.sql
20250107120002_create_wallets_table.sql
```

### File Content Structure

Each migration file should include:

```sql
-- Migration: create_users_table
-- Description: Creates the users table with authentication fields
-- Author: Your Name
-- Date: 2025-01-07

-- ============================================
-- UP MIGRATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- DOWN MIGRATION (commented for reference)
-- ============================================
-- DROP INDEX IF EXISTS idx_users_email;
-- DROP TABLE IF EXISTS users;
```

## Creating Migrations

### Using Supabase CLI

```bash
# Navigate to backend directory
cd backend

# Create a new migration
npx supabase migration new <migration_name>

# Example
npx supabase migration new create_payments_table
```

This creates a new file: `supabase/migrations/<timestamp>_create_payments_table.sql`

### Manual Creation

1. Navigate to `/backend/supabase/migrations/`
2. Create a new file with the correct naming convention
3. Write your SQL migration

```bash
# Get current timestamp
date +"%Y%m%d%H%M%S"
# Output: 20250107153045

# Create file
touch backend/supabase/migrations/20250107153045_create_payments_table.sql
```

### Migration Template

```sql
-- Migration: <name>
-- Description: <what this migration does>
-- Author: <your name>
-- Date: <YYYY-MM-DD>

-- ============================================
-- CHANGES
-- ============================================

-- Your SQL statements here

-- ============================================
-- ROLLBACK (commented for reference)
-- ============================================
-- Rollback statements here (commented out)
```

## Running Migrations

### Local Development

```bash
# Navigate to backend
cd backend

# Start Supabase (if not running)
npx supabase start

# Reset database and run all migrations
npx supabase db reset

# Check migration status
npx supabase migration list
```

### Apply New Migrations Only

```bash
# Push migrations to local database
npx supabase db push
```

### Production Deployment

Migrations are applied automatically during deployment. For manual application:

```bash
# Link to production project
npx supabase link --project-ref <project-ref>

# Push migrations to production
npx supabase db push
```

## Migration Best Practices

### 1. One Change Per Migration

Each migration should do one thing:

```sql
-- Good: Single responsibility
-- 20250107120000_create_users_table.sql
CREATE TABLE users (...);

-- 20250107120001_add_email_index_to_users.sql
CREATE INDEX idx_users_email ON users(email);
```

```sql
-- Bad: Multiple unrelated changes
CREATE TABLE users (...);
CREATE TABLE payments (...);
CREATE INDEX idx_users_email ON users(email);
```

### 2. Make Migrations Idempotent

Use `IF NOT EXISTS` and `IF EXISTS`:

```sql
-- Good: Can run multiple times without error
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX idx_users_email ON users(email);
```

### 3. Never Modify Existing Migrations

Once a migration is committed and pushed:
- **DO NOT** modify its contents
- Create a new migration for corrections

```sql
-- Wrong: Modifying existing migration
-- 20250101_create_users.sql (modified)

-- Correct: New migration to fix issue
-- 20250107_add_missing_column_to_users.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50);
```

### 4. Include Down Migrations

Always document how to rollback (commented):

```sql
-- UP
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- DOWN (for reference)
-- ALTER TABLE users DROP COLUMN phone;
```

### 5. Use Transactions for Data Migrations

```sql
BEGIN;

-- Update data
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Verify
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE status IS NULL) THEN
        RAISE EXCEPTION 'Migration failed: NULL status still exists';
    END IF;
END $$;

COMMIT;
```

### 6. Test Migrations Locally First

```bash
# Reset and test
npx supabase db reset

# Verify tables
npx supabase db diff
```

## Common Patterns

### Creating Tables

```sql
-- Create table with common fields
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);
```

### Adding Columns

```sql
-- Add nullable column (safe)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add NOT NULL column with default
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' NOT NULL;

-- Add column and backfill data
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
UPDATE users SET display_name = username WHERE display_name IS NULL;
```

### Creating Indexes

```sql
-- Single column index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite index
CREATE INDEX IF NOT EXISTS idx_contracts_user_status
    ON contracts(user_id, status);

-- Partial index
CREATE INDEX IF NOT EXISTS idx_contracts_active
    ON contracts(created_at)
    WHERE status = 'active';

-- Unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
    ON users(email);
```

### Adding Foreign Keys

```sql
-- Add foreign key constraint
ALTER TABLE contracts
    ADD CONSTRAINT fk_contracts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;
```

### Creating Functions and Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS set_updated_at ON contracts;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Enabling Extensions

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Creating Enums

```sql
-- Create enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
        CREATE TYPE contract_status AS ENUM (
            'draft',
            'pending',
            'active',
            'completed',
            'cancelled'
        );
    END IF;
END $$;

-- Use enum in table
ALTER TABLE contracts
    ALTER COLUMN status TYPE contract_status
    USING status::contract_status;
```

### Data Migrations

```sql
-- Migrate data from one structure to another
BEGIN;

-- Create new column
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(200);

-- Migrate data
UPDATE users
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL;

-- Optionally drop old columns (in separate migration)
-- ALTER TABLE users DROP COLUMN first_name;
-- ALTER TABLE users DROP COLUMN last_name;

COMMIT;
```

## Troubleshooting

### Migration Failed

If a migration fails:

1. Check the error message
2. Fix the SQL
3. If local: Reset the database
   ```bash
   npx supabase db reset
   ```
4. If production: Create a new migration to fix the issue

### Duplicate Migration Error

If you see "migration already exists":

1. Check `supabase/migrations/` for duplicate timestamps
2. Rename the newer file with a new timestamp

### Foreign Key Constraint Errors

If you get constraint errors:

1. Ensure referenced table exists
2. Check that referenced column exists
3. Ensure data types match

```sql
-- Check if table exists before adding FK
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE contracts
            ADD CONSTRAINT fk_contracts_user
            FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END $$;
```

### Checking Current Database State

```bash
# List all tables
npx supabase db diff

# View table structure
psql -h localhost -p 54322 -U postgres -d postgres -c "\d+ users"

# List migrations status
npx supabase migration list
```

### Rolling Back (Local Only)

```bash
# Reset to clean state
npx supabase db reset

# Remove latest migration file
rm backend/supabase/migrations/<latest_migration>.sql

# Re-run migrations
npx supabase db reset
```

## Migration Checklist

Before committing a migration:

- [ ] File named correctly: `<timestamp>_<descriptive_name>.sql`
- [ ] Includes header comment with description
- [ ] Uses `IF NOT EXISTS` / `IF EXISTS` for idempotency
- [ ] Down migration documented (commented)
- [ ] Tested locally with `npx supabase db reset`
- [ ] No sensitive data in migration
- [ ] Follows naming conventions (snake_case for tables/columns)
- [ ] Indexes created for frequently queried columns
- [ ] Foreign keys have appropriate ON DELETE actions
