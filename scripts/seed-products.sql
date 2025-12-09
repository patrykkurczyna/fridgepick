-- Clear existing test products
DELETE FROM user_products WHERE name LIKE '%Test%' OR name IN ('Mleko', 'Chleb', 'Jajka', 'Jogurt', 'Pomidory', 'Ser', 'Masło', 'Marchewka');

-- Insert sample products for development
-- Get the current user ID (you'll need to replace with your actual user ID)
-- For now using the user ID from the token

INSERT INTO user_products (id, name, category_id, quantity, unit, expires_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Mleko', 1, 1, 'L', (NOW() + INTERVAL '3 days'), NOW(), NOW()),
  (gen_random_uuid(), 'Chleb', 2, 1, 'szt', (NOW() + INTERVAL '1 day'), NOW(), NOW()),
  (gen_random_uuid(), 'Jajka', 1, 12, 'szt', (NOW() + INTERVAL '7 days'), NOW(), NOW()),
  (gen_random_uuid(), 'Jogurt', 1, 4, 'szt', (NOW() - INTERVAL '1 day'), NOW(), NOW()),
  (gen_random_uuid(), 'Pomidory', 3, 6, 'szt', (NOW() + INTERVAL '5 days'), NOW(), NOW()),
  (gen_random_uuid(), 'Ser', 1, 200, 'g', (NOW() + INTERVAL '10 days'), NOW(), NOW()),
  (gen_random_uuid(), 'Masło', 1, 1, 'kostka', (NOW() + INTERVAL '14 days'), NOW(), NOW()),
  (gen_random_uuid(), 'Marchewka', 3, 1, 'kg', (NOW() + INTERVAL '8 days'), NOW(), NOW()),
  (gen_random_uuid(), 'Banan', 4, 6, 'szt', (NOW() + INTERVAL '2 days'), NOW(), NOW()),
  (gen_random_uuid(), 'Ryż', 5, 1, 'kg', (NOW() + INTERVAL '365 days'), NOW(), NOW());