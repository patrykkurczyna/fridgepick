/*
  Migration: Initial FridgePick MVP Database Schema
  Purpose: Create complete database schema for FridgePick meal planning application
  
  Affected Tables:
  - users: Application users with authentication data
  - product_categories: Dictionary of food product categories  
  - user_products: User's fridge/pantry inventory
  - recipes: Recipe database with nutritional information
  - recipe_ingredients: Recipe ingredient requirements
  - user_preferences: User's dietary preferences
  - weekly_meal_plans: Weekly meal planning data
  - meal_plan_items: Individual meals within plans
  - cooked_meals: Cooking history tracking
  - ai_recipe_recommendations: AI matching cache
  
  Security: Row Level Security (RLS) enabled on all tables
  Notes: Uses UUID primary keys, JSONB for flexible data, ENUM types for constrained values
*/

-- ===================================================================
-- CUSTOM TYPES
-- ===================================================================

-- create enum for measurement units (grams, liters, pieces)
create type unit_type as enum ('g', 'l', 'szt');

-- create enum for meal categories  
create type meal_category as enum ('śniadanie', 'obiad', 'kolacja', 'przekąska');

-- create enum for protein types in recipes
create type protein_type as enum ('ryba', 'drób', 'czerwone mięso', 'vege');

-- create enum for specific meal types in daily plans
create type meal_type as enum ('śniadanie', 'drugie śniadanie', 'obiad', 'podwieczorek', 'kolacja');

-- ===================================================================
-- TABLES
-- ===================================================================

-- users table: stores application user data and authentication info
create table users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    is_demo boolean default false,
    is_email_verified boolean default false,
    email_verification_token varchar(255),
    password_reset_token varchar(255),
    password_reset_expires_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- enable row level security on users table
alter table users enable row level security;

-- product_categories table: dictionary of food product categories
create table product_categories (
    id serial primary key,
    name varchar(50) unique not null,
    description text,
    created_at timestamp with time zone default now()
);

-- enable row level security on product_categories table (publicly readable)
alter table product_categories enable row level security;

-- user_products table: tracks user's fridge/pantry inventory
create table user_products (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    category_id integer not null references product_categories(id),
    name varchar(255) not null,
    quantity decimal(10,3) not null check (quantity >= 0),
    unit unit_type not null,
    expires_at date,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- enable row level security on user_products table
alter table user_products enable row level security;

-- recipes table: master recipe database with nutritional information
create table recipes (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    description text,
    instructions text not null,
    prep_time_minutes integer not null check (prep_time_minutes > 0),
    servings integer not null check (servings > 0),
    meal_category meal_category not null,
    protein_type protein_type not null,
    nutritional_values jsonb, -- format: {calories: 500, protein: 20, carbs: 30, fat: 15}
    image_url varchar(500),
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- enable row level security on recipes table (publicly readable)
alter table recipes enable row level security;

-- recipe_ingredients table: stores ingredients required for each recipe
create table recipe_ingredients (
    id uuid primary key default gen_random_uuid(),
    recipe_id uuid not null references recipes(id) on delete cascade,
    ingredient_name varchar(255) not null,
    quantity decimal(10,3) not null check (quantity > 0),
    unit unit_type not null,
    is_required boolean not null default true,
    created_at timestamp with time zone default now()
);

-- enable row level security on recipe_ingredients table (publicly readable)
alter table recipe_ingredients enable row level security;

-- user_preferences table: stores user's dietary preferences for meal planning
create table user_preferences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique not null references users(id) on delete cascade,
    max_meat_meals_per_week integer default 4 check (max_meat_meals_per_week >= 0),
    min_fish_meals_per_week integer default 1 check (min_fish_meals_per_week >= 0),
    max_fish_meals_per_week integer default 3 check (max_fish_meals_per_week >= min_fish_meals_per_week),
    vege_meals_per_week integer default 2 check (vege_meals_per_week >= 0),
    egg_breakfasts_per_week integer default 3 check (egg_breakfasts_per_week >= 0),
    egg_dinners_per_week integer default 2 check (egg_dinners_per_week >= 0),
    sweet_breakfast_ratio decimal(3,2) default 0.3 check (sweet_breakfast_ratio between 0 and 1),
    daily_calories integer default 2000 check (daily_calories > 0),
    additional_preferences jsonb, -- for future extensions
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- enable row level security on user_preferences table
alter table user_preferences enable row level security;

-- weekly_meal_plans table: stores weekly meal planning sessions
create table weekly_meal_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    name varchar(255) not null,
    week_start_date date not null,
    is_active boolean default true,
    generated_at timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- enable row level security on weekly_meal_plans table
alter table weekly_meal_plans enable row level security;

-- meal_plan_items table: individual meals within weekly plans
create table meal_plan_items (
    id uuid primary key default gen_random_uuid(),
    meal_plan_id uuid not null references weekly_meal_plans(id) on delete cascade,
    recipe_id uuid not null references recipes(id),
    meal_date date not null,
    meal_type meal_type not null,
    portions integer not null default 1 check (portions > 0),
    created_at timestamp with time zone default now()
);

-- enable row level security on meal_plan_items table
alter table meal_plan_items enable row level security;

-- cooked_meals table: tracks when users cook recipes (for ingredient deduction)
create table cooked_meals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    recipe_id uuid not null references recipes(id),
    portions_count integer not null check (portions_count > 0),
    cooked_at timestamp with time zone default now(),
    meal_plan_item_id uuid references meal_plan_items(id), -- optional link to meal plan
    created_at timestamp with time zone default now()
);

-- enable row level security on cooked_meals table
alter table cooked_meals enable row level security;

-- ai_recipe_recommendations table: caches AI recipe matching results for cost optimization
create table ai_recipe_recommendations (
    id uuid primary key default gen_random_uuid(),
    user_products_hash varchar(64) not null, -- sha256 hash of user's products
    user_id uuid not null references users(id) on delete cascade,
    recommendations jsonb not null, -- ai matching results
    created_at timestamp with time zone default now(),
    expires_at timestamp with time zone default now() + interval '24 hours'
);

-- enable row level security on ai_recipe_recommendations table
alter table ai_recipe_recommendations enable row level security;

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- user products optimization
create index idx_user_products_user_id on user_products(user_id);
create index idx_user_products_expires_at on user_products(expires_at) where expires_at is not null;
create index idx_user_products_user_expires on user_products(user_id, expires_at);

-- recipe search optimization  
create index idx_recipes_meal_category on recipes(meal_category);
create index idx_recipes_protein_type on recipes(protein_type);
create index idx_recipes_active on recipes(is_active) where is_active = true;
create index idx_recipe_ingredients_recipe_id on recipe_ingredients(recipe_id);
create index idx_recipe_ingredients_name on recipe_ingredients(ingredient_name);

-- meal planning optimization
create index idx_meal_plan_items_plan_id on meal_plan_items(meal_plan_id);
create index idx_meal_plan_items_date_type on meal_plan_items(meal_date, meal_type);
create index idx_weekly_meal_plans_user_id on weekly_meal_plans(user_id);
create index idx_weekly_meal_plans_active on weekly_meal_plans(user_id, is_active) where is_active = true;

-- cooking history optimization
create index idx_cooked_meals_user_id on cooked_meals(user_id);
create index idx_cooked_meals_recipe_id on cooked_meals(recipe_id);
create index idx_cooked_meals_date on cooked_meals(cooked_at);

-- ai cache optimization
create index idx_ai_recommendations_hash on ai_recipe_recommendations(user_products_hash);
create index idx_ai_recommendations_expires on ai_recipe_recommendations(expires_at);

-- jsonb indexes for flexible queries
create index idx_recipes_calories on recipes using gin ((nutritional_values->'calories'));
create index idx_recipes_nutritional_gin on recipes using gin (nutritional_values);
create index idx_user_preferences_additional_gin on user_preferences using gin (additional_preferences);

-- unique constraints to prevent duplicates
create unique index idx_meal_plan_unique_meal on meal_plan_items(meal_plan_id, meal_date, meal_type);
create unique index idx_user_preferences_unique on user_preferences(user_id);

-- ===================================================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================================================

-- users table policies: users can only access their own data
create policy "users can view own profile" on users
    for select using (auth.uid() = id);

create policy "users can update own profile" on users  
    for update using (auth.uid() = id);

-- product_categories policies: publicly readable reference data
create policy "anyone can view product categories" on product_categories
    for select using (true);

-- user_products policies: users can only access their own products
create policy "authenticated users can view own products" on user_products
    for select using (auth.uid() = user_id);

create policy "authenticated users can insert own products" on user_products
    for insert with check (auth.uid() = user_id);

create policy "authenticated users can update own products" on user_products
    for update using (auth.uid() = user_id);

create policy "authenticated users can delete own products" on user_products
    for delete using (auth.uid() = user_id);

-- recipes policies: publicly readable recipe database
create policy "anyone can view active recipes" on recipes
    for select using (is_active = true);

-- recipe_ingredients policies: publicly readable for active recipes
create policy "anyone can view recipe ingredients" on recipe_ingredients
    for select using (
        exists (
            select 1 from recipes 
            where recipes.id = recipe_ingredients.recipe_id 
            and recipes.is_active = true
        )
    );

-- user_preferences policies: users can only access their own preferences
create policy "authenticated users can view own preferences" on user_preferences
    for select using (auth.uid() = user_id);

create policy "authenticated users can insert own preferences" on user_preferences
    for insert with check (auth.uid() = user_id);

create policy "authenticated users can update own preferences" on user_preferences
    for update using (auth.uid() = user_id);

create policy "authenticated users can delete own preferences" on user_preferences
    for delete using (auth.uid() = user_id);

-- weekly_meal_plans policies: users can only access their own meal plans
create policy "authenticated users can view own meal plans" on weekly_meal_plans
    for select using (auth.uid() = user_id);

create policy "authenticated users can insert own meal plans" on weekly_meal_plans
    for insert with check (auth.uid() = user_id);

create policy "authenticated users can update own meal plans" on weekly_meal_plans
    for update using (auth.uid() = user_id);

create policy "authenticated users can delete own meal plans" on weekly_meal_plans
    for delete using (auth.uid() = user_id);

-- meal_plan_items policies: users can only access items from their own meal plans
create policy "authenticated users can view own meal plan items" on meal_plan_items
    for select using (
        exists (
            select 1 from weekly_meal_plans 
            where weekly_meal_plans.id = meal_plan_items.meal_plan_id 
            and weekly_meal_plans.user_id = auth.uid()
        )
    );

create policy "authenticated users can insert own meal plan items" on meal_plan_items
    for insert with check (
        exists (
            select 1 from weekly_meal_plans 
            where weekly_meal_plans.id = meal_plan_items.meal_plan_id 
            and weekly_meal_plans.user_id = auth.uid()
        )
    );

create policy "authenticated users can update own meal plan items" on meal_plan_items
    for update using (
        exists (
            select 1 from weekly_meal_plans 
            where weekly_meal_plans.id = meal_plan_items.meal_plan_id 
            and weekly_meal_plans.user_id = auth.uid()
        )
    );

create policy "authenticated users can delete own meal plan items" on meal_plan_items
    for delete using (
        exists (
            select 1 from weekly_meal_plans 
            where weekly_meal_plans.id = meal_plan_items.meal_plan_id 
            and weekly_meal_plans.user_id = auth.uid()
        )
    );

-- cooked_meals policies: users can only access their own cooking history
create policy "authenticated users can view own cooked meals" on cooked_meals
    for select using (auth.uid() = user_id);

create policy "authenticated users can insert own cooked meals" on cooked_meals
    for insert with check (auth.uid() = user_id);

create policy "authenticated users can update own cooked meals" on cooked_meals
    for update using (auth.uid() = user_id);

create policy "authenticated users can delete own cooked meals" on cooked_meals
    for delete using (auth.uid() = user_id);

-- ai_recipe_recommendations policies: users can only access their own ai cache
create policy "authenticated users can view own ai recommendations" on ai_recipe_recommendations
    for select using (auth.uid() = user_id);

create policy "authenticated users can insert own ai recommendations" on ai_recipe_recommendations
    for insert with check (auth.uid() = user_id);

create policy "authenticated users can update own ai recommendations" on ai_recipe_recommendations
    for update using (auth.uid() = user_id);

create policy "authenticated users can delete own ai recommendations" on ai_recipe_recommendations
    for delete using (auth.uid() = user_id);

-- ===================================================================
-- SEED DATA
-- ===================================================================

-- insert default product categories
insert into product_categories (name, description) values
('nabiał', 'Produkty mleczne i nabiałowe'),
('mięso', 'Mięso i produkty mięsne'), 
('pieczywo', 'Pieczywo i wypieki'),
('warzywa', 'Warzywa świeże i przetworzone'),
('owoce', 'Owoce świeże i suszone');

-- ===================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ===================================================================

-- function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- create triggers for tables with updated_at columns
create trigger update_users_updated_at before update on users
    for each row execute function update_updated_at_column();

create trigger update_user_products_updated_at before update on user_products
    for each row execute function update_updated_at_column();

create trigger update_recipes_updated_at before update on recipes
    for each row execute function update_updated_at_column();

create trigger update_user_preferences_updated_at before update on user_preferences
    for each row execute function update_updated_at_column();