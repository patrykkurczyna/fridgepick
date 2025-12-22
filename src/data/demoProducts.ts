/**
 * Demo products for seeding - realistic fridge/pantry inventory
 * Grouped by category name (will be mapped to category IDs at runtime)
 */
export interface DemoProduct {
  name: string;
  category: string;
  quantity: number;
  unit: "g" | "l" | "szt";
  expiresInDays: number; // Days from now until expiry
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  // Nabiał (Dairy)
  { name: "Mleko 3.2%", category: "nabiał", quantity: 2, unit: "l", expiresInDays: 7 },
  { name: "Jogurt naturalny", category: "nabiał", quantity: 500, unit: "g", expiresInDays: 14 },
  { name: "Ser żółty gouda", category: "nabiał", quantity: 300, unit: "g", expiresInDays: 21 },
  { name: "Ser biały twarogowy", category: "nabiał", quantity: 250, unit: "g", expiresInDays: 7 },
  { name: "Masło", category: "nabiał", quantity: 200, unit: "g", expiresInDays: 30 },
  { name: "Śmietana 18%", category: "nabiał", quantity: 400, unit: "g", expiresInDays: 10 },
  { name: "Kefir", category: "nabiał", quantity: 400, unit: "g", expiresInDays: 14 },

  // Mięso (Meat)
  { name: "Filet z kurczaka", category: "mięso", quantity: 600, unit: "g", expiresInDays: 3 },
  { name: "Mięso mielone wołowe", category: "mięso", quantity: 500, unit: "g", expiresInDays: 2 },
  { name: "Schab wieprzowy", category: "mięso", quantity: 400, unit: "g", expiresInDays: 4 },
  { name: "Boczek wędzony", category: "mięso", quantity: 200, unit: "g", expiresInDays: 14 },
  { name: "Szynka wędzona", category: "mięso", quantity: 150, unit: "g", expiresInDays: 10 },
  { name: "Kiełbasa śląska", category: "mięso", quantity: 300, unit: "g", expiresInDays: 7 },

  // Jajka (Eggs)
  { name: "Jajka L", category: "jajka", quantity: 10, unit: "szt", expiresInDays: 21 },

  // Ryby (Fish)
  { name: "Łosoś wędzony", category: "ryby", quantity: 150, unit: "g", expiresInDays: 7 },
  { name: "Filet z dorsza", category: "ryby", quantity: 400, unit: "g", expiresInDays: 2 },

  // Pieczywo (Bread)
  { name: "Chleb pszenny", category: "pieczywo", quantity: 500, unit: "g", expiresInDays: 5 },
  { name: "Bułki kajzerki", category: "pieczywo", quantity: 6, unit: "szt", expiresInDays: 3 },
  { name: "Chleb tostowy", category: "pieczywo", quantity: 400, unit: "g", expiresInDays: 7 },

  // Warzywa (Vegetables)
  { name: "Pomidory", category: "warzywa", quantity: 500, unit: "g", expiresInDays: 7 },
  { name: "Ogórki", category: "warzywa", quantity: 400, unit: "g", expiresInDays: 7 },
  { name: "Papryka czerwona", category: "warzywa", quantity: 300, unit: "g", expiresInDays: 10 },
  { name: "Cebula", category: "warzywa", quantity: 500, unit: "g", expiresInDays: 30 },
  { name: "Czosnek", category: "warzywa", quantity: 100, unit: "g", expiresInDays: 30 },
  { name: "Ziemniaki", category: "warzywa", quantity: 2000, unit: "g", expiresInDays: 21 },
  { name: "Marchew", category: "warzywa", quantity: 500, unit: "g", expiresInDays: 14 },
  { name: "Pietruszka korzeń", category: "warzywa", quantity: 200, unit: "g", expiresInDays: 14 },
  { name: "Seler", category: "warzywa", quantity: 300, unit: "g", expiresInDays: 14 },
  { name: "Por", category: "warzywa", quantity: 200, unit: "g", expiresInDays: 10 },
  { name: "Sałata lodowa", category: "warzywa", quantity: 300, unit: "g", expiresInDays: 5 },
  { name: "Szpinak", category: "warzywa", quantity: 200, unit: "g", expiresInDays: 4 },
  { name: "Brokuły", category: "warzywa", quantity: 400, unit: "g", expiresInDays: 5 },
  { name: "Kalafior", category: "warzywa", quantity: 500, unit: "g", expiresInDays: 7 },
  { name: "Kapusta biała", category: "warzywa", quantity: 800, unit: "g", expiresInDays: 14 },

  // Owoce (Fruits)
  { name: "Jabłka", category: "owoce", quantity: 1000, unit: "g", expiresInDays: 14 },
  { name: "Banany", category: "owoce", quantity: 600, unit: "g", expiresInDays: 5 },
  { name: "Pomarańcze", category: "owoce", quantity: 800, unit: "g", expiresInDays: 10 },
  { name: "Cytryny", category: "owoce", quantity: 300, unit: "g", expiresInDays: 21 },

  // Makarony (Pasta)
  { name: "Makaron spaghetti", category: "makarony", quantity: 500, unit: "g", expiresInDays: 365 },
  { name: "Makaron penne", category: "makarony", quantity: 500, unit: "g", expiresInDays: 365 },
  { name: "Makaron świderki", category: "makarony", quantity: 400, unit: "g", expiresInDays: 365 },

  // Kasze i ryże (Grains)
  { name: "Ryż biały", category: "kasze i ryże", quantity: 1000, unit: "g", expiresInDays: 365 },
  { name: "Kasza gryczana", category: "kasze i ryże", quantity: 500, unit: "g", expiresInDays: 365 },
  { name: "Kasza jęczmienna", category: "kasze i ryże", quantity: 400, unit: "g", expiresInDays: 365 },
  { name: "Płatki owsiane", category: "kasze i ryże", quantity: 500, unit: "g", expiresInDays: 180 },

  // Przyprawy (Spices)
  { name: "Sól", category: "przyprawy", quantity: 500, unit: "g", expiresInDays: 730 },
  { name: "Pieprz czarny mielony", category: "przyprawy", quantity: 50, unit: "g", expiresInDays: 365 },
  { name: "Papryka słodka", category: "przyprawy", quantity: 50, unit: "g", expiresInDays: 365 },
  { name: "Oregano", category: "przyprawy", quantity: 20, unit: "g", expiresInDays: 365 },
  { name: "Bazylia suszona", category: "przyprawy", quantity: 20, unit: "g", expiresInDays: 365 },
  { name: "Liść laurowy", category: "przyprawy", quantity: 10, unit: "g", expiresInDays: 365 },
  { name: "Ziele angielskie", category: "przyprawy", quantity: 20, unit: "g", expiresInDays: 365 },

  // Sosy (Sauces)
  { name: "Ketchup", category: "sosy", quantity: 500, unit: "g", expiresInDays: 180 },
  { name: "Musztarda", category: "sosy", quantity: 200, unit: "g", expiresInDays: 180 },
  { name: "Majonez", category: "sosy", quantity: 400, unit: "g", expiresInDays: 90 },
  { name: "Sos sojowy", category: "sosy", quantity: 250, unit: "g", expiresInDays: 365 },
  { name: "Passata pomidorowa", category: "sosy", quantity: 500, unit: "g", expiresInDays: 365 },

  // Oleje (Oils)
  { name: "Olej rzepakowy", category: "oleje", quantity: 1, unit: "l", expiresInDays: 365 },
  { name: "Oliwa z oliwek", category: "oleje", quantity: 500, unit: "g", expiresInDays: 365 },

  // Produkty suche (Dry goods)
  { name: "Mąka pszenna", category: "produkty suche", quantity: 1000, unit: "g", expiresInDays: 365 },
  { name: "Cukier", category: "produkty suche", quantity: 1000, unit: "g", expiresInDays: 730 },
  { name: "Proszek do pieczenia", category: "produkty suche", quantity: 30, unit: "g", expiresInDays: 365 },

  // Przetwory (Preserves)
  { name: "Dżem truskawkowy", category: "przetwory", quantity: 280, unit: "g", expiresInDays: 365 },
  { name: "Miód naturalny", category: "przetwory", quantity: 400, unit: "g", expiresInDays: 730 },
  { name: "Ogórki kiszone", category: "przetwory", quantity: 500, unit: "g", expiresInDays: 180 },

  // Mrożonki (Frozen)
  { name: "Mrożone warzywa mieszanka", category: "mrożonki", quantity: 450, unit: "g", expiresInDays: 180 },
  { name: "Mrożone truskawki", category: "mrożonki", quantity: 400, unit: "g", expiresInDays: 180 },
  { name: "Mrożony groszek", category: "mrożonki", quantity: 400, unit: "g", expiresInDays: 180 },

  // Napoje (Beverages)
  { name: "Sok pomarańczowy", category: "napoje", quantity: 1, unit: "l", expiresInDays: 14 },
  { name: "Woda mineralna", category: "napoje", quantity: 1.5, unit: "l", expiresInDays: 365 },

  // Bakalie (Nuts & Dried fruits)
  { name: "Orzechy włoskie", category: "bakalie", quantity: 200, unit: "g", expiresInDays: 180 },
  { name: "Migdały", category: "bakalie", quantity: 150, unit: "g", expiresInDays: 180 },
  { name: "Rodzynki", category: "bakalie", quantity: 100, unit: "g", expiresInDays: 180 },
];
