-- Seed products for development
-- This script will seed products for the authenticated user

-- First, let's check if we have any users in the system
DO $$
DECLARE
    target_user_id UUID;
    user_email TEXT;
BEGIN
    -- Try to get the user ID from your specific email first
    SELECT id, email INTO target_user_id, user_email 
    FROM auth.users 
    WHERE email = 'patryk.kurczyna@gmail.com'
    LIMIT 1;
    
    -- If your email doesn't exist, get the first available user
    IF target_user_id IS NULL THEN
        SELECT id, email INTO target_user_id, user_email 
        FROM auth.users 
        ORDER BY created_at ASC 
        LIMIT 1;
    END IF;
    
    -- If still no user found, raise an error
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users table. Please create a user first.';
    END IF;
    
    -- Log which user we're seeding for
    RAISE NOTICE 'Seeding products for user: % (ID: %)', user_email, target_user_id;
    
    -- Clear existing test products for this user only
    DELETE FROM user_products 
    WHERE user_id = target_user_id 
    AND (name LIKE '%Test%' OR name IN ('Mleko', 'Chleb', 'Jajka', 'Jogurt', 'Pomidory', 'Ser', 'Masło', 'Marchewka', 'Banan', 'Ryż'));
    
    -- Insert sample products for development
    INSERT INTO user_products (id, user_id, name, category_id, quantity, unit, expires_at, created_at, updated_at)
    VALUES
      (gen_random_uuid(), target_user_id, 'Mleko', 1, 1, 'l', (NOW() + INTERVAL '3 days'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Chleb', 3, 1, 'szt', (NOW() + INTERVAL '1 day'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Jajka', 1, 12, 'szt', (NOW() + INTERVAL '7 days'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Jogurt naturalny', 1, 4, 'szt', (NOW() - INTERVAL '1 day'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Pomidory', 4, 6, 'szt', (NOW() + INTERVAL '5 days'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Ser żółty', 1, 200, 'g', (NOW() + INTERVAL '10 days'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Masło', 1, 1, 'szt', (NOW() + INTERVAL '14 days'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Marchewka', 4, 1, 'g', (NOW() + INTERVAL '8 days'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Banan', 5, 6, 'szt', (NOW() + INTERVAL '2 days'), NOW(), NOW()),
      (gen_random_uuid(), target_user_id, 'Ryż', 4, 1000, 'g', (NOW() + INTERVAL '365 days'), NOW(), NOW());
    
    -- Report success
    RAISE NOTICE 'Successfully seeded % products for user %', 10, user_email;
    
END $$;