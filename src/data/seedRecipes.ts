/**
 * Seed recipes for FridgePick MVP
 * 40 recipes: 10 per category (śniadanie, obiad, kolacja, przekąska)
 * Designed to match demo products from demoProducts.ts
 */

export type MealCategory = "śniadanie" | "obiad" | "kolacja" | "przekąska";
export type ProteinType = "ryba" | "drób" | "czerwone mięso" | "vege";
export type UnitType = "g" | "l" | "szt";

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: UnitType;
  isRequired: boolean;
}

export interface NutritionalValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SeedRecipe {
  name: string;
  description: string;
  instructions: string;
  prepTimeMinutes: number;
  servings: number;
  mealCategory: MealCategory;
  proteinType: ProteinType;
  nutritionalValues: NutritionalValues;
  ingredients: RecipeIngredient[];
}

export const SEED_RECIPES: SeedRecipe[] = [
  // =====================================================
  // ŚNIADANIE (Breakfast) - 10 recipes
  // =====================================================
  {
    name: "Jajecznica z boczkiem",
    description: "Klasyczna jajecznica z chrupiącym boczkiem i szczypiorkiem",
    instructions: `<ol>
      <li>Pokrój boczek w kostkę i podsmaż na patelni do chrupkości.</li>
      <li>Rozbij jajka do miski i lekko roztrzep widelcem.</li>
      <li>Wlej jajka na patelnię z boczkiem.</li>
      <li>Mieszaj delikatnie, aż jajka się zetną.</li>
      <li>Dopraw solą i pieprzem. Podawaj z pieczywem.</li>
    </ol>`,
    prepTimeMinutes: 15,
    servings: 2,
    mealCategory: "śniadanie",
    proteinType: "czerwone mięso",
    nutritionalValues: { calories: 380, protein: 22, carbs: 2, fat: 32 },
    ingredients: [
      { name: "Jajka L", quantity: 4, unit: "szt", isRequired: true },
      { name: "Boczek wędzony", quantity: 80, unit: "g", isRequired: true },
      { name: "Masło", quantity: 10, unit: "g", isRequired: false },
      { name: "Sól", quantity: 2, unit: "g", isRequired: false },
      { name: "Pieprz czarny mielony", quantity: 1, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Owsianka z bananami i miodem",
    description: "Kremowa owsianka z świeżymi bananami, miodem i orzechami",
    instructions: `<ol>
      <li>Wsyp płatki owsiane do garnka i zalej mlekiem.</li>
      <li>Gotuj na małym ogniu ok. 5 minut, mieszając.</li>
      <li>Pokrój banana w plasterki.</li>
      <li>Przełóż owsiankę do miseczki, ułóż banana na wierzchu.</li>
      <li>Polej miodem i posyp orzechami.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 1,
    mealCategory: "śniadanie",
    proteinType: "vege",
    nutritionalValues: { calories: 420, protein: 12, carbs: 68, fat: 12 },
    ingredients: [
      { name: "Płatki owsiane", quantity: 60, unit: "g", isRequired: true },
      { name: "Mleko 3.2%", quantity: 0.25, unit: "l", isRequired: true },
      { name: "Banany", quantity: 120, unit: "g", isRequired: true },
      { name: "Miód naturalny", quantity: 20, unit: "g", isRequired: false },
      { name: "Orzechy włoskie", quantity: 20, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Kanapki z łososiem wędzonym",
    description: "Eleganckie kanapki z łososiem, serkiem i kaparami",
    instructions: `<ol>
      <li>Pokrój chleb w kromki i lekko opiecz.</li>
      <li>Posmaruj kromki masłem.</li>
      <li>Ułóż plastry łososia na chlebie.</li>
      <li>Dodaj plasterki ogórka.</li>
      <li>Skrop sokiem z cytryny i podawaj.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 2,
    mealCategory: "śniadanie",
    proteinType: "ryba",
    nutritionalValues: { calories: 320, protein: 18, carbs: 28, fat: 16 },
    ingredients: [
      { name: "Chleb pszenny", quantity: 100, unit: "g", isRequired: true },
      { name: "Łosoś wędzony", quantity: 80, unit: "g", isRequired: true },
      { name: "Masło", quantity: 20, unit: "g", isRequired: true },
      { name: "Ogórki", quantity: 50, unit: "g", isRequired: false },
      { name: "Cytryny", quantity: 20, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Tosty z jajkiem i serem",
    description: "Chrupiące tosty z jajkiem sadzonym i żółtym serem",
    instructions: `<ol>
      <li>Opiecz tosty w tosterze lub na patelni.</li>
      <li>Usmaż jajka sadzone na maśle.</li>
      <li>Połóż plastry sera na gorącym toście.</li>
      <li>Ułóż jajko sadzone na wierzchu.</li>
      <li>Dopraw solą i pieprzem.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 1,
    mealCategory: "śniadanie",
    proteinType: "vege",
    nutritionalValues: { calories: 450, protein: 24, carbs: 32, fat: 26 },
    ingredients: [
      { name: "Chleb tostowy", quantity: 60, unit: "g", isRequired: true },
      { name: "Jajka L", quantity: 2, unit: "szt", isRequired: true },
      { name: "Ser żółty gouda", quantity: 40, unit: "g", isRequired: true },
      { name: "Masło", quantity: 10, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Jogurt z owocami i muesli",
    description: "Świeży jogurt naturalny z sezonowymi owocami i chrupiącym muesli",
    instructions: `<ol>
      <li>Pokrój jabłko w kosteczkę.</li>
      <li>Wyłóż jogurt do miseczki.</li>
      <li>Dodaj pokrojone owoce.</li>
      <li>Posyp płatkami owsianymi i migdałami.</li>
      <li>Polej miodem i podawaj od razu.</li>
    </ol>`,
    prepTimeMinutes: 5,
    servings: 1,
    mealCategory: "śniadanie",
    proteinType: "vege",
    nutritionalValues: { calories: 340, protein: 14, carbs: 48, fat: 10 },
    ingredients: [
      { name: "Jogurt naturalny", quantity: 200, unit: "g", isRequired: true },
      { name: "Jabłka", quantity: 100, unit: "g", isRequired: true },
      { name: "Płatki owsiane", quantity: 30, unit: "g", isRequired: false },
      { name: "Miód naturalny", quantity: 15, unit: "g", isRequired: false },
      { name: "Migdały", quantity: 15, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Naleśniki z dżemem",
    description: "Puszyste naleśniki z domowym dżemem truskawkowym",
    instructions: `<ol>
      <li>Wymieszaj mąkę z jajkami.</li>
      <li>Stopniowo dodawaj mleko, mieszając.</li>
      <li>Smaż cienkie naleśniki na rozgrzanej patelni z masłem.</li>
      <li>Smaruj każdy naleśnik dżemem i zwijaj.</li>
      <li>Posyp cukrem pudrem przed podaniem.</li>
    </ol>`,
    prepTimeMinutes: 25,
    servings: 4,
    mealCategory: "śniadanie",
    proteinType: "vege",
    nutritionalValues: { calories: 320, protein: 10, carbs: 52, fat: 8 },
    ingredients: [
      { name: "Mąka pszenna", quantity: 200, unit: "g", isRequired: true },
      { name: "Jajka L", quantity: 2, unit: "szt", isRequired: true },
      { name: "Mleko 3.2%", quantity: 0.4, unit: "l", isRequired: true },
      { name: "Dżem truskawkowy", quantity: 80, unit: "g", isRequired: true },
      { name: "Masło", quantity: 30, unit: "g", isRequired: false },
      { name: "Cukier", quantity: 20, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Twarożek ze szczypiorkiem",
    description: "Kremowy twarożek z dodatkiem szczypiorku i rzodkiewki",
    instructions: `<ol>
      <li>Rozgnieć twaróg widelcem.</li>
      <li>Dodaj śmietanę i wymieszaj do gładkości.</li>
      <li>Dopraw solą i pieprzem.</li>
      <li>Podawaj na świeżym pieczywie.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 2,
    mealCategory: "śniadanie",
    proteinType: "vege",
    nutritionalValues: { calories: 220, protein: 16, carbs: 6, fat: 14 },
    ingredients: [
      { name: "Ser biały twarogowy", quantity: 200, unit: "g", isRequired: true },
      { name: "Śmietana 18%", quantity: 50, unit: "g", isRequired: true },
      { name: "Chleb pszenny", quantity: 80, unit: "g", isRequired: false },
      { name: "Sól", quantity: 2, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Bułki z szynką i serem",
    description: "Klasyczne bułki śniadaniowe z szynką, serem i warzywami",
    instructions: `<ol>
      <li>Przekrój bułki na pół.</li>
      <li>Posmaruj masłem.</li>
      <li>Ułóż plastry szynki i sera.</li>
      <li>Dodaj plasterki pomidora i sałatę.</li>
      <li>Dopraw pieprzem i podawaj.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 2,
    mealCategory: "śniadanie",
    proteinType: "czerwone mięso",
    nutritionalValues: { calories: 380, protein: 18, carbs: 36, fat: 18 },
    ingredients: [
      { name: "Bułki kajzerki", quantity: 2, unit: "szt", isRequired: true },
      { name: "Szynka wędzona", quantity: 60, unit: "g", isRequired: true },
      { name: "Ser żółty gouda", quantity: 40, unit: "g", isRequired: true },
      { name: "Pomidory", quantity: 60, unit: "g", isRequired: false },
      { name: "Sałata lodowa", quantity: 20, unit: "g", isRequired: false },
      { name: "Masło", quantity: 20, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Omlet z warzywami",
    description: "Puszysty omlet z papryką, pomidorami i serem",
    instructions: `<ol>
      <li>Pokrój paprykę i pomidory w kostkę.</li>
      <li>Podsmaż warzywa na patelni na maśle.</li>
      <li>Roztrzep jajka z odrobiną mleka.</li>
      <li>Wlej na warzywa i smaż pod przykryciem.</li>
      <li>Posyp startym serem przed złożeniem.</li>
    </ol>`,
    prepTimeMinutes: 15,
    servings: 1,
    mealCategory: "śniadanie",
    proteinType: "vege",
    nutritionalValues: { calories: 360, protein: 22, carbs: 8, fat: 28 },
    ingredients: [
      { name: "Jajka L", quantity: 3, unit: "szt", isRequired: true },
      { name: "Papryka czerwona", quantity: 50, unit: "g", isRequired: true },
      { name: "Pomidory", quantity: 60, unit: "g", isRequired: false },
      { name: "Ser żółty gouda", quantity: 30, unit: "g", isRequired: false },
      { name: "Masło", quantity: 15, unit: "g", isRequired: false },
      { name: "Mleko 3.2%", quantity: 0.03, unit: "l", isRequired: false },
    ],
  },
  {
    name: "Koktajl bananowo-jabłkowy",
    description: "Orzeźwiający koktajl owocowy z jogurtem i miodem",
    instructions: `<ol>
      <li>Obierz banana i pokrój na kawałki.</li>
      <li>Obierz jabłko i usuń gniazdo nasienne.</li>
      <li>Włóż owoce do blendera z jogurtem.</li>
      <li>Dodaj miód i zblenduj do gładkości.</li>
      <li>Przelej do szklanki i podawaj schłodzony.</li>
    </ol>`,
    prepTimeMinutes: 5,
    servings: 1,
    mealCategory: "śniadanie",
    proteinType: "vege",
    nutritionalValues: { calories: 280, protein: 8, carbs: 52, fat: 4 },
    ingredients: [
      { name: "Banany", quantity: 100, unit: "g", isRequired: true },
      { name: "Jabłka", quantity: 100, unit: "g", isRequired: true },
      { name: "Jogurt naturalny", quantity: 150, unit: "g", isRequired: true },
      { name: "Miód naturalny", quantity: 15, unit: "g", isRequired: false },
    ],
  },

  // =====================================================
  // OBIAD (Lunch/Dinner) - 10 recipes
  // =====================================================
  {
    name: "Kurczak w sosie śmietanowym",
    description: "Soczyste piersi kurczaka w kremowym sosie z pieczarkami",
    instructions: `<ol>
      <li>Pokrój filet z kurczaka w plastry i obij tłuczkiem.</li>
      <li>Obsmaż mięso z obu stron na złoty kolor.</li>
      <li>Dodaj pokrojoną cebulę i smaż 3 minuty.</li>
      <li>Wlej śmietanę, dopraw solą, pieprzem i oregano.</li>
      <li>Duś pod przykryciem 15 minut. Podawaj z ryżem.</li>
    </ol>`,
    prepTimeMinutes: 35,
    servings: 4,
    mealCategory: "obiad",
    proteinType: "drób",
    nutritionalValues: { calories: 420, protein: 38, carbs: 6, fat: 28 },
    ingredients: [
      { name: "Filet z kurczaka", quantity: 500, unit: "g", isRequired: true },
      { name: "Śmietana 18%", quantity: 200, unit: "g", isRequired: true },
      { name: "Cebula", quantity: 100, unit: "g", isRequired: true },
      { name: "Olej rzepakowy", quantity: 0.03, unit: "l", isRequired: false },
      { name: "Sól", quantity: 3, unit: "g", isRequired: false },
      { name: "Oregano", quantity: 2, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Spaghetti bolognese",
    description: "Klasyczne włoskie spaghetti z sosem mięsnym",
    instructions: `<ol>
      <li>Podsmaż mięso mielone na patelni, rozbijając grudki.</li>
      <li>Dodaj pokrojoną cebulę i czosnek, smaż 5 minut.</li>
      <li>Wlej passatę pomidorową, dopraw i duś 20 minut.</li>
      <li>Ugotuj makaron al dente według instrukcji.</li>
      <li>Wymieszaj makaron z sosem i posyp bazylią.</li>
    </ol>`,
    prepTimeMinutes: 40,
    servings: 4,
    mealCategory: "obiad",
    proteinType: "czerwone mięso",
    nutritionalValues: { calories: 520, protein: 28, carbs: 58, fat: 18 },
    ingredients: [
      { name: "Makaron spaghetti", quantity: 400, unit: "g", isRequired: true },
      { name: "Mięso mielone wołowe", quantity: 400, unit: "g", isRequired: true },
      { name: "Passata pomidorowa", quantity: 400, unit: "g", isRequired: true },
      { name: "Cebula", quantity: 100, unit: "g", isRequired: true },
      { name: "Czosnek", quantity: 10, unit: "g", isRequired: false },
      { name: "Bazylia suszona", quantity: 3, unit: "g", isRequired: false },
      { name: "Oliwa z oliwek", quantity: 30, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Dorsz pieczony z warzywami",
    description: "Delikatny filet z dorsza pieczony z warzywami korzeniowymi",
    instructions: `<ol>
      <li>Pokrój ziemniaki, marchew i pietruszkę w plastry.</li>
      <li>Ułóż warzywa na blasze, skrop olejem.</li>
      <li>Piecz warzywa 20 minut w 200°C.</li>
      <li>Ułóż filety dorsza na warzywach, skrop cytryną.</li>
      <li>Piecz kolejne 15-20 minut. Podawaj z koperkiem.</li>
    </ol>`,
    prepTimeMinutes: 45,
    servings: 2,
    mealCategory: "obiad",
    proteinType: "ryba",
    nutritionalValues: { calories: 380, protein: 32, carbs: 38, fat: 10 },
    ingredients: [
      { name: "Filet z dorsza", quantity: 300, unit: "g", isRequired: true },
      { name: "Ziemniaki", quantity: 400, unit: "g", isRequired: true },
      { name: "Marchew", quantity: 150, unit: "g", isRequired: true },
      { name: "Pietruszka korzeń", quantity: 100, unit: "g", isRequired: false },
      { name: "Cytryny", quantity: 30, unit: "g", isRequired: false },
      { name: "Oliwa z oliwek", quantity: 30, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Schabowy z ziemniakami",
    description: "Tradycyjny polski schabowy z purée ziemniaczanym i kapustą",
    instructions: `<ol>
      <li>Rozbij kotlety schabowe tłuczkiem.</li>
      <li>Obtocz w mące, rozkłóconym jajku i bułce tartej.</li>
      <li>Smaż na rozgrzanym oleju do złotego koloru.</li>
      <li>Ugotuj ziemniaki i zrób purée z masłem i mlekiem.</li>
      <li>Podawaj z kapustą zasmażaną.</li>
    </ol>`,
    prepTimeMinutes: 45,
    servings: 4,
    mealCategory: "obiad",
    proteinType: "czerwone mięso",
    nutritionalValues: { calories: 580, protein: 32, carbs: 48, fat: 28 },
    ingredients: [
      { name: "Schab wieprzowy", quantity: 400, unit: "g", isRequired: true },
      { name: "Ziemniaki", quantity: 600, unit: "g", isRequired: true },
      { name: "Jajka L", quantity: 2, unit: "szt", isRequired: true },
      { name: "Mąka pszenna", quantity: 50, unit: "g", isRequired: true },
      { name: "Kapusta biała", quantity: 300, unit: "g", isRequired: false },
      { name: "Masło", quantity: 30, unit: "g", isRequired: false },
      { name: "Olej rzepakowy", quantity: 0.1, unit: "l", isRequired: true },
    ],
  },
  {
    name: "Risotto z kurczakiem i warzywami",
    description: "Kremowe risotto z kawałkami kurczaka i kolorowymi warzywami",
    instructions: `<ol>
      <li>Podsmaż pokrojonego kurczaka i odłóż na bok.</li>
      <li>Na tej samej patelni zeszklij cebulę.</li>
      <li>Dodaj ryż i smaż 2 minuty.</li>
      <li>Stopniowo dodawaj gorący bulion, mieszając.</li>
      <li>Pod koniec dodaj kurczaka, mrożone warzywa i parmezan.</li>
    </ol>`,
    prepTimeMinutes: 40,
    servings: 4,
    mealCategory: "obiad",
    proteinType: "drób",
    nutritionalValues: { calories: 480, protein: 28, carbs: 52, fat: 16 },
    ingredients: [
      { name: "Ryż biały", quantity: 300, unit: "g", isRequired: true },
      { name: "Filet z kurczaka", quantity: 300, unit: "g", isRequired: true },
      { name: "Mrożone warzywa mieszanka", quantity: 200, unit: "g", isRequired: true },
      { name: "Cebula", quantity: 80, unit: "g", isRequired: true },
      { name: "Masło", quantity: 40, unit: "g", isRequired: false },
      { name: "Ser żółty gouda", quantity: 50, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Makaron z brokułami i kurczakiem",
    description: "Lekki makaron z soczystym kurczakiem i zielonymi brokułami",
    instructions: `<ol>
      <li>Ugotuj makaron al dente.</li>
      <li>Różyczki brokułów ugotuj na parze 5 minut.</li>
      <li>Pokrój kurczaka w paski i obsmaż na patelni.</li>
      <li>Dodaj czosnek i śmietanę, gotuj 3 minuty.</li>
      <li>Wymieszaj wszystko razem i podawaj.</li>
    </ol>`,
    prepTimeMinutes: 30,
    servings: 3,
    mealCategory: "obiad",
    proteinType: "drób",
    nutritionalValues: { calories: 450, protein: 32, carbs: 48, fat: 14 },
    ingredients: [
      { name: "Makaron penne", quantity: 300, unit: "g", isRequired: true },
      { name: "Filet z kurczaka", quantity: 250, unit: "g", isRequired: true },
      { name: "Brokuły", quantity: 300, unit: "g", isRequired: true },
      { name: "Śmietana 18%", quantity: 150, unit: "g", isRequired: true },
      { name: "Czosnek", quantity: 8, unit: "g", isRequired: false },
      { name: "Oliwa z oliwek", quantity: 20, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Kasza gryczana z kiełbasą",
    description: "Sycąca kasza gryczana z podsmażaną kiełbasą i cebulką",
    instructions: `<ol>
      <li>Ugotuj kaszę gryczaną według przepisu.</li>
      <li>Pokrój kiełbasę w plastry.</li>
      <li>Podsmaż kiełbasę z pokrojoną cebulą.</li>
      <li>Wymieszaj z gotową kaszą.</li>
      <li>Dopraw do smaku i podawaj z kiszonym ogórkiem.</li>
    </ol>`,
    prepTimeMinutes: 30,
    servings: 3,
    mealCategory: "obiad",
    proteinType: "czerwone mięso",
    nutritionalValues: { calories: 420, protein: 18, carbs: 42, fat: 20 },
    ingredients: [
      { name: "Kasza gryczana", quantity: 250, unit: "g", isRequired: true },
      { name: "Kiełbasa śląska", quantity: 250, unit: "g", isRequired: true },
      { name: "Cebula", quantity: 100, unit: "g", isRequired: true },
      { name: "Ogórki kiszone", quantity: 100, unit: "g", isRequired: false },
      { name: "Masło", quantity: 30, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Leczo wegetariańskie",
    description: "Kolorowe leczo z papryką, cukinią i pomidorami",
    instructions: `<ol>
      <li>Pokrój paprykę, pomidory i cebulę w paski.</li>
      <li>Podsmaż cebulę na oliwie do zeszklenia.</li>
      <li>Dodaj paprykę i smaż 10 minut.</li>
      <li>Wlej passatę i pomidory, duś 15 minut.</li>
      <li>Dopraw papryką, solą i pieprzem. Podawaj z ryżem lub chlebem.</li>
    </ol>`,
    prepTimeMinutes: 35,
    servings: 4,
    mealCategory: "obiad",
    proteinType: "vege",
    nutritionalValues: { calories: 180, protein: 4, carbs: 24, fat: 8 },
    ingredients: [
      { name: "Papryka czerwona", quantity: 200, unit: "g", isRequired: true },
      { name: "Pomidory", quantity: 300, unit: "g", isRequired: true },
      { name: "Cebula", quantity: 150, unit: "g", isRequired: true },
      { name: "Passata pomidorowa", quantity: 200, unit: "g", isRequired: true },
      { name: "Oliwa z oliwek", quantity: 30, unit: "g", isRequired: false },
      { name: "Papryka słodka", quantity: 5, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Zupa pomidorowa z makaronem",
    description: "Klasyczna polska zupa pomidorowa z drobnym makaronem",
    instructions: `<ol>
      <li>Ugotuj bulion z marchewki, pietruszki, selera i pora.</li>
      <li>Przecedź bulion i dodaj passatę pomidorową.</li>
      <li>Gotuj 10 minut, dopraw do smaku.</li>
      <li>Dodaj ugotowany wcześniej makaron.</li>
      <li>Podawaj ze śmietaną.</li>
    </ol>`,
    prepTimeMinutes: 45,
    servings: 6,
    mealCategory: "obiad",
    proteinType: "vege",
    nutritionalValues: { calories: 180, protein: 5, carbs: 32, fat: 4 },
    ingredients: [
      { name: "Passata pomidorowa", quantity: 400, unit: "g", isRequired: true },
      { name: "Makaron świderki", quantity: 200, unit: "g", isRequired: true },
      { name: "Marchew", quantity: 100, unit: "g", isRequired: true },
      { name: "Pietruszka korzeń", quantity: 50, unit: "g", isRequired: true },
      { name: "Seler", quantity: 50, unit: "g", isRequired: false },
      { name: "Por", quantity: 50, unit: "g", isRequired: false },
      { name: "Śmietana 18%", quantity: 100, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Kotlety mielone z kaszą",
    description: "Domowe kotlety mielone z puszystą kaszą jęczmienną",
    instructions: `<ol>
      <li>Wymieszaj mięso mielone z jajkiem i bułką tartą.</li>
      <li>Dodaj startą cebulę, sól i pieprz.</li>
      <li>Formuj kotlety i obtaczaj w mące.</li>
      <li>Smaż na oleju z obu stron.</li>
      <li>Podawaj z kaszą jęczmienną i surówką.</li>
    </ol>`,
    prepTimeMinutes: 40,
    servings: 4,
    mealCategory: "obiad",
    proteinType: "czerwone mięso",
    nutritionalValues: { calories: 480, protein: 26, carbs: 38, fat: 24 },
    ingredients: [
      { name: "Mięso mielone wołowe", quantity: 400, unit: "g", isRequired: true },
      { name: "Kasza jęczmienna", quantity: 250, unit: "g", isRequired: true },
      { name: "Jajka L", quantity: 1, unit: "szt", isRequired: true },
      { name: "Cebula", quantity: 80, unit: "g", isRequired: true },
      { name: "Mąka pszenna", quantity: 40, unit: "g", isRequired: false },
      { name: "Olej rzepakowy", quantity: 0.05, unit: "l", isRequired: true },
    ],
  },

  // =====================================================
  // KOLACJA (Supper) - 10 recipes
  // =====================================================
  {
    name: "Sałatka z kurczakiem",
    description: "Lekka sałatka z grillowanym kurczakiem i warzywami",
    instructions: `<ol>
      <li>Pokrój kurczaka w paski i obsmaż na patelni.</li>
      <li>Porwij sałatę na kawałki.</li>
      <li>Pokrój pomidory i ogórki.</li>
      <li>Wymieszaj wszystko w misce.</li>
      <li>Polej oliwą i posyp oregano.</li>
    </ol>`,
    prepTimeMinutes: 20,
    servings: 2,
    mealCategory: "kolacja",
    proteinType: "drób",
    nutritionalValues: { calories: 320, protein: 28, carbs: 12, fat: 18 },
    ingredients: [
      { name: "Filet z kurczaka", quantity: 200, unit: "g", isRequired: true },
      { name: "Sałata lodowa", quantity: 150, unit: "g", isRequired: true },
      { name: "Pomidory", quantity: 100, unit: "g", isRequired: true },
      { name: "Ogórki", quantity: 80, unit: "g", isRequired: true },
      { name: "Oliwa z oliwek", quantity: 20, unit: "g", isRequired: false },
      { name: "Oregano", quantity: 2, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Jajka na twardo z warzywami",
    description: "Proste jajka na twardo z świeżymi warzywami i majonezem",
    instructions: `<ol>
      <li>Ugotuj jajka na twardo (10 minut).</li>
      <li>Ostudź i obierz ze skorupki.</li>
      <li>Pokrój pomidory i ogórki.</li>
      <li>Ułóż jajka z warzywami na talerzu.</li>
      <li>Podawaj z majonezem i pieczywem.</li>
    </ol>`,
    prepTimeMinutes: 15,
    servings: 2,
    mealCategory: "kolacja",
    proteinType: "vege",
    nutritionalValues: { calories: 280, protein: 16, carbs: 8, fat: 20 },
    ingredients: [
      { name: "Jajka L", quantity: 4, unit: "szt", isRequired: true },
      { name: "Pomidory", quantity: 100, unit: "g", isRequired: true },
      { name: "Ogórki", quantity: 80, unit: "g", isRequired: true },
      { name: "Majonez", quantity: 30, unit: "g", isRequired: false },
      { name: "Chleb pszenny", quantity: 60, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Placki ziemniaczane",
    description: "Chrupiące placki ziemniaczane ze śmietaną",
    instructions: `<ol>
      <li>Obierz ziemniaki i zetrzyj na tarce.</li>
      <li>Odciśnij nadmiar wody.</li>
      <li>Dodaj jajko, mąkę, sól i pieprz.</li>
      <li>Smaż placki na oleju z obu stron.</li>
      <li>Podawaj ze śmietaną lub cukrem.</li>
    </ol>`,
    prepTimeMinutes: 35,
    servings: 4,
    mealCategory: "kolacja",
    proteinType: "vege",
    nutritionalValues: { calories: 320, protein: 8, carbs: 42, fat: 14 },
    ingredients: [
      { name: "Ziemniaki", quantity: 800, unit: "g", isRequired: true },
      { name: "Jajka L", quantity: 2, unit: "szt", isRequired: true },
      { name: "Mąka pszenna", quantity: 40, unit: "g", isRequired: true },
      { name: "Olej rzepakowy", quantity: 0.08, unit: "l", isRequired: true },
      { name: "Śmietana 18%", quantity: 100, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Kanapki z jajecznicą",
    description: "Ciepłe kanapki z kremową jajecznicą i szczypiorkiem",
    instructions: `<ol>
      <li>Roztrzep jajka z odrobiną mleka.</li>
      <li>Smaż na maśle, delikatnie mieszając.</li>
      <li>Dopraw solą i pieprzem.</li>
      <li>Połóż jajecznicę na kromkach chleba.</li>
      <li>Posyp szczypiorkiem i podawaj.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 2,
    mealCategory: "kolacja",
    proteinType: "vege",
    nutritionalValues: { calories: 340, protein: 18, carbs: 26, fat: 18 },
    ingredients: [
      { name: "Jajka L", quantity: 4, unit: "szt", isRequired: true },
      { name: "Chleb pszenny", quantity: 100, unit: "g", isRequired: true },
      { name: "Masło", quantity: 20, unit: "g", isRequired: true },
      { name: "Mleko 3.2%", quantity: 0.03, unit: "l", isRequired: false },
    ],
  },
  {
    name: "Zapiekanka ze szpinakiem",
    description: "Zapiekanka z makaronem, szpinakiem i serem",
    instructions: `<ol>
      <li>Ugotuj makaron al dente.</li>
      <li>Podsmaż szpinak na maśle.</li>
      <li>Wymieszaj makaron ze szpinakiem i śmietaną.</li>
      <li>Przełóż do naczynia żaroodpornego, posyp serem.</li>
      <li>Zapiekaj 15 minut w 180°C.</li>
    </ol>`,
    prepTimeMinutes: 30,
    servings: 3,
    mealCategory: "kolacja",
    proteinType: "vege",
    nutritionalValues: { calories: 380, protein: 16, carbs: 44, fat: 16 },
    ingredients: [
      { name: "Makaron penne", quantity: 250, unit: "g", isRequired: true },
      { name: "Szpinak", quantity: 150, unit: "g", isRequired: true },
      { name: "Ser żółty gouda", quantity: 100, unit: "g", isRequired: true },
      { name: "Śmietana 18%", quantity: 100, unit: "g", isRequired: true },
      { name: "Masło", quantity: 20, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Tosty z szynką i pomidorem",
    description: "Chrupiące tosty z szynką, pomidorem i serem",
    instructions: `<ol>
      <li>Ułóż szynkę na tostach.</li>
      <li>Dodaj plasterki pomidora.</li>
      <li>Posyp startym serem.</li>
      <li>Zapiekaj w piekarniku lub tosterze do stopienia sera.</li>
      <li>Dopraw oregano i podawaj na ciepło.</li>
    </ol>`,
    prepTimeMinutes: 15,
    servings: 2,
    mealCategory: "kolacja",
    proteinType: "czerwone mięso",
    nutritionalValues: { calories: 380, protein: 20, carbs: 32, fat: 20 },
    ingredients: [
      { name: "Chleb tostowy", quantity: 80, unit: "g", isRequired: true },
      { name: "Szynka wędzona", quantity: 80, unit: "g", isRequired: true },
      { name: "Pomidory", quantity: 80, unit: "g", isRequired: true },
      { name: "Ser żółty gouda", quantity: 60, unit: "g", isRequired: true },
      { name: "Oregano", quantity: 1, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Surówka z kapusty z marchewką",
    description: "Chrupiąca surówka z białej kapusty i marchewki",
    instructions: `<ol>
      <li>Poszatkuj drobno kapustę.</li>
      <li>Zetrzyj marchew na tarce.</li>
      <li>Wymieszaj warzywa w misce.</li>
      <li>Dopraw solą, pieprzem i oliwą.</li>
      <li>Skrop sokiem z cytryny i wymieszaj.</li>
    </ol>`,
    prepTimeMinutes: 15,
    servings: 4,
    mealCategory: "kolacja",
    proteinType: "vege",
    nutritionalValues: { calories: 120, protein: 2, carbs: 16, fat: 6 },
    ingredients: [
      { name: "Kapusta biała", quantity: 400, unit: "g", isRequired: true },
      { name: "Marchew", quantity: 150, unit: "g", isRequired: true },
      { name: "Cytryny", quantity: 30, unit: "g", isRequired: false },
      { name: "Oliwa z oliwek", quantity: 20, unit: "g", isRequired: false },
      { name: "Sól", quantity: 3, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Kefir z owocami",
    description: "Orzeźwiający kefir z mrożonymi truskawkami i bananem",
    instructions: `<ol>
      <li>Wlej kefir do blendera.</li>
      <li>Dodaj mrożone truskawki.</li>
      <li>Pokrój banana i dodaj do blendera.</li>
      <li>Zblenduj do gładkości.</li>
      <li>Przelej do szklanki i podawaj od razu.</li>
    </ol>`,
    prepTimeMinutes: 5,
    servings: 1,
    mealCategory: "kolacja",
    proteinType: "vege",
    nutritionalValues: { calories: 220, protein: 8, carbs: 38, fat: 4 },
    ingredients: [
      { name: "Kefir", quantity: 250, unit: "g", isRequired: true },
      { name: "Mrożone truskawki", quantity: 100, unit: "g", isRequired: true },
      { name: "Banany", quantity: 80, unit: "g", isRequired: false },
      { name: "Miód naturalny", quantity: 10, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Grillowany ser z chlebem",
    description: "Rozpływający się ser grillowany podawany z chlebem",
    instructions: `<ol>
      <li>Pokrój ser w grube plastry.</li>
      <li>Rozgrzej patelnię grillową.</li>
      <li>Grilluj ser po 2 minuty z każdej strony.</li>
      <li>Podawaj na ciepłym chlebie.</li>
      <li>Dopraw pieprzem i oregano.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 2,
    mealCategory: "kolacja",
    proteinType: "vege",
    nutritionalValues: { calories: 420, protein: 22, carbs: 28, fat: 26 },
    ingredients: [
      { name: "Ser żółty gouda", quantity: 150, unit: "g", isRequired: true },
      { name: "Chleb pszenny", quantity: 100, unit: "g", isRequired: true },
      { name: "Oliwa z oliwek", quantity: 10, unit: "g", isRequired: false },
      { name: "Oregano", quantity: 1, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Sałatka jarzynowa",
    description: "Klasyczna polska sałatka jarzynowa z majonezem",
    instructions: `<ol>
      <li>Ugotuj ziemniaki, marchew i jajka.</li>
      <li>Ostudź i pokrój w kostkę.</li>
      <li>Dodaj pokrojone ogórki kiszone.</li>
      <li>Wymieszaj z majonezem.</li>
      <li>Dopraw solą i pieprzem, schłódź przed podaniem.</li>
    </ol>`,
    prepTimeMinutes: 40,
    servings: 6,
    mealCategory: "kolacja",
    proteinType: "vege",
    nutritionalValues: { calories: 280, protein: 8, carbs: 24, fat: 18 },
    ingredients: [
      { name: "Ziemniaki", quantity: 400, unit: "g", isRequired: true },
      { name: "Marchew", quantity: 150, unit: "g", isRequired: true },
      { name: "Jajka L", quantity: 3, unit: "szt", isRequired: true },
      { name: "Ogórki kiszone", quantity: 150, unit: "g", isRequired: true },
      { name: "Majonez", quantity: 150, unit: "g", isRequired: true },
      { name: "Mrożony groszek", quantity: 100, unit: "g", isRequired: false },
    ],
  },

  // =====================================================
  // PRZEKĄSKA (Snack) - 10 recipes
  // =====================================================
  {
    name: "Kanapki z pastą jajeczną",
    description: "Delikatna pasta jajeczna z majonezem na chrupiącym pieczywie",
    instructions: `<ol>
      <li>Ugotuj jajka na twardo.</li>
      <li>Obierz i rozgnieć widelcem.</li>
      <li>Wymieszaj z majonezem i musztardą.</li>
      <li>Dopraw solą i pieprzem.</li>
      <li>Smaruj na pieczywie i podawaj.</li>
    </ol>`,
    prepTimeMinutes: 15,
    servings: 4,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 180, protein: 10, carbs: 12, fat: 12 },
    ingredients: [
      { name: "Jajka L", quantity: 4, unit: "szt", isRequired: true },
      { name: "Majonez", quantity: 60, unit: "g", isRequired: true },
      { name: "Musztarda", quantity: 15, unit: "g", isRequired: false },
      { name: "Chleb pszenny", quantity: 100, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Smoothie truskawkowe",
    description: "Kremowe smoothie z mrożonych truskawek i jogurtu",
    instructions: `<ol>
      <li>Wrzuć mrożone truskawki do blendera.</li>
      <li>Dodaj jogurt i mleko.</li>
      <li>Posłodź miodem.</li>
      <li>Zblenduj do gładkości.</li>
      <li>Przelej do szklanki i podawaj natychmiast.</li>
    </ol>`,
    prepTimeMinutes: 5,
    servings: 2,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 160, protein: 6, carbs: 28, fat: 2 },
    ingredients: [
      { name: "Mrożone truskawki", quantity: 200, unit: "g", isRequired: true },
      { name: "Jogurt naturalny", quantity: 150, unit: "g", isRequired: true },
      { name: "Mleko 3.2%", quantity: 0.1, unit: "l", isRequired: false },
      { name: "Miód naturalny", quantity: 20, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Jabłko z masłem orzechowym",
    description: "Świeże jabłko pokrojone w cząstki z masłem orzechowym",
    instructions: `<ol>
      <li>Umyj jabłko i usuń gniazdo nasienne.</li>
      <li>Pokrój w cząstki.</li>
      <li>Rozłóż na talerzu.</li>
      <li>Posyp pokruszonymi orzechami.</li>
      <li>Polej miodem i podawaj.</li>
    </ol>`,
    prepTimeMinutes: 5,
    servings: 1,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 220, protein: 6, carbs: 32, fat: 10 },
    ingredients: [
      { name: "Jabłka", quantity: 150, unit: "g", isRequired: true },
      { name: "Orzechy włoskie", quantity: 30, unit: "g", isRequired: true },
      { name: "Miód naturalny", quantity: 15, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Grzanki z czosnkiem",
    description: "Chrupiące grzanki czosnkowe z masłem i ziołami",
    instructions: `<ol>
      <li>Pokrój chleb w kromki.</li>
      <li>Rozmiękczony masło wymieszaj z przeciśniętym czosnkiem.</li>
      <li>Posmaruj masłem czosnkowym kromki.</li>
      <li>Piecz w piekarniku 10 minut w 180°C.</li>
      <li>Posyp oregano przed podaniem.</li>
    </ol>`,
    prepTimeMinutes: 15,
    servings: 4,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 180, protein: 4, carbs: 22, fat: 8 },
    ingredients: [
      { name: "Chleb pszenny", quantity: 200, unit: "g", isRequired: true },
      { name: "Masło", quantity: 50, unit: "g", isRequired: true },
      { name: "Czosnek", quantity: 15, unit: "g", isRequired: true },
      { name: "Oregano", quantity: 2, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Mix orzechów i bakalii",
    description: "Zdrowa przekąska z mieszanki orzechów, migdałów i rodzynek",
    instructions: `<ol>
      <li>Odmierz porcje orzechów i migdałów.</li>
      <li>Dodaj rodzynki.</li>
      <li>Wymieszaj składniki.</li>
      <li>Przełóż do miseczki.</li>
      <li>Podawaj jako przekąskę lub dodatek do owsianki.</li>
    </ol>`,
    prepTimeMinutes: 2,
    servings: 2,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 280, protein: 8, carbs: 18, fat: 22 },
    ingredients: [
      { name: "Orzechy włoskie", quantity: 40, unit: "g", isRequired: true },
      { name: "Migdały", quantity: 40, unit: "g", isRequired: true },
      { name: "Rodzynki", quantity: 30, unit: "g", isRequired: true },
    ],
  },
  {
    name: "Banan z miodem",
    description: "Prosty banan polany miodem i posypany orzechami",
    instructions: `<ol>
      <li>Obierz banana ze skórki.</li>
      <li>Pokrój wzdłuż na pół.</li>
      <li>Ułóż na talerzu.</li>
      <li>Polej miodem.</li>
      <li>Posyp pokruszonymi orzechami.</li>
    </ol>`,
    prepTimeMinutes: 3,
    servings: 1,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 200, protein: 4, carbs: 38, fat: 6 },
    ingredients: [
      { name: "Banany", quantity: 120, unit: "g", isRequired: true },
      { name: "Miód naturalny", quantity: 20, unit: "g", isRequired: true },
      { name: "Orzechy włoskie", quantity: 15, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Warzywa z dipem jogurtowym",
    description: "Świeże warzywa z kremowym dipem na bazie jogurtu",
    instructions: `<ol>
      <li>Pokrój marchew, ogórek i paprykę w słupki.</li>
      <li>Wymieszaj jogurt z czosnkiem i solą.</li>
      <li>Dodaj do jogurtu oregano.</li>
      <li>Ułóż warzywa na talerzu.</li>
      <li>Podawaj z dipem jogurtowym.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 2,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 120, protein: 6, carbs: 14, fat: 4 },
    ingredients: [
      { name: "Jogurt naturalny", quantity: 150, unit: "g", isRequired: true },
      { name: "Marchew", quantity: 100, unit: "g", isRequired: true },
      { name: "Ogórki", quantity: 80, unit: "g", isRequired: true },
      { name: "Papryka czerwona", quantity: 80, unit: "g", isRequired: false },
      { name: "Czosnek", quantity: 5, unit: "g", isRequired: false },
    ],
  },
  {
    name: "Tost z dżemem",
    description: "Klasyczny chrupiący tost z masłem i dżemem truskawkowym",
    instructions: `<ol>
      <li>Opiecz chleb tostowy.</li>
      <li>Posmaruj ciepły tost masłem.</li>
      <li>Nałóż warstwę dżemu truskawkowego.</li>
      <li>Podawaj natychmiast póki ciepły.</li>
    </ol>`,
    prepTimeMinutes: 5,
    servings: 1,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 220, protein: 4, carbs: 36, fat: 8 },
    ingredients: [
      { name: "Chleb tostowy", quantity: 60, unit: "g", isRequired: true },
      { name: "Masło", quantity: 15, unit: "g", isRequired: true },
      { name: "Dżem truskawkowy", quantity: 30, unit: "g", isRequired: true },
    ],
  },
  {
    name: "Kiełbaska z musztardą",
    description: "Grillowana kiełbaska z ostrą musztardą i pieczywem",
    instructions: `<ol>
      <li>Rozgrzej patelnię lub grill.</li>
      <li>Podsmaż kiełbasę z każdej strony.</li>
      <li>Podawaj z musztardą.</li>
      <li>Dodaj świeże pieczywo.</li>
    </ol>`,
    prepTimeMinutes: 10,
    servings: 2,
    mealCategory: "przekąska",
    proteinType: "czerwone mięso",
    nutritionalValues: { calories: 320, protein: 14, carbs: 18, fat: 22 },
    ingredients: [
      { name: "Kiełbasa śląska", quantity: 150, unit: "g", isRequired: true },
      { name: "Musztarda", quantity: 30, unit: "g", isRequired: true },
      { name: "Bułki kajzerki", quantity: 2, unit: "szt", isRequired: false },
    ],
  },
  {
    name: "Pomarańcza z cynamonem",
    description: "Świeża pomarańcza pokrojona w plastry z cynamonem i miodem",
    instructions: `<ol>
      <li>Obierz pomarańczę ze skórki i białych błonek.</li>
      <li>Pokrój w plastry.</li>
      <li>Ułóż na talerzu.</li>
      <li>Posyp cynamonem.</li>
      <li>Polej miodem i podawaj.</li>
    </ol>`,
    prepTimeMinutes: 5,
    servings: 1,
    mealCategory: "przekąska",
    proteinType: "vege",
    nutritionalValues: { calories: 100, protein: 2, carbs: 24, fat: 0 },
    ingredients: [
      { name: "Pomarańcze", quantity: 200, unit: "g", isRequired: true },
      { name: "Miód naturalny", quantity: 10, unit: "g", isRequired: false },
    ],
  },
];
