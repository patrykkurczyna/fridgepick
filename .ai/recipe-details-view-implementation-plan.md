# Plan implementacji widoku Szczegóły przepisu

## 1. Przegląd

Widok szczegółów przepisu (`/recipes/:id`) to kluczowa strona aplikacji FridgePick, która prezentuje pełne informacje o pojedynczym przepisie. Widok umożliwia użytkownikowi zapoznanie się ze składnikami, instrukcjami przygotowania, wartościami odżywczymi oraz oznaczenie przepisu jako ugotowanego. Kluczową funkcjonalnością jest wizualne oznaczenie dostępności składników w lodówce użytkownika, co pozwala na szybką ocenę możliwości przygotowania potrawy.

## 2. Routing widoku

- **Ścieżka:** `/recipes/[id]`
- **Plik strony:** `src/pages/recipes/[id].astro`
- **Parametr dynamiczny:** `id` - UUID przepisu
- **Layout:** `AuthenticatedLayout` (wymagane uwierzytelnienie)

## 3. Struktura komponentów

```
RecipeDetailsPage (Astro)
└── RecipeDetailsView (React, client:load)
    ├── RecipeDetailsLoadingSkeleton
    ├── RecipeDetailsErrorState
    └── RecipeDetailsContent
        ├── StickyHeader
        │   ├── BackButton
        │   ├── RecipeTitle
        │   ├── PrepTimeInfo
        │   └── CaloriesInfo
        ├── RecipeHero
        │   ├── RecipeImage
        │   └── CategoryBadges
        ├── RecipeDescription
        ├── CookabilityBanner
        ├── IngredientsSection
        │   ├── SectionHeader
        │   ├── RequiredIngredientsList
        │   │   └── IngredientItem[]
        │   │       └── AvailabilityIndicator
        │   └── OptionalIngredientsList
        │       └── IngredientItem[]
        │           └── AvailabilityIndicator
        ├── InstructionsSection
        │   └── HTMLContentRenderer
        ├── NutritionalInfo
        │   └── NutrientItem[]
        └── CookingSection
            ├── PortionsSelector
            ├── MissingIngredientsList
            └── CookButton
```

## 4. Szczegóły komponentów

### 4.1 RecipeDetailsView

- **Opis:** Główny kontener widoku zarządzający stanem, pobieraniem danych i renderowaniem odpowiednich komponentów w zależności od stanu (ładowanie, błąd, sukces).
- **Główne elementy:**
  - Warunkowo renderowane komponenty: `RecipeDetailsLoadingSkeleton`, `RecipeDetailsErrorState` lub `RecipeDetailsContent`
- **Obsługiwane interakcje:**
  - Inicjalizacja pobierania danych przy mount
  - Retry w przypadku błędu
  - Nawigacja wstecz
- **Walidacja:** Brak (delegowana do komponentów potomnych)
- **Typy:**
  - `RecipeDetailDTO`, `RecipeDetailResponse`, `ApiErrorResponse`
- **Propsy:**
  ```typescript
  interface RecipeDetailsViewProps {
    recipeId: string;
  }
  ```

### 4.2 StickyHeader

- **Opis:** Przyklejony nagłówek z kluczowymi informacjami o przepisie, który pozostaje widoczny podczas przewijania strony. Zawiera przycisk powrotu i podstawowe metadane.
- **Główne elementy:**
  - `<header>` z `position: sticky`
  - Przycisk powrotu (ikona strzałki)
  - Nazwa przepisu (skrócona jeśli długa)
  - Czas przygotowania z ikoną zegara
  - Kalorie z ikoną ognia
- **Obsługiwane interakcje:**
  - Kliknięcie przycisku powrotu → nawigacja do `/recipes`
- **Walidacja:** Brak
- **Typy:**
  ```typescript
  interface StickyHeaderProps {
    recipeName: string;
    prepTimeMinutes: number;
    calories: number | null;
    onBack: () => void;
  }
  ```
- **Propsy:** `recipeName`, `prepTimeMinutes`, `calories`, `onBack`

### 4.3 RecipeHero

- **Opis:** Sekcja wizualna z obrazem przepisu oraz badge'ami kategorii posiłku i typu białka.
- **Główne elementy:**
  - `<figure>` z obrazem przepisu (lub placeholder)
  - Badge kategorii posiłku (śniadanie/obiad/kolacja/przekąska)
  - Badge typu białka (ryba/drób/czerwone mięso/vege)
  - Informacja o liczbie porcji
- **Obsługiwane interakcje:** Brak (komponent prezentacyjny)
- **Walidacja:** Brak
- **Typy:**
  ```typescript
  interface RecipeHeroProps {
    imageUrl: string | null;
    name: string;
    mealCategory: MealCategory;
    proteinType: ProteinType;
    servings: number;
  }
  ```
- **Propsy:** `imageUrl`, `name`, `mealCategory`, `proteinType`, `servings`

### 4.4 CookabilityBanner

- **Opis:** Banner informujący o możliwości ugotowania przepisu. Wyświetla pozytywny komunikat gdy wszystkie składniki są dostępne lub ostrzeżenie z listą brakujących składników.
- **Główne elementy:**
  - Banner zielony (sukces) lub żółty (ostrzeżenie)
  - Ikona statusu (check lub warning)
  - Tekst statusu
  - Lista brakujących składników (jeśli dotyczy)
- **Obsługiwane interakcje:** Brak (komponent prezentacyjny)
- **Walidacja:** Brak
- **Typy:**
  ```typescript
  interface CookabilityBannerProps {
    canCook: boolean;
    missingIngredients: string[];
  }
  ```
- **Propsy:** `canCook`, `missingIngredients`

### 4.5 IngredientsSection

- **Opis:** Sekcja prezentująca listę składników przepisu z podziałem na wymagane i opcjonalne. Każdy składnik ma wizualne oznaczenie dostępności w lodówce użytkownika.
- **Główne elementy:**
  - Nagłówek sekcji "Składniki"
  - Podsekcja "Wymagane" z listą składników
  - Podsekcja "Opcjonalne" z listą składników (jeśli istnieją)
  - Podsumowanie dostępności (np. "6/8 składników dostępnych")
- **Obsługiwane interakcje:** Brak (komponent prezentacyjny)
- **Walidacja:** Brak
- **Typy:**
  ```typescript
  interface IngredientsSectionProps {
    ingredients: RecipeIngredientDTO[];
  }
  ```
- **Propsy:** `ingredients`

### 4.6 IngredientItem

- **Opis:** Pojedynczy element listy składników z informacją o nazwie, ilości, jednostce oraz wizualnym wskaźnikiem dostępności.
- **Główne elementy:**
  - Nazwa składnika
  - Ilość i jednostka (np. "200 g")
  - `AvailabilityIndicator` - wizualne oznaczenie dostępności
  - Opcjonalnie: ilość posiadana przez użytkownika
- **Obsługiwane interakcje:** Brak (komponent prezentacyjny)
- **Walidacja:** Brak
- **Typy:**
  ```typescript
  interface IngredientItemProps {
    ingredient: RecipeIngredientDTO;
    showUserQuantity?: boolean;
  }
  ```
- **Propsy:** `ingredient`, `showUserQuantity`

### 4.7 AvailabilityIndicator

- **Opis:** Wizualny wskaźnik dostępności składnika w formie ikony i koloru. Trzy stany: dostępny (zielony), częściowo dostępny (żółty), brak (czerwony).
- **Główne elementy:**
  - Ikona (CheckCircle, ExclamationTriangle, XCircle)
  - Tooltip z dodatkową informacją
- **Obsługiwane interakcje:**
  - Hover → wyświetlenie tooltip z szczegółami
- **Walidacja:** Brak
- **Typy:**
  ```typescript
  type AvailabilityStatus = "available" | "partial" | "missing";

  interface AvailabilityIndicatorProps {
    status: AvailabilityStatus;
    requiredQuantity: number;
    userQuantity: number;
    unit: string;
  }
  ```
- **Propsy:** `status`, `requiredQuantity`, `userQuantity`, `unit`

### 4.8 InstructionsSection

- **Opis:** Sekcja prezentująca instrukcje przygotowania przepisu. Instrukcje są w formacie HTML i muszą być bezpiecznie renderowane.
- **Główne elementy:**
  - Nagłówek sekcji "Przygotowanie"
  - Kontener z instrukcjami HTML (sanitized)
  - Semantyczne znaczniki (ol, li dla kroków)
- **Obsługiwane interakcje:** Brak (komponent prezentacyjny)
- **Walidacja:**
  - Sanityzacja HTML przed renderowaniem (ochrona przed XSS)
- **Typy:**
  ```typescript
  interface InstructionsSectionProps {
    instructions: string;
  }
  ```
- **Propsy:** `instructions`

### 4.9 NutritionalInfo

- **Opis:** Panel prezentujący wartości odżywcze przepisu w przejrzystej formie tabelarycznej lub kafelkowej.
- **Główne elementy:**
  - Nagłówek sekcji "Wartości odżywcze"
  - Kafelki/wiersze z poszczególnymi wartościami:
    - Kalorie (kcal)
    - Białko (g)
    - Węglowodany (g)
    - Tłuszcze (g)
    - Opcjonalnie: błonnik, cukry
  - Informacja "na porcję"
- **Obsługiwane interakcje:** Brak (komponent prezentacyjny)
- **Walidacja:** Brak
- **Typy:**
  ```typescript
  interface NutritionalInfoProps {
    nutritionalValues: NutritionalValuesDTO | null;
    servings: number;
  }
  ```
- **Propsy:** `nutritionalValues`, `servings`

### 4.10 CookingSection

- **Opis:** Sekcja akcji gotowania z możliwością wyboru liczby porcji i przyciskiem oznaczenia przepisu jako ugotowanego.
- **Główne elementy:**
  - Selektor liczby porcji (stepper +/-)
  - Lista brakujących składników (jeśli są)
  - Przycisk "Ugotowane" (CookButton)
- **Obsługiwane interakcje:**
  - Zmiana liczby porcji
  - Kliknięcie "Ugotowane" → wywołanie API
- **Walidacja:**
  - Liczba porcji: min 1, max 10
  - Przycisk aktywny tylko gdy canCook = true
- **Typy:**
  ```typescript
  interface CookingSectionProps {
    recipeId: string;
    defaultServings: number;
    canCook: boolean;
    missingIngredients: string[];
    onCookComplete: (result: CreateCookedMealResponse) => void;
    onCookError: (error: string) => void;
  }
  ```
- **Propsy:** `recipeId`, `defaultServings`, `canCook`, `missingIngredients`, `onCookComplete`, `onCookError`

### 4.11 PortionsSelector

- **Opis:** Komponent do wyboru liczby porcji z przyciskami +/- i polem numerycznym.
- **Główne elementy:**
  - Przycisk minus (-)
  - Wyświetlacz liczby porcji
  - Przycisk plus (+)
  - Etykieta "porcji"
- **Obsługiwane interakcje:**
  - Kliknięcie +/- → zmiana wartości
  - Bezpośrednia edycja pola
- **Walidacja:**
  - Wartość: 1-10 (integer)
- **Typy:**
  ```typescript
  interface PortionsSelectorProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
  }
  ```
- **Propsy:** `value`, `onChange`, `min`, `max`, `disabled`

### 4.12 CookButton

- **Opis:** Przycisk akcji "Ugotowane" z obsługą stanu ładowania i disabled.
- **Główne elementy:**
  - Przycisk z ikoną (CheckIcon lub SpinnerIcon)
  - Tekst "Oznacz jako ugotowane"
- **Obsługiwane interakcje:**
  - Kliknięcie → wywołanie onCook
- **Walidacja:**
  - Przycisk disabled gdy: isCooking, !canCook
- **Typy:**
  ```typescript
  interface CookButtonProps {
    onClick: () => void;
    disabled: boolean;
    isLoading: boolean;
    canCook: boolean;
  }
  ```
- **Propsy:** `onClick`, `disabled`, `isLoading`, `canCook`

### 4.13 RecipeDetailsLoadingSkeleton

- **Opis:** Komponent skeleton wyświetlany podczas ładowania danych przepisu.
- **Główne elementy:**
  - Placeholder dla nagłówka
  - Placeholder dla obrazu
  - Placeholdery dla sekcji składników
  - Placeholdery dla instrukcji
- **Propsy:** Brak

### 4.14 RecipeDetailsErrorState

- **Opis:** Komponent wyświetlany w przypadku błędu ładowania przepisu.
- **Główne elementy:**
  - Ikona błędu
  - Komunikat błędu
  - Przycisk "Spróbuj ponownie"
  - Przycisk "Wróć do przepisów"
- **Obsługiwane interakcje:**
  - Kliknięcie Retry → ponowne pobranie
  - Kliknięcie Wróć → nawigacja
- **Typy:**
  ```typescript
  interface RecipeDetailsErrorStateProps {
    error: string;
    onRetry: () => void;
    onBack: () => void;
  }
  ```
- **Propsy:** `error`, `onRetry`, `onBack`

## 5. Typy

### 5.1 Typy z API (istniejące w `src/types.ts`)

```typescript
/** Szczegółowy przepis z składnikami */
interface RecipeDetailDTO extends RecipeDTO {
  instructions: string;
  ingredients: RecipeIngredientDTO[];
  canCook: boolean;
  missingIngredients: string[];
}

/** Składnik przepisu z informacją o dostępności */
interface RecipeIngredientDTO {
  id: string;
  name: string;
  quantity: number;
  unit: "g" | "l" | "szt";
  isRequired: boolean;
  userHasIngredient: boolean;
  userQuantity: number;
}

/** Wartości odżywcze */
interface NutritionalValuesDTO {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

/** Response z API */
interface RecipeDetailResponse {
  recipe: RecipeDetailDTO;
}

/** Request do oznaczenia jako ugotowane */
interface CreateCookedMealRequest {
  recipeId: string;
  portionsCount: number;
  mealPlanItemId?: string;
}

/** Response po oznaczeniu jako ugotowane */
interface CreateCookedMealResponse {
  success: boolean;
  cookedMeal: {
    id: string;
    recipeId: string;
    portionsCount: number;
    cookedAt: string;
    mealPlanItemId: string | null;
  };
  inventoryUpdates: InventoryUpdateDTO[];
  insufficientIngredients: string[];
}

/** Aktualizacja stanu produktu */
interface InventoryUpdateDTO {
  productId: string;
  productName: string;
  oldQuantity: number;
  newQuantity: number;
  deducted: number;
  unit: "g" | "l" | "szt";
}
```

### 5.2 Typy ViewModel (nowe, do utworzenia w `src/types/recipe-details.ts`)

```typescript
/** Status dostępności składnika */
type IngredientAvailabilityStatus = "available" | "partial" | "missing";

/** ViewModel dla składnika z obliczonym statusem */
interface IngredientViewModel extends RecipeIngredientDTO {
  availabilityStatus: IngredientAvailabilityStatus;
  availabilityPercentage: number;
}

/** ViewModel dla sekcji składników */
interface IngredientsViewModel {
  required: IngredientViewModel[];
  optional: IngredientViewModel[];
  totalCount: number;
  availableCount: number;
  availabilityPercentage: number;
}

/** Stan widoku szczegółów przepisu */
interface RecipeDetailsViewState {
  recipe: RecipeDetailDTO | null;
  loading: boolean;
  error: string | null;
  isCooking: boolean;
  cookingResult: CreateCookedMealResponse | null;
  portions: number;
}

/** Propsy głównego widoku */
interface RecipeDetailsViewProps {
  recipeId: string;
}

/** Propsy dla komponentu CookingSection */
interface CookingSectionProps {
  recipeId: string;
  defaultServings: number;
  canCook: boolean;
  missingIngredients: string[];
  onCookComplete: (result: CreateCookedMealResponse) => void;
  onCookError: (error: string) => void;
}
```

### 5.3 Funkcje pomocnicze

```typescript
/** Oblicza status dostępności składnika */
function calculateAvailabilityStatus(
  required: number,
  available: number
): IngredientAvailabilityStatus {
  if (available >= required) return "available";
  if (available > 0) return "partial";
  return "missing";
}

/** Transformuje składniki do ViewModel */
function transformIngredientsToViewModel(
  ingredients: RecipeIngredientDTO[]
): IngredientsViewModel {
  // Implementacja...
}
```

## 6. Zarządzanie stanem

### 6.1 Hook `useRecipeDetails`

Nowy custom hook do zarządzania stanem widoku szczegółów przepisu.

```typescript
interface UseRecipeDetailsReturn {
  // Stan
  recipe: RecipeDetailDTO | null;
  loading: boolean;
  error: string | null;
  isCooking: boolean;
  portions: number;
  cookingResult: CreateCookedMealResponse | null;

  // Computed
  ingredientsViewModel: IngredientsViewModel | null;
  canCookWithPortions: boolean;

  // Akcje
  setPortions: (portions: number) => void;
  markAsCooked: () => Promise<void>;
  retry: () => void;
  clearCookingResult: () => void;
}

const useRecipeDetails = (recipeId: string): UseRecipeDetailsReturn => {
  // Implementacja...
};
```

### 6.2 Przepływ stanu

1. **Inicjalizacja:** `loading: true`, `recipe: null`, `error: null`
2. **Sukces:** `loading: false`, `recipe: data`, `error: null`
3. **Błąd:** `loading: false`, `recipe: null`, `error: message`
4. **Gotowanie:** `isCooking: true` → `isCooking: false`, `cookingResult: result`

### 6.3 Lokalne stany komponentów

- **PortionsSelector:** `localValue` dla optymistycznej aktualizacji
- **StickyHeader:** `isSticky` (boolean) bazujący na scroll position
- **RecipeHero:** `imageError` (boolean) dla fallback image

## 7. Integracja API

### 7.1 Pobieranie szczegółów przepisu

**Endpoint:** `GET /api/recipes/:id`

**Request:**
```typescript
const fetchRecipeDetails = async (recipeId: string): Promise<RecipeDetailResponse> => {
  const token = getAccessToken();
  const response = await fetch(`/api/recipes/${recipeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Przepis nie został znaleziony');
    }
    if (response.status === 401) {
      throw new Error('Sesja wygasła. Zaloguj się ponownie.');
    }
    throw new Error(`Błąd serwera: ${response.status}`);
  }

  return response.json();
};
```

**Response:** `RecipeDetailResponse`

### 7.2 Oznaczenie jako ugotowane

**Endpoint:** `POST /api/cooked-meals` (do zaimplementowania)

**Request:**
```typescript
interface CreateCookedMealRequest {
  recipeId: string;
  portionsCount: number;
  mealPlanItemId?: string;
}
```

**Response:**
```typescript
interface CreateCookedMealResponse {
  success: boolean;
  cookedMeal: {
    id: string;
    recipeId: string;
    portionsCount: number;
    cookedAt: string;
    mealPlanItemId: string | null;
  };
  inventoryUpdates: InventoryUpdateDTO[];
  insufficientIngredients: string[];
}
```

**Uwaga:** Endpoint `POST /api/cooked-meals` nie istnieje i wymaga implementacji przed pełną funkcjonalnością przycisku "Ugotowane".

## 8. Interakcje użytkownika

### 8.1 Nawigacja

| Interakcja | Komponent | Efekt |
|------------|-----------|-------|
| Kliknięcie przycisku powrotu | StickyHeader | Nawigacja do `/recipes` |
| Kliknięcie linku składnika | IngredientItem | (opcjonalnie) Nawigacja do szczegółów produktu |

### 8.2 Przeglądanie

| Interakcja | Komponent | Efekt |
|------------|-----------|-------|
| Scroll strony | StickyHeader | Nagłówek pozostaje przyklejony na górze |
| Hover nad wskaźnikiem dostępności | AvailabilityIndicator | Wyświetlenie tooltip z szczegółami |

### 8.3 Gotowanie

| Interakcja | Komponent | Efekt |
|------------|-----------|-------|
| Kliknięcie +/- porcji | PortionsSelector | Zmiana liczby porcji (1-10) |
| Kliknięcie "Ugotowane" | CookButton | Wywołanie API, aktualizacja inwentarza, toast sukcesu/błędu |

### 8.4 Obsługa błędów

| Interakcja | Komponent | Efekt |
|------------|-----------|-------|
| Kliknięcie "Spróbuj ponownie" | RecipeDetailsErrorState | Ponowne pobranie danych |
| Kliknięcie "Wróć do przepisów" | RecipeDetailsErrorState | Nawigacja do `/recipes` |

## 9. Warunki i walidacja

### 9.1 Walidacja ID przepisu

- **Warunek:** ID musi być poprawnym UUID
- **Komponent:** RecipeDetailsView (na poziomie hooka)
- **Efekt:** Błąd walidacji → wyświetlenie komunikatu "Nieprawidłowy identyfikator przepisu"

### 9.2 Walidacja liczby porcji

- **Warunek:** 1 ≤ portions ≤ 10, liczba całkowita
- **Komponent:** PortionsSelector
- **Efekt:** Wartość poza zakresem → clamp do zakresu

### 9.3 Możliwość gotowania

- **Warunek:** `canCook === true` (brak brakujących wymaganych składników)
- **Komponent:** CookButton, CookabilityBanner
- **Efekt:**
  - `canCook: true` → przycisk aktywny, zielony banner
  - `canCook: false` → przycisk nieaktywny, żółty banner z listą brakujących

### 9.4 Sanityzacja HTML

- **Warunek:** Instrukcje zawierają bezpieczny HTML
- **Komponent:** InstructionsSection
- **Efekt:** Użycie DOMPurify lub podobnej biblioteki do sanityzacji przed `dangerouslySetInnerHTML`

## 10. Obsługa błędów

### 10.1 Błędy sieciowe

| Scenariusz | Obsługa |
|------------|---------|
| Brak połączenia | Wyświetlenie `RecipeDetailsErrorState` z komunikatem o braku połączenia |
| Timeout | Wyświetlenie błędu z możliwością ponowienia |
| Błąd serwera (5xx) | Ogólny komunikat błędu |

### 10.2 Błędy biznesowe

| Scenariusz | Obsługa |
|------------|---------|
| Przepis nie istnieje (404) | Komunikat "Przepis nie został znaleziony" + nawigacja wstecz |
| Brak autoryzacji (401) | Przekierowanie do logowania |
| Rate limit (429) | Komunikat o zbyt wielu żądaniach |

### 10.3 Błędy gotowania

| Scenariusz | Obsługa |
|------------|---------|
| Niewystarczające składniki | Toast z listą brakujących składników |
| Błąd zapisu | Toast z komunikatem błędu + możliwość ponowienia |
| Sukces | Toast potwierdzający + aktualizacja UI |

### 10.4 Błędy walidacji

| Scenariusz | Obsługa |
|------------|---------|
| Nieprawidłowe ID | Komunikat błędu w UI |
| Nieprawidłowa liczba porcji | Automatyczna korekta do zakresu 1-10 |

## 11. Kroki implementacji

### Faza 1: Przygotowanie typów i struktury

1. **Utworzenie pliku typów** `src/types/recipe-details.ts`:
   - Zdefiniowanie `IngredientAvailabilityStatus`
   - Zdefiniowanie `IngredientViewModel` i `IngredientsViewModel`
   - Zdefiniowanie `RecipeDetailsViewState`
   - Implementacja funkcji pomocniczych (`calculateAvailabilityStatus`, `transformIngredientsToViewModel`)

2. **Utworzenie strony Astro** `src/pages/recipes/[id].astro`:
   - Import `AuthenticatedLayout`
   - Ekstrakcja parametru `id` z URL
   - Przekazanie `recipeId` do komponentu React

### Faza 2: Hook i główny widok

3. **Utworzenie hooka** `src/hooks/useRecipeDetails.ts`:
   - Implementacja pobierania danych z API
   - Zarządzanie stanami: loading, error, recipe, portions, isCooking
   - Implementacja akcji: setPortions, markAsCooked, retry

4. **Utworzenie komponentu głównego** `src/components/recipe-details/RecipeDetailsView.tsx`:
   - Użycie hooka `useRecipeDetails`
   - Warunkowe renderowanie: skeleton, error, content
   - Przekazanie danych do komponentów potomnych

### Faza 3: Komponenty prezentacyjne (górna część)

5. **StickyHeader** `src/components/recipe-details/StickyHeader.tsx`:
   - Implementacja sticky behavior
   - Przycisk powrotu z nawigacją
   - Wyświetlanie nazwy, czasu, kalorii

6. **RecipeHero** `src/components/recipe-details/RecipeHero.tsx`:
   - Obsługa obrazka z fallback
   - Badge'e kategorii i typu białka
   - Informacja o porcjach

7. **CookabilityBanner** `src/components/recipe-details/CookabilityBanner.tsx`:
   - Warunkowe style (zielony/żółty)
   - Lista brakujących składników

### Faza 4: Sekcja składników

8. **AvailabilityIndicator** `src/components/recipe-details/AvailabilityIndicator.tsx`:
   - Trzy stany wizualne
   - Tooltip z szczegółami

9. **IngredientItem** `src/components/recipe-details/IngredientItem.tsx`:
   - Wyświetlanie składnika
   - Integracja z AvailabilityIndicator

10. **IngredientsSection** `src/components/recipe-details/IngredientsSection.tsx`:
    - Podział na wymagane/opcjonalne
    - Podsumowanie dostępności

### Faza 5: Pozostałe sekcje prezentacyjne

11. **InstructionsSection** `src/components/recipe-details/InstructionsSection.tsx`:
    - Bezpieczne renderowanie HTML (DOMPurify)
    - Stylowanie kroków

12. **NutritionalInfo** `src/components/recipe-details/NutritionalInfo.tsx`:
    - Grid/tabela z wartościami
    - Obsługa brakujących wartości

### Faza 6: Sekcja gotowania

13. **PortionsSelector** `src/components/recipe-details/PortionsSelector.tsx`:
    - Przyciski +/-
    - Walidacja zakresu

14. **CookButton** `src/components/recipe-details/CookButton.tsx`:
    - Stan loading
    - Stan disabled

15. **CookingSection** `src/components/recipe-details/CookingSection.tsx`:
    - Integracja PortionsSelector i CookButton
    - Lista brakujących składników

### Faza 7: Stany pomocnicze

16. **RecipeDetailsLoadingSkeleton** `src/components/recipe-details/RecipeDetailsLoadingSkeleton.tsx`:
    - Skeleton dla wszystkich sekcji

17. **RecipeDetailsErrorState** `src/components/recipe-details/RecipeDetailsErrorState.tsx`:
    - Komunikat błędu
    - Przyciski retry i wstecz

### Faza 8: Integracja i testy

18. **Eksport komponentów** `src/components/recipe-details/index.ts`:
    - Eksport wszystkich publicznych komponentów

19. **Testy jednostkowe**:
    - Testy hooka `useRecipeDetails`
    - Testy funkcji pomocniczych
    - Testy komponentów (React Testing Library)

20. **Testy E2E** (Playwright):
    - Nawigacja do szczegółów przepisu
    - Wyświetlanie składników z dostępnością
    - Oznaczanie jako ugotowane (gdy endpoint będzie gotowy)

### Faza 9: Implementacja endpointu (jeśli wymagane)

21. **Endpoint POST /api/cooked-meals** (jeśli nie istnieje):
    - Walidacja request body
    - Logika odejmowania składników z inwentarza
    - Zapis cooked_meal do bazy

### Faza 10: Finalizacja

22. **Code review i refaktoring**:
    - Sprawdzenie zgodności z ESLint
    - Optymalizacja wydajności (React.memo, useMemo, useCallback)
    - Sprawdzenie dostępności (a11y)

23. **Dokumentacja**:
    - Komentarze JSDoc dla publicznych komponentów
    - Aktualizacja README jeśli wymagane
