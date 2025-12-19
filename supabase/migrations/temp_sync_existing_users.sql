-- Temporary script to sync existing auth users to public.users
-- Run this once in Supabase Studio SQL Editor

INSERT INTO public.users (id, email, is_email_verified, created_at, updated_at)
SELECT
    au.id,
    au.email,
    COALESCE(au.email_confirmed_at IS NOT NULL, false) as is_email_verified,
    au.created_at,
    COALESCE(au.updated_at, au.created_at)
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    is_email_verified = EXCLUDED.is_email_verified,
    updated_at = NOW();

-- Verify the sync
SELECT
    COUNT(*) as total_auth_users,
    (SELECT COUNT(*) FROM public.users) as total_public_users,
    COUNT(*) - (SELECT COUNT(*) FROM public.users) as missing_users
FROM auth.users;
