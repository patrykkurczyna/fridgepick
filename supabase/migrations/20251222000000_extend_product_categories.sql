/*
  Migration: Extended Product Categories
  Purpose: Add comprehensive product categories for realistic fridge/pantry management

  New categories:
  - jajka: Eggs and egg products
  - ryby: Fish and seafood
  - mrożonki: Frozen foods
  - przetwory: Jams, pickles, preserves
  - makarony: Pasta and noodles
  - kasze i ryże: Grains and rice
  - przyprawy: Spices and herbs
  - sosy: Sauces and condiments
  - napoje: Beverages
  - słodycze: Sweets and snacks
  - oleje: Oils and fats
  - bakalie: Nuts and dried fruits
  - produkty suche: Flour, sugar, baking supplies
*/

-- Insert extended product categories (ON CONFLICT to avoid duplicates)
INSERT INTO product_categories (name, description) VALUES
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
  description = EXCLUDED.description;

-- Verify categories were added
SELECT id, name, description FROM product_categories ORDER BY name;
