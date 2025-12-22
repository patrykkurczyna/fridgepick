-- Seed data for product_categories table
-- This script populates the product_categories table with comprehensive categories
-- Run this in your Supabase SQL editor or via psql

-- Insert seed data for product categories (ON CONFLICT to handle existing data)
INSERT INTO product_categories (name, description) VALUES
  ('nabiał', 'Produkty mleczne: mleko, jogurty, sery, śmietana'),
  ('mięso', 'Mięso i wędliny: drób, wołowina, wieprzowina'),
  ('pieczywo', 'Pieczywo i wypieki: chleb, bułki, rogaliki'),
  ('warzywa', 'Warzywa świeże i przetworzone'),
  ('owoce', 'Owoce świeże i suszone'),
  ('jajka', 'Jajka i produkty jajeczne'),
  ('ryby', 'Ryby świeże, wędzone i owoce morza'),
  ('mrożonki', 'Produkty mrożone'),
  ('przetwory', 'Dżemy, przetwory, kiszonki'),
  ('makarony', 'Makarony i kluski'),
  ('kasze i ryże', 'Kasze, ryże i inne ziarna'),
  ('przyprawy', 'Przyprawy, zioła i dodatki smakowe'),
  ('sosy', 'Sosy, ketchupy, musztardy, majonezy'),
  ('napoje', 'Napoje, soki, woda'),
  ('słodycze', 'Słodycze, czekolada, przekąski'),
  ('oleje', 'Oleje, oliwy i tłuszcze'),
  ('bakalie', 'Orzechy, bakalie, suszone owoce'),
  ('produkty suche', 'Mąka, cukier, proszek do pieczenia')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  created_at = COALESCE(product_categories.created_at, NOW());

-- Verify the data was inserted
SELECT id, name, description, created_at
FROM product_categories
ORDER BY name;

-- Show count
SELECT COUNT(*) as total_categories FROM product_categories;
