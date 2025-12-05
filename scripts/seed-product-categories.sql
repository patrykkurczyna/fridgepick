-- Seed data for product_categories table
-- This script populates the product_categories table with test data
-- Run this in your Supabase SQL editor or via psql

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM product_categories;

-- Insert seed data for product categories
INSERT INTO product_categories (name, description) VALUES
  ('nabiał', 'Produkty mleczne i nabiałowe'),
  ('mięso', 'Mięso i produkty mięsne'),
  ('pieczywo', 'Pieczywo i wypieki'),
  ('warzywa', 'Warzywa świeże i przetworzone'),
  ('owoce', 'Owoce świeże i suszone'),
  ('przyprawy', 'Zioła i przyprawy kuchenne'),
  ('napoje', 'Napoje bezalkoholowe i alkoholowe'),
  ('słodycze', 'Cukierki, czekolada i słodkie przekąski'),
  ('ryby', 'Ryby świeże i przetworzone'),
  ('zboża', 'Kasze, ryż, makaron'),
  ('oleje', 'Oleje i tłuszcze spożywcze'),
  ('konserwy', 'Produkty w puszkach i słoikach')
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  created_at = COALESCE(product_categories.created_at, NOW());

-- Verify the data was inserted
SELECT id, name, description, created_at 
FROM product_categories 
ORDER BY name;

-- Show count
SELECT COUNT(*) as total_categories FROM product_categories;