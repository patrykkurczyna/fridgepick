-- Migration: Create function to sync auth.users to public.users
-- This function has SECURITY DEFINER so it bypasses RLS policies

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS sync_user_to_public(uuid, text, boolean);

-- Create function to sync user from auth.users to public.users
CREATE OR REPLACE FUNCTION sync_user_to_public(
  user_id uuid,
  user_email text,
  email_verified boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
BEGIN
  -- Insert or update user in public.users table
  INSERT INTO public.users (id, email, is_email_verified, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    email_verified,
    NOW(),
    NOW()
  )
  ON CONFLICT (id)
  DO UPDATE SET
    email = EXCLUDED.email,
    is_email_verified = EXCLUDED.is_email_verified,
    updated_at = NOW();

  RAISE LOG 'User synced to public.users: %', user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION sync_user_to_public(uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_user_to_public(uuid, text, boolean) TO anon;

-- Add comment
COMMENT ON FUNCTION sync_user_to_public IS 'Syncs user from auth.users to public.users table, bypassing RLS policies';
