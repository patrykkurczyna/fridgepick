/*
  Migration: Sync Supabase Auth Users with Custom Users Table
  Purpose: 
  - Make password_hash optional in users table (auth is handled by Supabase Auth)
  - Clean up existing data
  - Sync existing auth users to custom users table
  
  Note: Function and trigger creation will be done manually after migration
  This allows the custom users table to act as a profile extension for Supabase Auth users.
*/

-- ===================================================================
-- CLEANUP EXISTING ISSUES
-- ===================================================================

-- Drop existing trigger and function if they exist (to avoid permission issues)
DROP TRIGGER IF EXISTS trigger_sync_auth_user ON auth.users;
DROP FUNCTION IF EXISTS sync_auth_user();

-- ===================================================================
-- SCHEMA MODIFICATIONS
-- ===================================================================

-- Make password_hash optional since we're using Supabase Auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add comment to clarify the table purpose
COMMENT ON TABLE users IS 'User profiles extending Supabase Auth users. Authentication is handled by auth.users, this table stores additional profile data.';
COMMENT ON COLUMN users.password_hash IS 'Optional field. Authentication is managed by Supabase Auth (auth.users table).';

-- ===================================================================
-- DATA CLEANUP AND MIGRATION
-- ===================================================================

-- Clean up any existing problematic rows (with null password_hash)
DELETE FROM users WHERE password_hash IS NULL;

-- Sync all existing auth users to custom users table
-- Use INSERT ... ON CONFLICT to handle any existing users safely
DO $$
BEGIN
    -- Only sync if auth.users table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO users (id, email, is_email_verified, created_at, updated_at)
        SELECT 
            au.id,
            au.email,
            COALESCE(au.email_confirmed_at IS NOT NULL, false) as is_email_verified,
            au.created_at,
            COALESCE(au.updated_at, au.created_at)
        FROM auth.users au
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            is_email_verified = EXCLUDED.is_email_verified,
            updated_at = NOW();
            
        RAISE NOTICE 'Successfully synced auth users to custom users table';
    ELSE
        RAISE NOTICE 'No auth.users table found - skipping sync';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error syncing users: %', SQLERRM;
END $$;