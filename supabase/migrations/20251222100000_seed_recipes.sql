/*
  Migration: Seed Recipes
  Purpose: Insert 40 recipes (10 per meal category) with ingredients for MVP testing

  Categories:
  - śniadanie (breakfast): 10 recipes
  - obiad (lunch/dinner): 10 recipes
  - kolacja (supper): 10 recipes
  - przekąska (snack): 10 recipes

  Recipes are designed to match demo products from demoProducts.ts
*/

-- ===================================================================
-- ŚNIADANIE (Breakfast) - 10 recipes
-- ===================================================================

-- 1. Jajecznica z boczkiem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Jajecznica z boczkiem',
  'Klasyczna jajecznica z chrupiącym boczkiem i szczypiorkiem',
  '<ol><li>Pokrój boczek w kostkę i podsmaż na patelni do chrupkości.</li><li>Rozbij jajka do miski i lekko roztrzep widelcem.</li><li>Wlej jajka na patelnię z boczkiem.</li><li>Mieszaj delikatnie, aż jajka się zetną.</li><li>Dopraw solą i pieprzem. Podawaj z pieczywem.</li></ol>',
  15, 2, 'śniadanie', 'czerwone mięso',
  '{"calories": 380, "protein": 22, "carbs": 2, "fat": 32}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 4, 'szt', true FROM recipes WHERE name = 'Jajecznica z boczkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Boczek wędzony', 80, 'g', true FROM recipes WHERE name = 'Jajecznica z boczkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 10, 'g', false FROM recipes WHERE name = 'Jajecznica z boczkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Sól', 2, 'g', false FROM recipes WHERE name = 'Jajecznica z boczkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pieprz czarny mielony', 1, 'g', false FROM recipes WHERE name = 'Jajecznica z boczkiem';

-- 2. Owsianka z bananami i miodem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Owsianka z bananami i miodem',
  'Kremowa owsianka z świeżymi bananami, miodem i orzechami',
  '<ol><li>Wsyp płatki owsiane do garnka i zalej mlekiem.</li><li>Gotuj na małym ogniu ok. 5 minut, mieszając.</li><li>Pokrój banana w plasterki.</li><li>Przełóż owsiankę do miseczki, ułóż banana na wierzchu.</li><li>Polej miodem i posyp orzechami.</li></ol>',
  10, 1, 'śniadanie', 'vege',
  '{"calories": 420, "protein": 12, "carbs": 68, "fat": 12}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Płatki owsiane', 60, 'g', true FROM recipes WHERE name = 'Owsianka z bananami i miodem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mleko 3.2%', 0.25, 'l', true FROM recipes WHERE name = 'Owsianka z bananami i miodem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Banany', 120, 'g', true FROM recipes WHERE name = 'Owsianka z bananami i miodem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Miód naturalny', 20, 'g', false FROM recipes WHERE name = 'Owsianka z bananami i miodem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Orzechy włoskie', 20, 'g', false FROM recipes WHERE name = 'Owsianka z bananami i miodem';

-- 3. Kanapki z łososiem wędzonym
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Kanapki z łososiem wędzonym',
  'Eleganckie kanapki z łososiem, serkiem i kaparami',
  '<ol><li>Pokrój chleb w kromki i lekko opiecz.</li><li>Posmaruj kromki masłem.</li><li>Ułóż plastry łososia na chlebie.</li><li>Dodaj plasterki ogórka.</li><li>Skrop sokiem z cytryny i podawaj.</li></ol>',
  10, 2, 'śniadanie', 'ryba',
  '{"calories": 320, "protein": 18, "carbs": 28, "fat": 16}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb pszenny', 100, 'g', true FROM recipes WHERE name = 'Kanapki z łososiem wędzonym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Łosoś wędzony', 80, 'g', true FROM recipes WHERE name = 'Kanapki z łososiem wędzonym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 20, 'g', true FROM recipes WHERE name = 'Kanapki z łososiem wędzonym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ogórki', 50, 'g', false FROM recipes WHERE name = 'Kanapki z łososiem wędzonym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cytryny', 20, 'g', false FROM recipes WHERE name = 'Kanapki z łososiem wędzonym';

-- 4. Tosty z jajkiem i serem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Tosty z jajkiem i serem',
  'Chrupiące tosty z jajkiem sadzonym i żółtym serem',
  '<ol><li>Opiecz tosty w tosterze lub na patelni.</li><li>Usmaż jajka sadzone na maśle.</li><li>Połóż plastry sera na gorącym toście.</li><li>Ułóż jajko sadzone na wierzchu.</li><li>Dopraw solą i pieprzem.</li></ol>',
  10, 1, 'śniadanie', 'vege',
  '{"calories": 450, "protein": 24, "carbs": 32, "fat": 26}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb tostowy', 60, 'g', true FROM recipes WHERE name = 'Tosty z jajkiem i serem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 2, 'szt', true FROM recipes WHERE name = 'Tosty z jajkiem i serem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ser żółty gouda', 40, 'g', true FROM recipes WHERE name = 'Tosty z jajkiem i serem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 10, 'g', false FROM recipes WHERE name = 'Tosty z jajkiem i serem';

-- 5. Jogurt z owocami i muesli
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Jogurt z owocami i muesli',
  'Świeży jogurt naturalny z sezonowymi owocami i chrupiącym muesli',
  '<ol><li>Pokrój jabłko w kosteczkę.</li><li>Wyłóż jogurt do miseczki.</li><li>Dodaj pokrojone owoce.</li><li>Posyp płatkami owsianymi i migdałami.</li><li>Polej miodem i podawaj od razu.</li></ol>',
  5, 1, 'śniadanie', 'vege',
  '{"calories": 340, "protein": 14, "carbs": 48, "fat": 10}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jogurt naturalny', 200, 'g', true FROM recipes WHERE name = 'Jogurt z owocami i muesli';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jabłka', 100, 'g', true FROM recipes WHERE name = 'Jogurt z owocami i muesli';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Płatki owsiane', 30, 'g', false FROM recipes WHERE name = 'Jogurt z owocami i muesli';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Miód naturalny', 15, 'g', false FROM recipes WHERE name = 'Jogurt z owocami i muesli';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Migdały', 15, 'g', false FROM recipes WHERE name = 'Jogurt z owocami i muesli';

-- 6. Naleśniki z dżemem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Naleśniki z dżemem',
  'Puszyste naleśniki z domowym dżemem truskawkowym',
  '<ol><li>Wymieszaj mąkę z jajkami.</li><li>Stopniowo dodawaj mleko, mieszając.</li><li>Smaż cienkie naleśniki na rozgrzanej patelni z masłem.</li><li>Smaruj każdy naleśnik dżemem i zwijaj.</li><li>Posyp cukrem pudrem przed podaniem.</li></ol>',
  25, 4, 'śniadanie', 'vege',
  '{"calories": 320, "protein": 10, "carbs": 52, "fat": 8}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mąka pszenna', 200, 'g', true FROM recipes WHERE name = 'Naleśniki z dżemem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 2, 'szt', true FROM recipes WHERE name = 'Naleśniki z dżemem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mleko 3.2%', 0.4, 'l', true FROM recipes WHERE name = 'Naleśniki z dżemem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Dżem truskawkowy', 80, 'g', true FROM recipes WHERE name = 'Naleśniki z dżemem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 30, 'g', false FROM recipes WHERE name = 'Naleśniki z dżemem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cukier', 20, 'g', false FROM recipes WHERE name = 'Naleśniki z dżemem';

-- 7. Twarożek ze szczypiorkiem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Twarożek ze szczypiorkiem',
  'Kremowy twarożek z dodatkiem szczypiorku i rzodkiewki',
  '<ol><li>Rozgnieć twaróg widelcem.</li><li>Dodaj śmietanę i wymieszaj do gładkości.</li><li>Dopraw solą i pieprzem.</li><li>Podawaj na świeżym pieczywie.</li></ol>',
  10, 2, 'śniadanie', 'vege',
  '{"calories": 220, "protein": 16, "carbs": 6, "fat": 14}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ser biały twarogowy', 200, 'g', true FROM recipes WHERE name = 'Twarożek ze szczypiorkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Śmietana 18%', 50, 'g', true FROM recipes WHERE name = 'Twarożek ze szczypiorkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb pszenny', 80, 'g', false FROM recipes WHERE name = 'Twarożek ze szczypiorkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Sól', 2, 'g', false FROM recipes WHERE name = 'Twarożek ze szczypiorkiem';

-- 8. Bułki z szynką i serem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Bułki z szynką i serem',
  'Klasyczne bułki śniadaniowe z szynką, serem i warzywami',
  '<ol><li>Przekrój bułki na pół.</li><li>Posmaruj masłem.</li><li>Ułóż plastry szynki i sera.</li><li>Dodaj plasterki pomidora i sałatę.</li><li>Dopraw pieprzem i podawaj.</li></ol>',
  10, 2, 'śniadanie', 'czerwone mięso',
  '{"calories": 380, "protein": 18, "carbs": 36, "fat": 18}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Bułki kajzerki', 2, 'szt', true FROM recipes WHERE name = 'Bułki z szynką i serem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Szynka wędzona', 60, 'g', true FROM recipes WHERE name = 'Bułki z szynką i serem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ser żółty gouda', 40, 'g', true FROM recipes WHERE name = 'Bułki z szynką i serem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pomidory', 60, 'g', false FROM recipes WHERE name = 'Bułki z szynką i serem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Sałata lodowa', 20, 'g', false FROM recipes WHERE name = 'Bułki z szynką i serem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 20, 'g', false FROM recipes WHERE name = 'Bułki z szynką i serem';

-- 9. Omlet z warzywami
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Omlet z warzywami',
  'Puszysty omlet z papryką, pomidorami i serem',
  '<ol><li>Pokrój paprykę i pomidory w kostkę.</li><li>Podsmaż warzywa na patelni na maśle.</li><li>Roztrzep jajka z odrobiną mleka.</li><li>Wlej na warzywa i smaż pod przykryciem.</li><li>Posyp startym serem przed złożeniem.</li></ol>',
  15, 1, 'śniadanie', 'vege',
  '{"calories": 360, "protein": 22, "carbs": 8, "fat": 28}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 3, 'szt', true FROM recipes WHERE name = 'Omlet z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Papryka czerwona', 50, 'g', true FROM recipes WHERE name = 'Omlet z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pomidory', 60, 'g', false FROM recipes WHERE name = 'Omlet z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ser żółty gouda', 30, 'g', false FROM recipes WHERE name = 'Omlet z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 15, 'g', false FROM recipes WHERE name = 'Omlet z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mleko 3.2%', 0.03, 'l', false FROM recipes WHERE name = 'Omlet z warzywami';

-- 10. Koktajl bananowo-jabłkowy
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Koktajl bananowo-jabłkowy',
  'Orzeźwiający koktajl owocowy z jogurtem i miodem',
  '<ol><li>Obierz banana i pokrój na kawałki.</li><li>Obierz jabłko i usuń gniazdo nasienne.</li><li>Włóż owoce do blendera z jogurtem.</li><li>Dodaj miód i zblenduj do gładkości.</li><li>Przelej do szklanki i podawaj schłodzony.</li></ol>',
  5, 1, 'śniadanie', 'vege',
  '{"calories": 280, "protein": 8, "carbs": 52, "fat": 4}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Banany', 100, 'g', true FROM recipes WHERE name = 'Koktajl bananowo-jabłkowy';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jabłka', 100, 'g', true FROM recipes WHERE name = 'Koktajl bananowo-jabłkowy';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jogurt naturalny', 150, 'g', true FROM recipes WHERE name = 'Koktajl bananowo-jabłkowy';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Miód naturalny', 15, 'g', false FROM recipes WHERE name = 'Koktajl bananowo-jabłkowy';

-- ===================================================================
-- OBIAD (Lunch/Dinner) - 10 recipes
-- ===================================================================

-- 11. Kurczak w sosie śmietanowym
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Kurczak w sosie śmietanowym',
  'Soczyste piersi kurczaka w kremowym sosie z pieczarkami',
  '<ol><li>Pokrój filet z kurczaka w plastry i obij tłuczkiem.</li><li>Obsmaż mięso z obu stron na złoty kolor.</li><li>Dodaj pokrojoną cebulę i smaż 3 minuty.</li><li>Wlej śmietanę, dopraw solą, pieprzem i oregano.</li><li>Duś pod przykryciem 15 minut. Podawaj z ryżem.</li></ol>',
  35, 4, 'obiad', 'drób',
  '{"calories": 420, "protein": 38, "carbs": 6, "fat": 28}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Filet z kurczaka', 500, 'g', true FROM recipes WHERE name = 'Kurczak w sosie śmietanowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Śmietana 18%', 200, 'g', true FROM recipes WHERE name = 'Kurczak w sosie śmietanowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cebula', 100, 'g', true FROM recipes WHERE name = 'Kurczak w sosie śmietanowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Olej rzepakowy', 0.03, 'l', false FROM recipes WHERE name = 'Kurczak w sosie śmietanowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Sól', 3, 'g', false FROM recipes WHERE name = 'Kurczak w sosie śmietanowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oregano', 2, 'g', false FROM recipes WHERE name = 'Kurczak w sosie śmietanowym';

-- 12. Spaghetti bolognese
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Spaghetti bolognese',
  'Klasyczne włoskie spaghetti z sosem mięsnym',
  '<ol><li>Podsmaż mięso mielone na patelni, rozbijając grudki.</li><li>Dodaj pokrojoną cebulę i czosnek, smaż 5 minut.</li><li>Wlej passatę pomidorową, dopraw i duś 20 minut.</li><li>Ugotuj makaron al dente według instrukcji.</li><li>Wymieszaj makaron z sosem i posyp bazylią.</li></ol>',
  40, 4, 'obiad', 'czerwone mięso',
  '{"calories": 520, "protein": 28, "carbs": 58, "fat": 18}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Makaron spaghetti', 400, 'g', true FROM recipes WHERE name = 'Spaghetti bolognese';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mięso mielone wołowe', 400, 'g', true FROM recipes WHERE name = 'Spaghetti bolognese';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Passata pomidorowa', 400, 'g', true FROM recipes WHERE name = 'Spaghetti bolognese';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cebula', 100, 'g', true FROM recipes WHERE name = 'Spaghetti bolognese';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Czosnek', 10, 'g', false FROM recipes WHERE name = 'Spaghetti bolognese';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Bazylia suszona', 3, 'g', false FROM recipes WHERE name = 'Spaghetti bolognese';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oliwa z oliwek', 30, 'g', false FROM recipes WHERE name = 'Spaghetti bolognese';

-- 13. Dorsz pieczony z warzywami
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Dorsz pieczony z warzywami',
  'Delikatny filet z dorsza pieczony z warzywami korzeniowymi',
  '<ol><li>Pokrój ziemniaki, marchew i pietruszkę w plastry.</li><li>Ułóż warzywa na blasze, skrop olejem.</li><li>Piecz warzywa 20 minut w 200°C.</li><li>Ułóż filety dorsza na warzywach, skrop cytryną.</li><li>Piecz kolejne 15-20 minut. Podawaj z koperkiem.</li></ol>',
  45, 2, 'obiad', 'ryba',
  '{"calories": 380, "protein": 32, "carbs": 38, "fat": 10}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Filet z dorsza', 300, 'g', true FROM recipes WHERE name = 'Dorsz pieczony z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ziemniaki', 400, 'g', true FROM recipes WHERE name = 'Dorsz pieczony z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Marchew', 150, 'g', true FROM recipes WHERE name = 'Dorsz pieczony z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pietruszka korzeń', 100, 'g', false FROM recipes WHERE name = 'Dorsz pieczony z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cytryny', 30, 'g', false FROM recipes WHERE name = 'Dorsz pieczony z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oliwa z oliwek', 30, 'g', false FROM recipes WHERE name = 'Dorsz pieczony z warzywami';

-- 14. Schabowy z ziemniakami
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Schabowy z ziemniakami',
  'Tradycyjny polski schabowy z purée ziemniaczanym i kapustą',
  '<ol><li>Rozbij kotlety schabowe tłuczkiem.</li><li>Obtocz w mące, rozkłóconym jajku i bułce tartej.</li><li>Smaż na rozgrzanym oleju do złotego koloru.</li><li>Ugotuj ziemniaki i zrób purée z masłem i mlekiem.</li><li>Podawaj z kapustą zasmażaną.</li></ol>',
  45, 4, 'obiad', 'czerwone mięso',
  '{"calories": 580, "protein": 32, "carbs": 48, "fat": 28}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Schab wieprzowy', 400, 'g', true FROM recipes WHERE name = 'Schabowy z ziemniakami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ziemniaki', 600, 'g', true FROM recipes WHERE name = 'Schabowy z ziemniakami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 2, 'szt', true FROM recipes WHERE name = 'Schabowy z ziemniakami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mąka pszenna', 50, 'g', true FROM recipes WHERE name = 'Schabowy z ziemniakami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Kapusta biała', 300, 'g', false FROM recipes WHERE name = 'Schabowy z ziemniakami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 30, 'g', false FROM recipes WHERE name = 'Schabowy z ziemniakami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Olej rzepakowy', 0.1, 'l', true FROM recipes WHERE name = 'Schabowy z ziemniakami';

-- 15. Risotto z kurczakiem i warzywami
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Risotto z kurczakiem i warzywami',
  'Kremowe risotto z kawałkami kurczaka i kolorowymi warzywami',
  '<ol><li>Podsmaż pokrojonego kurczaka i odłóż na bok.</li><li>Na tej samej patelni zeszklij cebulę.</li><li>Dodaj ryż i smaż 2 minuty.</li><li>Stopniowo dodawaj gorący bulion, mieszając.</li><li>Pod koniec dodaj kurczaka, mrożone warzywa i parmezan.</li></ol>',
  40, 4, 'obiad', 'drób',
  '{"calories": 480, "protein": 28, "carbs": 52, "fat": 16}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ryż biały', 300, 'g', true FROM recipes WHERE name = 'Risotto z kurczakiem i warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Filet z kurczaka', 300, 'g', true FROM recipes WHERE name = 'Risotto z kurczakiem i warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mrożone warzywa mieszanka', 200, 'g', true FROM recipes WHERE name = 'Risotto z kurczakiem i warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cebula', 80, 'g', true FROM recipes WHERE name = 'Risotto z kurczakiem i warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 40, 'g', false FROM recipes WHERE name = 'Risotto z kurczakiem i warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ser żółty gouda', 50, 'g', false FROM recipes WHERE name = 'Risotto z kurczakiem i warzywami';

-- 16. Makaron z brokułami i kurczakiem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Makaron z brokułami i kurczakiem',
  'Lekki makaron z soczystym kurczakiem i zielonymi brokułami',
  '<ol><li>Ugotuj makaron al dente.</li><li>Różyczki brokułów ugotuj na parze 5 minut.</li><li>Pokrój kurczaka w paski i obsmaż na patelni.</li><li>Dodaj czosnek i śmietanę, gotuj 3 minuty.</li><li>Wymieszaj wszystko razem i podawaj.</li></ol>',
  30, 3, 'obiad', 'drób',
  '{"calories": 450, "protein": 32, "carbs": 48, "fat": 14}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Makaron penne', 300, 'g', true FROM recipes WHERE name = 'Makaron z brokułami i kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Filet z kurczaka', 250, 'g', true FROM recipes WHERE name = 'Makaron z brokułami i kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Brokuły', 300, 'g', true FROM recipes WHERE name = 'Makaron z brokułami i kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Śmietana 18%', 150, 'g', true FROM recipes WHERE name = 'Makaron z brokułami i kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Czosnek', 8, 'g', false FROM recipes WHERE name = 'Makaron z brokułami i kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oliwa z oliwek', 20, 'g', false FROM recipes WHERE name = 'Makaron z brokułami i kurczakiem';

-- 17. Kasza gryczana z kiełbasą
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Kasza gryczana z kiełbasą',
  'Sycąca kasza gryczana z podsmażaną kiełbasą i cebulką',
  '<ol><li>Ugotuj kaszę gryczaną według przepisu.</li><li>Pokrój kiełbasę w plastry.</li><li>Podsmaż kiełbasę z pokrojoną cebulą.</li><li>Wymieszaj z gotową kaszą.</li><li>Dopraw do smaku i podawaj z kiszonym ogórkiem.</li></ol>',
  30, 3, 'obiad', 'czerwone mięso',
  '{"calories": 420, "protein": 18, "carbs": 42, "fat": 20}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Kasza gryczana', 250, 'g', true FROM recipes WHERE name = 'Kasza gryczana z kiełbasą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Kiełbasa śląska', 250, 'g', true FROM recipes WHERE name = 'Kasza gryczana z kiełbasą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cebula', 100, 'g', true FROM recipes WHERE name = 'Kasza gryczana z kiełbasą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ogórki kiszone', 100, 'g', false FROM recipes WHERE name = 'Kasza gryczana z kiełbasą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 30, 'g', false FROM recipes WHERE name = 'Kasza gryczana z kiełbasą';

-- 18. Leczo wegetariańskie
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Leczo wegetariańskie',
  'Kolorowe leczo z papryką, cukinią i pomidorami',
  '<ol><li>Pokrój paprykę, pomidory i cebulę w paski.</li><li>Podsmaż cebulę na oliwie do zeszklenia.</li><li>Dodaj paprykę i smaż 10 minut.</li><li>Wlej passatę i pomidory, duś 15 minut.</li><li>Dopraw papryką, solą i pieprzem. Podawaj z ryżem lub chlebem.</li></ol>',
  35, 4, 'obiad', 'vege',
  '{"calories": 180, "protein": 4, "carbs": 24, "fat": 8}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Papryka czerwona', 200, 'g', true FROM recipes WHERE name = 'Leczo wegetariańskie';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pomidory', 300, 'g', true FROM recipes WHERE name = 'Leczo wegetariańskie';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cebula', 150, 'g', true FROM recipes WHERE name = 'Leczo wegetariańskie';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Passata pomidorowa', 200, 'g', true FROM recipes WHERE name = 'Leczo wegetariańskie';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oliwa z oliwek', 30, 'g', false FROM recipes WHERE name = 'Leczo wegetariańskie';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Papryka słodka', 5, 'g', false FROM recipes WHERE name = 'Leczo wegetariańskie';

-- 19. Zupa pomidorowa z makaronem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Zupa pomidorowa z makaronem',
  'Klasyczna polska zupa pomidorowa z drobnym makaronem',
  '<ol><li>Ugotuj bulion z marchewki, pietruszki, selera i pora.</li><li>Przecedź bulion i dodaj passatę pomidorową.</li><li>Gotuj 10 minut, dopraw do smaku.</li><li>Dodaj ugotowany wcześniej makaron.</li><li>Podawaj ze śmietaną.</li></ol>',
  45, 6, 'obiad', 'vege',
  '{"calories": 180, "protein": 5, "carbs": 32, "fat": 4}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Passata pomidorowa', 400, 'g', true FROM recipes WHERE name = 'Zupa pomidorowa z makaronem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Makaron świderki', 200, 'g', true FROM recipes WHERE name = 'Zupa pomidorowa z makaronem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Marchew', 100, 'g', true FROM recipes WHERE name = 'Zupa pomidorowa z makaronem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pietruszka korzeń', 50, 'g', true FROM recipes WHERE name = 'Zupa pomidorowa z makaronem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Seler', 50, 'g', false FROM recipes WHERE name = 'Zupa pomidorowa z makaronem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Por', 50, 'g', false FROM recipes WHERE name = 'Zupa pomidorowa z makaronem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Śmietana 18%', 100, 'g', false FROM recipes WHERE name = 'Zupa pomidorowa z makaronem';

-- 20. Kotlety mielone z kaszą
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Kotlety mielone z kaszą',
  'Domowe kotlety mielone z puszystą kaszą jęczmienną',
  '<ol><li>Wymieszaj mięso mielone z jajkiem i bułką tartą.</li><li>Dodaj startą cebulę, sól i pieprz.</li><li>Formuj kotlety i obtaczaj w mące.</li><li>Smaż na oleju z obu stron.</li><li>Podawaj z kaszą jęczmienną i surówką.</li></ol>',
  40, 4, 'obiad', 'czerwone mięso',
  '{"calories": 480, "protein": 26, "carbs": 38, "fat": 24}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mięso mielone wołowe', 400, 'g', true FROM recipes WHERE name = 'Kotlety mielone z kaszą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Kasza jęczmienna', 250, 'g', true FROM recipes WHERE name = 'Kotlety mielone z kaszą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 1, 'szt', true FROM recipes WHERE name = 'Kotlety mielone z kaszą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cebula', 80, 'g', true FROM recipes WHERE name = 'Kotlety mielone z kaszą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mąka pszenna', 40, 'g', false FROM recipes WHERE name = 'Kotlety mielone z kaszą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Olej rzepakowy', 0.05, 'l', true FROM recipes WHERE name = 'Kotlety mielone z kaszą';

-- ===================================================================
-- KOLACJA (Supper) - 10 recipes
-- ===================================================================

-- 21. Sałatka z kurczakiem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Sałatka z kurczakiem',
  'Lekka sałatka z grillowanym kurczakiem i warzywami',
  '<ol><li>Pokrój kurczaka w paski i obsmaż na patelni.</li><li>Porwij sałatę na kawałki.</li><li>Pokrój pomidory i ogórki.</li><li>Wymieszaj wszystko w misce.</li><li>Polej oliwą i posyp oregano.</li></ol>',
  20, 2, 'kolacja', 'drób',
  '{"calories": 320, "protein": 28, "carbs": 12, "fat": 18}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Filet z kurczaka', 200, 'g', true FROM recipes WHERE name = 'Sałatka z kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Sałata lodowa', 150, 'g', true FROM recipes WHERE name = 'Sałatka z kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pomidory', 100, 'g', true FROM recipes WHERE name = 'Sałatka z kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ogórki', 80, 'g', true FROM recipes WHERE name = 'Sałatka z kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oliwa z oliwek', 20, 'g', false FROM recipes WHERE name = 'Sałatka z kurczakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oregano', 2, 'g', false FROM recipes WHERE name = 'Sałatka z kurczakiem';

-- 22. Jajka na twardo z warzywami
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Jajka na twardo z warzywami',
  'Proste jajka na twardo z świeżymi warzywami i majonezem',
  '<ol><li>Ugotuj jajka na twardo (10 minut).</li><li>Ostudź i obierz ze skorupki.</li><li>Pokrój pomidory i ogórki.</li><li>Ułóż jajka z warzywami na talerzu.</li><li>Podawaj z majonezem i pieczywem.</li></ol>',
  15, 2, 'kolacja', 'vege',
  '{"calories": 280, "protein": 16, "carbs": 8, "fat": 20}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 4, 'szt', true FROM recipes WHERE name = 'Jajka na twardo z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pomidory', 100, 'g', true FROM recipes WHERE name = 'Jajka na twardo z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ogórki', 80, 'g', true FROM recipes WHERE name = 'Jajka na twardo z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Majonez', 30, 'g', false FROM recipes WHERE name = 'Jajka na twardo z warzywami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb pszenny', 60, 'g', false FROM recipes WHERE name = 'Jajka na twardo z warzywami';

-- 23. Placki ziemniaczane
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Placki ziemniaczane',
  'Chrupiące placki ziemniaczane ze śmietaną',
  '<ol><li>Obierz ziemniaki i zetrzyj na tarce.</li><li>Odciśnij nadmiar wody.</li><li>Dodaj jajko, mąkę, sól i pieprz.</li><li>Smaż placki na oleju z obu stron.</li><li>Podawaj ze śmietaną lub cukrem.</li></ol>',
  35, 4, 'kolacja', 'vege',
  '{"calories": 320, "protein": 8, "carbs": 42, "fat": 14}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ziemniaki', 800, 'g', true FROM recipes WHERE name = 'Placki ziemniaczane';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 2, 'szt', true FROM recipes WHERE name = 'Placki ziemniaczane';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mąka pszenna', 40, 'g', true FROM recipes WHERE name = 'Placki ziemniaczane';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Olej rzepakowy', 0.08, 'l', true FROM recipes WHERE name = 'Placki ziemniaczane';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Śmietana 18%', 100, 'g', false FROM recipes WHERE name = 'Placki ziemniaczane';

-- 24. Kanapki z jajecznicą
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Kanapki z jajecznicą',
  'Ciepłe kanapki z kremową jajecznicą i szczypiorkiem',
  '<ol><li>Roztrzep jajka z odrobiną mleka.</li><li>Smaż na maśle, delikatnie mieszając.</li><li>Dopraw solą i pieprzem.</li><li>Połóż jajecznicę na kromkach chleba.</li><li>Posyp szczypiorkiem i podawaj.</li></ol>',
  10, 2, 'kolacja', 'vege',
  '{"calories": 340, "protein": 18, "carbs": 26, "fat": 18}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 4, 'szt', true FROM recipes WHERE name = 'Kanapki z jajecznicą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb pszenny', 100, 'g', true FROM recipes WHERE name = 'Kanapki z jajecznicą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 20, 'g', true FROM recipes WHERE name = 'Kanapki z jajecznicą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mleko 3.2%', 0.03, 'l', false FROM recipes WHERE name = 'Kanapki z jajecznicą';

-- 25. Zapiekanka ze szpinakiem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Zapiekanka ze szpinakiem',
  'Zapiekanka z makaronem, szpinakiem i serem',
  '<ol><li>Ugotuj makaron al dente.</li><li>Podsmaż szpinak na maśle.</li><li>Wymieszaj makaron ze szpinakiem i śmietaną.</li><li>Przełóż do naczynia żaroodpornego, posyp serem.</li><li>Zapiekaj 15 minut w 180°C.</li></ol>',
  30, 3, 'kolacja', 'vege',
  '{"calories": 380, "protein": 16, "carbs": 44, "fat": 16}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Makaron penne', 250, 'g', true FROM recipes WHERE name = 'Zapiekanka ze szpinakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Szpinak', 150, 'g', true FROM recipes WHERE name = 'Zapiekanka ze szpinakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ser żółty gouda', 100, 'g', true FROM recipes WHERE name = 'Zapiekanka ze szpinakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Śmietana 18%', 100, 'g', true FROM recipes WHERE name = 'Zapiekanka ze szpinakiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 20, 'g', false FROM recipes WHERE name = 'Zapiekanka ze szpinakiem';

-- 26. Tosty z szynką i pomidorem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Tosty z szynką i pomidorem',
  'Chrupiące tosty z szynką, pomidorem i serem',
  '<ol><li>Ułóż szynkę na tostach.</li><li>Dodaj plasterki pomidora.</li><li>Posyp startym serem.</li><li>Zapiekaj w piekarniku lub tosterze do stopienia sera.</li><li>Dopraw oregano i podawaj na ciepło.</li></ol>',
  15, 2, 'kolacja', 'czerwone mięso',
  '{"calories": 380, "protein": 20, "carbs": 32, "fat": 20}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb tostowy', 80, 'g', true FROM recipes WHERE name = 'Tosty z szynką i pomidorem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Szynka wędzona', 80, 'g', true FROM recipes WHERE name = 'Tosty z szynką i pomidorem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pomidory', 80, 'g', true FROM recipes WHERE name = 'Tosty z szynką i pomidorem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ser żółty gouda', 60, 'g', true FROM recipes WHERE name = 'Tosty z szynką i pomidorem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oregano', 1, 'g', false FROM recipes WHERE name = 'Tosty z szynką i pomidorem';

-- 27. Surówka z kapusty z marchewką
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Surówka z kapusty z marchewką',
  'Chrupiąca surówka z białej kapusty i marchewki',
  '<ol><li>Poszatkuj drobno kapustę.</li><li>Zetrzyj marchew na tarce.</li><li>Wymieszaj warzywa w misce.</li><li>Dopraw solą, pieprzem i oliwą.</li><li>Skrop sokiem z cytryny i wymieszaj.</li></ol>',
  15, 4, 'kolacja', 'vege',
  '{"calories": 120, "protein": 2, "carbs": 16, "fat": 6}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Kapusta biała', 400, 'g', true FROM recipes WHERE name = 'Surówka z kapusty z marchewką';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Marchew', 150, 'g', true FROM recipes WHERE name = 'Surówka z kapusty z marchewką';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Cytryny', 30, 'g', false FROM recipes WHERE name = 'Surówka z kapusty z marchewką';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oliwa z oliwek', 20, 'g', false FROM recipes WHERE name = 'Surówka z kapusty z marchewką';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Sól', 3, 'g', false FROM recipes WHERE name = 'Surówka z kapusty z marchewką';

-- 28. Kefir z owocami
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Kefir z owocami',
  'Orzeźwiający kefir z mrożonymi truskawkami i bananem',
  '<ol><li>Wlej kefir do blendera.</li><li>Dodaj mrożone truskawki.</li><li>Pokrój banana i dodaj do blendera.</li><li>Zblenduj do gładkości.</li><li>Przelej do szklanki i podawaj od razu.</li></ol>',
  5, 1, 'kolacja', 'vege',
  '{"calories": 220, "protein": 8, "carbs": 38, "fat": 4}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Kefir', 250, 'g', true FROM recipes WHERE name = 'Kefir z owocami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mrożone truskawki', 100, 'g', true FROM recipes WHERE name = 'Kefir z owocami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Banany', 80, 'g', false FROM recipes WHERE name = 'Kefir z owocami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Miód naturalny', 10, 'g', false FROM recipes WHERE name = 'Kefir z owocami';

-- 29. Grillowany ser z chlebem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Grillowany ser z chlebem',
  'Rozpływający się ser grillowany podawany z chlebem',
  '<ol><li>Pokrój ser w grube plastry.</li><li>Rozgrzej patelnię grillową.</li><li>Grilluj ser po 2 minuty z każdej strony.</li><li>Podawaj na ciepłym chlebie.</li><li>Dopraw pieprzem i oregano.</li></ol>',
  10, 2, 'kolacja', 'vege',
  '{"calories": 420, "protein": 22, "carbs": 28, "fat": 26}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ser żółty gouda', 150, 'g', true FROM recipes WHERE name = 'Grillowany ser z chlebem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb pszenny', 100, 'g', true FROM recipes WHERE name = 'Grillowany ser z chlebem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oliwa z oliwek', 10, 'g', false FROM recipes WHERE name = 'Grillowany ser z chlebem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oregano', 1, 'g', false FROM recipes WHERE name = 'Grillowany ser z chlebem';

-- 30. Sałatka jarzynowa
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Sałatka jarzynowa',
  'Klasyczna polska sałatka jarzynowa z majonezem',
  '<ol><li>Ugotuj ziemniaki, marchew i jajka.</li><li>Ostudź i pokrój w kostkę.</li><li>Dodaj pokrojone ogórki kiszone.</li><li>Wymieszaj z majonezem.</li><li>Dopraw solą i pieprzem, schłódź przed podaniem.</li></ol>',
  40, 6, 'kolacja', 'vege',
  '{"calories": 280, "protein": 8, "carbs": 24, "fat": 18}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ziemniaki', 400, 'g', true FROM recipes WHERE name = 'Sałatka jarzynowa';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Marchew', 150, 'g', true FROM recipes WHERE name = 'Sałatka jarzynowa';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 3, 'szt', true FROM recipes WHERE name = 'Sałatka jarzynowa';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ogórki kiszone', 150, 'g', true FROM recipes WHERE name = 'Sałatka jarzynowa';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Majonez', 150, 'g', true FROM recipes WHERE name = 'Sałatka jarzynowa';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mrożony groszek', 100, 'g', false FROM recipes WHERE name = 'Sałatka jarzynowa';

-- ===================================================================
-- PRZEKĄSKA (Snack) - 10 recipes
-- ===================================================================

-- 31. Kanapki z pastą jajeczną
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Kanapki z pastą jajeczną',
  'Delikatna pasta jajeczna z majonezem na chrupiącym pieczywie',
  '<ol><li>Ugotuj jajka na twardo.</li><li>Obierz i rozgnieć widelcem.</li><li>Wymieszaj z majonezem i musztardą.</li><li>Dopraw solą i pieprzem.</li><li>Smaruj na pieczywie i podawaj.</li></ol>',
  15, 4, 'przekąska', 'vege',
  '{"calories": 180, "protein": 10, "carbs": 12, "fat": 12}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jajka L', 4, 'szt', true FROM recipes WHERE name = 'Kanapki z pastą jajeczną';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Majonez', 60, 'g', true FROM recipes WHERE name = 'Kanapki z pastą jajeczną';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Musztarda', 15, 'g', false FROM recipes WHERE name = 'Kanapki z pastą jajeczną';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb pszenny', 100, 'g', false FROM recipes WHERE name = 'Kanapki z pastą jajeczną';

-- 32. Smoothie truskawkowe
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Smoothie truskawkowe',
  'Kremowe smoothie z mrożonych truskawek i jogurtu',
  '<ol><li>Wrzuć mrożone truskawki do blendera.</li><li>Dodaj jogurt i mleko.</li><li>Posłodź miodem.</li><li>Zblenduj do gładkości.</li><li>Przelej do szklanki i podawaj natychmiast.</li></ol>',
  5, 2, 'przekąska', 'vege',
  '{"calories": 160, "protein": 6, "carbs": 28, "fat": 2}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mrożone truskawki', 200, 'g', true FROM recipes WHERE name = 'Smoothie truskawkowe';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jogurt naturalny', 150, 'g', true FROM recipes WHERE name = 'Smoothie truskawkowe';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Mleko 3.2%', 0.1, 'l', false FROM recipes WHERE name = 'Smoothie truskawkowe';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Miód naturalny', 20, 'g', false FROM recipes WHERE name = 'Smoothie truskawkowe';

-- 33. Jabłko z masłem orzechowym
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Jabłko z orzechami',
  'Świeże jabłko pokrojone w cząstki z orzechami i miodem',
  '<ol><li>Umyj jabłko i usuń gniazdo nasienne.</li><li>Pokrój w cząstki.</li><li>Rozłóż na talerzu.</li><li>Posyp pokruszonymi orzechami.</li><li>Polej miodem i podawaj.</li></ol>',
  5, 1, 'przekąska', 'vege',
  '{"calories": 220, "protein": 6, "carbs": 32, "fat": 10}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jabłka', 150, 'g', true FROM recipes WHERE name = 'Jabłko z orzechami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Orzechy włoskie', 30, 'g', true FROM recipes WHERE name = 'Jabłko z orzechami';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Miód naturalny', 15, 'g', false FROM recipes WHERE name = 'Jabłko z orzechami';

-- 34. Grzanki z czosnkiem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Grzanki z czosnkiem',
  'Chrupiące grzanki czosnkowe z masłem i ziołami',
  '<ol><li>Pokrój chleb w kromki.</li><li>Rozmiękczony masło wymieszaj z przeciśniętym czosnkiem.</li><li>Posmaruj masłem czosnkowym kromki.</li><li>Piecz w piekarniku 10 minut w 180°C.</li><li>Posyp oregano przed podaniem.</li></ol>',
  15, 4, 'przekąska', 'vege',
  '{"calories": 180, "protein": 4, "carbs": 22, "fat": 8}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb pszenny', 200, 'g', true FROM recipes WHERE name = 'Grzanki z czosnkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 50, 'g', true FROM recipes WHERE name = 'Grzanki z czosnkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Czosnek', 15, 'g', true FROM recipes WHERE name = 'Grzanki z czosnkiem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Oregano', 2, 'g', false FROM recipes WHERE name = 'Grzanki z czosnkiem';

-- 35. Mix orzechów i bakalii
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Mix orzechów i bakalii',
  'Zdrowa przekąska z mieszanki orzechów, migdałów i rodzynek',
  '<ol><li>Odmierz porcje orzechów i migdałów.</li><li>Dodaj rodzynki.</li><li>Wymieszaj składniki.</li><li>Przełóż do miseczki.</li><li>Podawaj jako przekąskę lub dodatek do owsianki.</li></ol>',
  2, 2, 'przekąska', 'vege',
  '{"calories": 280, "protein": 8, "carbs": 18, "fat": 22}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Orzechy włoskie', 40, 'g', true FROM recipes WHERE name = 'Mix orzechów i bakalii';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Migdały', 40, 'g', true FROM recipes WHERE name = 'Mix orzechów i bakalii';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Rodzynki', 30, 'g', true FROM recipes WHERE name = 'Mix orzechów i bakalii';

-- 36. Banan z miodem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Banan z miodem',
  'Prosty banan polany miodem i posypany orzechami',
  '<ol><li>Obierz banana ze skórki.</li><li>Pokrój wzdłuż na pół.</li><li>Ułóż na talerzu.</li><li>Polej miodem.</li><li>Posyp pokruszonymi orzechami.</li></ol>',
  3, 1, 'przekąska', 'vege',
  '{"calories": 200, "protein": 4, "carbs": 38, "fat": 6}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Banany', 120, 'g', true FROM recipes WHERE name = 'Banan z miodem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Miód naturalny', 20, 'g', true FROM recipes WHERE name = 'Banan z miodem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Orzechy włoskie', 15, 'g', false FROM recipes WHERE name = 'Banan z miodem';

-- 37. Warzywa z dipem jogurtowym
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Warzywa z dipem jogurtowym',
  'Świeże warzywa z kremowym dipem na bazie jogurtu',
  '<ol><li>Pokrój marchew, ogórek i paprykę w słupki.</li><li>Wymieszaj jogurt z czosnkiem i solą.</li><li>Dodaj do jogurtu oregano.</li><li>Ułóż warzywa na talerzu.</li><li>Podawaj z dipem jogurtowym.</li></ol>',
  10, 2, 'przekąska', 'vege',
  '{"calories": 120, "protein": 6, "carbs": 14, "fat": 4}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Jogurt naturalny', 150, 'g', true FROM recipes WHERE name = 'Warzywa z dipem jogurtowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Marchew', 100, 'g', true FROM recipes WHERE name = 'Warzywa z dipem jogurtowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Ogórki', 80, 'g', true FROM recipes WHERE name = 'Warzywa z dipem jogurtowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Papryka czerwona', 80, 'g', false FROM recipes WHERE name = 'Warzywa z dipem jogurtowym';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Czosnek', 5, 'g', false FROM recipes WHERE name = 'Warzywa z dipem jogurtowym';

-- 38. Tost z dżemem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Tost z dżemem',
  'Klasyczny chrupiący tost z masłem i dżemem truskawkowym',
  '<ol><li>Opiecz chleb tostowy.</li><li>Posmaruj ciepły tost masłem.</li><li>Nałóż warstwę dżemu truskawkowego.</li><li>Podawaj natychmiast póki ciepły.</li></ol>',
  5, 1, 'przekąska', 'vege',
  '{"calories": 220, "protein": 4, "carbs": 36, "fat": 8}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Chleb tostowy', 60, 'g', true FROM recipes WHERE name = 'Tost z dżemem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Masło', 15, 'g', true FROM recipes WHERE name = 'Tost z dżemem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Dżem truskawkowy', 30, 'g', true FROM recipes WHERE name = 'Tost z dżemem';

-- 39. Kiełbaska z musztardą
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Kiełbaska z musztardą',
  'Grillowana kiełbaska z ostrą musztardą i pieczywem',
  '<ol><li>Rozgrzej patelnię lub grill.</li><li>Podsmaż kiełbasę z każdej strony.</li><li>Podawaj z musztardą.</li><li>Dodaj świeże pieczywo.</li></ol>',
  10, 2, 'przekąska', 'czerwone mięso',
  '{"calories": 320, "protein": 14, "carbs": 18, "fat": 22}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Kiełbasa śląska', 150, 'g', true FROM recipes WHERE name = 'Kiełbaska z musztardą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Musztarda', 30, 'g', true FROM recipes WHERE name = 'Kiełbaska z musztardą';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Bułki kajzerki', 2, 'szt', false FROM recipes WHERE name = 'Kiełbaska z musztardą';

-- 40. Pomarańcza z cynamonem
INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, meal_category, protein_type, nutritional_values, is_active)
VALUES (
  'Pomarańcza z miodem',
  'Świeża pomarańcza pokrojona w plastry z miodem',
  '<ol><li>Obierz pomarańczę ze skórki i białych błonek.</li><li>Pokrój w plastry.</li><li>Ułóż na talerzu.</li><li>Polej miodem i podawaj.</li></ol>',
  5, 1, 'przekąska', 'vege',
  '{"calories": 100, "protein": 2, "carbs": 24, "fat": 0}',
  true
);
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Pomarańcze', 200, 'g', true FROM recipes WHERE name = 'Pomarańcza z miodem';
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_required)
SELECT id, 'Miód naturalny', 10, 'g', false FROM recipes WHERE name = 'Pomarańcza z miodem';

-- ===================================================================
-- Verify seeding results
-- ===================================================================
SELECT
  meal_category,
  COUNT(*) as recipe_count
FROM recipes
GROUP BY meal_category
ORDER BY meal_category;
