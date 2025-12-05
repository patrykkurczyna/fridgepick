# Database Schema Plan - FridgePick MVP

## 1. Tabele

### 1.1 users
Tabela przechowująca dane użytkowników aplikacji

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_demo BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.2 product_categories
Słownik kategorii produktów

```sql
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data
INSERT INTO product_categories (name, description) VALUES
('nabiał', 'Produkty mleczne i nabiałowe'),
('mięso', 'Mięso i produkty mięsne'),
('pieczywo', 'Pieczywo i wypieki'),
('warzywa', 'Warzywa świeże i przetworzone'),
('owoce', 'Owoce świeże i suszone');
```

### 1.3 user_products
Produkty posiadane przez użytkowników

```sql
CREATE TYPE unit_type AS ENUM ('g', 'l', 'szt');

CREATE TABLE user_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES product_categories(id),
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity >= 0),
    unit unit_type NOT NULL,
    expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.4 recipes
Baza przepisów

```sql
CREATE TYPE meal_category AS ENUM ('śniadanie', 'obiad', 'kolacja', 'przekąska');
CREATE TYPE protein_type AS ENUM ('ryba', 'drób', 'czerwone mięso', 'vege');

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    prep_time_minutes INTEGER NOT NULL CHECK (prep_time_minutes > 0),
    servings INTEGER NOT NULL CHECK (servings > 0),
    meal_category meal_category NOT NULL,
    protein_type protein_type NOT NULL,
    nutritional_values JSONB, -- {calories: 500, protein: 20, carbs: 30, fat: 15}
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.5 recipe_ingredients
Składniki przepisów

```sql
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit unit_type NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.6 user_preferences
Preferencje żywieniowe użytkowników

```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_meat_meals_per_week INTEGER DEFAULT 4 CHECK (max_meat_meals_per_week >= 0),
    min_fish_meals_per_week INTEGER DEFAULT 1 CHECK (min_fish_meals_per_week >= 0),
    max_fish_meals_per_week INTEGER DEFAULT 3 CHECK (max_fish_meals_per_week >= min_fish_meals_per_week),
    vege_meals_per_week INTEGER DEFAULT 2 CHECK (vege_meals_per_week >= 0),
    egg_breakfasts_per_week INTEGER DEFAULT 3 CHECK (egg_breakfasts_per_week >= 0),
    egg_dinners_per_week INTEGER DEFAULT 2 CHECK (egg_dinners_per_week >= 0),
    sweet_breakfast_ratio DECIMAL(3,2) DEFAULT 0.3 CHECK (sweet_breakfast_ratio BETWEEN 0 AND 1),
    daily_calories INTEGER DEFAULT 2000 CHECK (daily_calories > 0),
    additional_preferences JSONB, -- Dla przyszłych rozszerzeń
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.7 weekly_meal_plans
Plany tygodniowych jadłospisów

```sql
CREATE TABLE weekly_meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    week_start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.8 meal_plan_items
Pojedyncze posiłki w planach

```sql
CREATE TYPE meal_type AS ENUM ('śniadanie', 'drugie śniadanie', 'obiad', 'podwieczorek', 'kolacja');

CREATE TABLE meal_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES weekly_meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id),
    meal_date DATE NOT NULL,
    meal_type meal_type NOT NULL,
    portions INTEGER NOT NULL DEFAULT 1 CHECK (portions > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.9 cooked_meals
Historia ugotowanych posiłków

```sql
CREATE TABLE cooked_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id),
    portions_count INTEGER NOT NULL CHECK (portions_count > 0),
    cooked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    meal_plan_item_id UUID REFERENCES meal_plan_items(id), -- Opcjonalne powiązanie z planem
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.10 ai_recipe_recommendations
Cache wyników AI

```sql
CREATE TABLE ai_recipe_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_products_hash VARCHAR(64) NOT NULL, -- SHA256 hash z user_products
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendations JSONB NOT NULL, -- Wyniki dopasowania AI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);
```

## 2. Relacje między tabelami

### 2.1 Relacje jeden-do-wielu (1:N)
- `users` → `user_products` (1:N) - Jeden użytkownik ma wiele produktów
- `users` → `user_preferences` (1:1) - Jeden użytkownik ma jedne preferencje  
- `users` → `weekly_meal_plans` (1:N) - Jeden użytkownik ma wiele planów
- `users` → `cooked_meals` (1:N) - Jeden użytkownik ma wiele ugotowanych posiłków
- `users` → `ai_recipe_recommendations` (1:N) - Jeden użytkownik ma wiele cache'y AI
- `product_categories` → `user_products` (1:N) - Jedna kategoria ma wiele produktów
- `recipes` → `recipe_ingredients` (1:N) - Jeden przepis ma wiele składników
- `recipes` → `meal_plan_items` (1:N) - Jeden przepis może być w wielu planach
- `recipes` → `cooked_meals` (1:N) - Jeden przepis może być ugotowany wiele razy
- `weekly_meal_plans` → `meal_plan_items` (1:N) - Jeden plan ma wiele posiłków
- `meal_plan_items` → `cooked_meals` (1:0..1) - Opcjonalne powiązanie

### 2.2 Kardynalność
- User może mieć 0..∞ produktów
- User może mieć 0..1 preferencji
- User może mieć 0..∞ planów tygodniowych  
- Plan tygodniowy ma 35 posiłków (7 dni × 5 posiłków)
- Przepis może mieć 1..∞ składników

## 3. Indeksy

### 3.1 Indeksy podstawowe
```sql
-- Optymalizacja zapytań użytkowników
CREATE INDEX idx_user_products_user_id ON user_products(user_id);
CREATE INDEX idx_user_products_expires_at ON user_products(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_user_products_user_expires ON user_products(user_id, expires_at);

-- Optymalizacja wyszukiwania przepisów
CREATE INDEX idx_recipes_meal_category ON recipes(meal_category);
CREATE INDEX idx_recipes_protein_type ON recipes(protein_type);
CREATE INDEX idx_recipes_active ON recipes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_name ON recipe_ingredients(ingredient_name);

-- Optymalizacja planów posiłków
CREATE INDEX idx_meal_plan_items_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_date_type ON meal_plan_items(meal_date, meal_type);
CREATE INDEX idx_weekly_meal_plans_user_id ON weekly_meal_plans(user_id);
CREATE INDEX idx_weekly_meal_plans_active ON weekly_meal_plans(user_id, is_active) WHERE is_active = TRUE;

-- Optymalizacja trackingu
CREATE INDEX idx_cooked_meals_user_id ON cooked_meals(user_id);
CREATE INDEX idx_cooked_meals_recipe_id ON cooked_meals(recipe_id);
CREATE INDEX idx_cooked_meals_date ON cooked_meals(cooked_at);

-- Cache AI
CREATE INDEX idx_ai_recommendations_hash ON ai_recipe_recommendations(user_products_hash);
CREATE INDEX idx_ai_recommendations_expires ON ai_recipe_recommendations(expires_at);
```

### 3.2 Indeksy JSONB
```sql
-- Indeksy dla wartości odżywczych
CREATE INDEX idx_recipes_calories ON recipes USING GIN ((nutritional_values->'calories'));
CREATE INDEX idx_recipes_nutritional_gin ON recipes USING GIN (nutritional_values);

-- Indeksy dla preferencji dodatkowych
CREATE INDEX idx_user_preferences_additional_gin ON user_preferences USING GIN (additional_preferences);
```

### 3.3 Indeksy unikalne
```sql
-- Zapobieganie duplikatom
CREATE UNIQUE INDEX idx_meal_plan_unique_meal ON meal_plan_items(meal_plan_id, meal_date, meal_type);
CREATE UNIQUE INDEX idx_user_preferences_unique ON user_preferences(user_id);
```

## 4. Dodatkowe uwagi projektowe

### 4.1 Typy danych
- **UUID** dla kluczy głównych - lepsze dla aplikacji rozproszonych i bezpieczeństwa
- **ENUM** dla ograniczonych wartości - jednostki miary, kategorie posiłków
- **JSONB** dla elastycznych struktur - wartości odżywcze, cache AI
- **DECIMAL** dla ilości produktów - precyzja dla obliczeń finansowych/ilościowych
- **TIMESTAMP WITH TIME ZONE** dla dat - obsługa stref czasowych

### 4.2 Ograniczenia integralności
- **CHECK constraints** dla logicznych ograniczeń (ilości > 0, proporcje 0-1)
- **FOREIGN KEY** z CASCADE dla zachowania spójności
- **NOT NULL** dla wymaganych pól
- **UNIQUE** dla unikalnych wartości

### 4.3 Wydajność
- Indeksy kompozytowe dla częstych zapytań wielokolumnowych
- Indeksy GIN dla JSONB i full-text search
- Indeksy częściowe dla filtrowanych zapytań (WHERE clauses)

### 4.4 Skalowalność
- Partycjonowanie `cooked_meals` po dacie (dla dużych objętości)
- TTL dla cache AI (automatyczne czyszczenie)
- Soft delete dla przepisów (`is_active`)

### 4.5 Bezpieczeństwo (MVP - bez RLS)
- Walidacja na poziomie aplikacji
- Hash'owanie haseł
- Tokeny dla weryfikacji email/reset hasła
- Separacja demo users (`is_demo` flag)

### 4.6 Migracja i seedowanie
- Kategorie produktów jako dane seed
- Demo user z predefiniowanymi danymi
- Przykładowe przepisy jako seed data
- Triggery dla `updated_at` timestamps