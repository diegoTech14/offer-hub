-- Migration: Fix profiles table to reference custom users table instead of auth.users

-- Drop existing foreign key constraint
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add new foreign key constraint to custom users table
ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Drop old RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Update comment to reflect correct reference
COMMENT ON COLUMN profiles.user_id IS 'Reference to the users table, one-to-one relationship';
