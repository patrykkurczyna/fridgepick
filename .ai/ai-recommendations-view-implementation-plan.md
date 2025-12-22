# View Implementation Plan: AI Recommendations

## 1. Overview

The AI Recommendations view (`/recipes/recommendations`) provides AI-powered recipe matching based on the user's available ingredients in their fridge. This view displays personalized recipe recommendations organized by match level (idealny, prawie idealny, wymaga dokupienia), showing users which recipes they can cook with their current ingredients and which require additional shopping.

Key features:
- **Match Level Tabs**: Filter recommendations by matching quality
- **Recipe Cards with Match Indicators**: Visual representation of match score and missing ingredients
- **Expiring Ingredients Highlight**: Prioritize recipes using soon-to-expire ingredients
- **Refresh Functionality**: Manual refresh with rate limiting feedback
- **Loading State with Progress**: Visual feedback during AI processing

## 2. View Routing

**Path:** `/recipes/recommendations`

**File Location:** `src/pages/recipes/recommendations.astro`

**Layout:** `AuthenticatedLayout` (same as other authenticated pages)

## 3. Component Structure

```
AIRecommendationsPage (recommendations.astro)
├── DemoModeIndicator (conditional)
└── RecommendationsView (React client component)
    ├── RecommendationsHeader
    │   ├── PageTitle + Description
    │   ├── RecommendationsCounter
    │   └── RefreshRecommendationsButton
    ├── RecommendationsFilters
    │   ├── MealCategorySelect
    │   ├── MaxMissingIngredientsSlider
    │   └── PrioritizeExpiringToggle
    ├── MatchLevelTabs
    │   ├── Tab (all)
    │   ├── Tab (idealny)
    │   ├── Tab (prawie idealny)
    │   └── Tab (wymaga dokupienia)
    ├── LoadingStateWithProgress (conditional)
    ├── RecommendationsEmptyState (conditional)
    ├── RateLimitWarning (conditional)
    └── RecommendationsGrid
        └── RecommendedRecipeCard (multiple)
            ├── RecipeImage
            ├── RecipeInfo (name, category, time, calories)
            ├── MatchScoreIndicator
            ├── ExpiringIngredientsTag
            └── MissingIngredientsTag
```

## 4. Component Details

### 4.1 RecommendationsView

**Component Description:**
Main container component that orchestrates the entire AI recommendations view. Manages state via the `useRecommendations` hook and coordinates all child components.

**Main Elements:**
- `<div>` container with `min-h-screen bg-gray-50` styling
- Child components: `RecommendationsHeader`, `RecommendationsFilters`, `MatchLevelTabs`, conditional loading/empty/error states, `RecommendationsGrid`

**Handled Interactions:**
- None directly (delegated to child components)

**Handled Validation:**
- User authentication check (redirects if not authenticated)

**Types:**
- `UseRecommendationsReturn` (from custom hook)
- `AIRecipeRecommendationsResponse`

**Props:**
- None (root view component)

---

### 4.2 RecommendationsHeader

**Component Description:**
Header section displaying the page title, recommendation count, cache status indicator, and refresh button.

**Main Elements:**
- `<header>` with white background and bottom border
- `<h1>` page title: "Rekomendacje AI"
- `<p>` subtitle with recommendation count
- Cache status badge (shows if using cached results)
- `RefreshRecommendationsButton` component

**Handled Interactions:**
- None directly (refresh handled by child button)

**Handled Validation:**
- None

**Types:**
- `RecommendationsHeaderProps`

**Props:**
```typescript
interface RecommendationsHeaderProps {
  totalCount: number;
  loading: boolean;
  cacheUsed: boolean;
  generatedAt: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  isRateLimited: boolean;
  rateLimitResetTime: number | null;
}
```

---

### 4.3 RefreshRecommendationsButton

**Component Description:**
Button to manually trigger AI recommendation refresh with rate limiting feedback and cooldown timer.

**Main Elements:**
- `<button>` with gradient background (matching AI button style from RecipesHeader)
- `ArrowPathIcon` from Heroicons (animated spin when refreshing)
- Cooldown timer display when rate limited
- Tooltip with last generation time

**Handled Interactions:**
- `onClick`: Trigger refresh (calls `onRefresh` prop)

**Handled Validation:**
- Disabled when `isRefreshing` is true
- Disabled when `isRateLimited` is true
- Shows countdown timer when rate limited

**Types:**
- `RefreshRecommendationsButtonProps`

**Props:**
```typescript
interface RefreshRecommendationsButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  isRateLimited: boolean;
  rateLimitResetTime: number | null; // timestamp in ms
  lastGeneratedAt: string | null;
}
```

---

### 4.4 RecommendationsFilters

**Component Description:**
Filter panel for refining AI recommendations. Includes meal category filter, max missing ingredients slider, and toggle for prioritizing expiring ingredients.

**Main Elements:**
- `<div>` container with white background and border (matching RecipesFilters style)
- `MealCategorySelect` dropdown
- `MaxMissingIngredientsSlider` (range 0-5, default 3)
- `PrioritizeExpiringToggle` checkbox/switch
- Reset filters button (conditional)

**Handled Interactions:**
- `onMealCategoryChange`: Update meal category filter
- `onMaxMissingChange`: Update max missing ingredients
- `onPrioritizeExpiringChange`: Toggle prioritize expiring
- `onResetFilters`: Reset all filters to defaults

**Handled Validation:**
- `maxMissingIngredients` must be 0-5
- All filters disabled during loading

**Types:**
- `RecommendationsFiltersProps`
- `RecommendationsFilterState`

**Props:**
```typescript
interface RecommendationsFiltersProps {
  filters: RecommendationsFilterState;
  onMealCategoryChange: (category: MealCategory | null) => void;
  onMaxMissingChange: (value: number) => void;
  onPrioritizeExpiringChange: (value: boolean) => void;
  onResetFilters: () => void;
  loading: boolean;
  activeFiltersCount: number;
}
```

---

### 4.5 MatchLevelTabs

**Component Description:**
Tab navigation for filtering displayed recommendations by match level. Shows counts for each level and allows filtering without new API calls (client-side filtering).

**Main Elements:**
- `<nav>` with role="tablist"
- Tab buttons for: "Wszystkie", "Idealny", "Prawie idealny", "Wymaga dokupienia"
- Each tab shows count badge
- Color-coded tabs matching the match levels

**Handled Interactions:**
- `onClick` on tabs: Update active tab filter

**Handled Validation:**
- None (UI-only filtering)

**Types:**
- `MatchLevelTabsProps`
- `RecipeMatchLevel`

**Props:**
```typescript
interface MatchLevelTabsProps {
  activeLevel: RecipeMatchLevel | "all";
  counts: MatchLevelCounts;
  onChange: (level: RecipeMatchLevel | "all") => void;
  disabled: boolean;
}

interface MatchLevelCounts {
  all: number;
  idealny: number;
  "prawie idealny": number;
  "wymaga dokupienia": number;
}
```

---

### 4.6 RecommendedRecipeCard

**Component Description:**
Individual recipe card displaying a recommended recipe with match indicators, missing ingredients, and expiring ingredients highlighting.

**Main Elements:**
- `<div>` clickable card with hover effects
- Recipe image with fallback
- Recipe name and description
- Meal category badge
- `MatchScoreIndicator` (progress bar or percentage)
- `ExpiringIngredientsTag` (conditional, shows ingredients expiring soon)
- `MissingIngredientsTag` (conditional, shows missing ingredients)
- Prep time and calories info

**Handled Interactions:**
- `onClick`: Navigate to recipe detail page
- `onKeyDown`: Keyboard navigation (Enter/Space)

**Handled Validation:**
- None

**Types:**
- `RecommendedRecipeCardProps`
- `AIRecipeRecommendationDTO`

**Props:**
```typescript
interface RecommendedRecipeCardProps {
  recommendation: AIRecipeRecommendationDTO;
  onClick: (recipeId: string) => void;
}
```

---

### 4.7 MatchScoreIndicator

**Component Description:**
Visual indicator showing the match score as a progress bar or circular progress with percentage and color coding based on match level.

**Main Elements:**
- Progress bar (horizontal) or circular progress
- Percentage label
- Color coding: green (idealny), yellow (prawie idealny), red (wymaga dokupienia)

**Handled Interactions:**
- None (display only)

**Handled Validation:**
- None

**Types:**
- `MatchScoreIndicatorProps`

**Props:**
```typescript
interface MatchScoreIndicatorProps {
  score: number; // 0-1
  matchLevel: RecipeMatchLevel;
}
```

---

### 4.8 MissingIngredientsTag

**Component Description:**
Tag component displaying a list of missing ingredients needed for the recipe.

**Main Elements:**
- `<div>` container with red/orange styling
- `ExclamationTriangleIcon` from Heroicons
- Comma-separated list of missing ingredients
- "Brakuje: {count}" label

**Handled Interactions:**
- None (display only)

**Handled Validation:**
- Only renders if `ingredients.length > 0`

**Types:**
- `MissingIngredientsTagProps`

**Props:**
```typescript
interface MissingIngredientsTagProps {
  ingredients: string[];
  maxDisplay?: number; // default 3, show "+X more" for rest
}
```

---

### 4.9 ExpiringIngredientsTag

**Component Description:**
Tag component highlighting ingredients that are expiring soon and would be used in this recipe.

**Main Elements:**
- `<div>` container with amber/orange styling
- `ClockIcon` from Heroicons
- List of expiring ingredients being utilized
- "Wykorzystuje wygasajace: {list}" label

**Handled Interactions:**
- None (display only)

**Handled Validation:**
- Only renders if `ingredients.length > 0`

**Types:**
- `ExpiringIngredientsTagProps`

**Props:**
```typescript
interface ExpiringIngredientsTagProps {
  ingredients: string[];
}
```

---

### 4.10 LoadingStateWithProgress

**Component Description:**
Loading indicator shown during AI processing with progress indication and helpful message.

**Main Elements:**
- Centered container with AI-themed styling
- `SparklesIcon` with pulse animation
- "Analizuję Twoje składniki..." message
- Optional progress bar or spinner
- Helpful tip text (e.g., "AI dobiera najlepsze przepisy...")

**Handled Interactions:**
- None (display only)

**Handled Validation:**
- None

**Types:**
- `LoadingStateWithProgressProps`

**Props:**
```typescript
interface LoadingStateWithProgressProps {
  message?: string;
}
```

---

### 4.11 RecommendationsEmptyState

**Component Description:**
Empty state shown when no recommendations are available (either no products in fridge or no matching recipes).

**Main Elements:**
- Centered container with illustration
- Contextual message based on reason
- CTA button (add products or adjust filters)

**Handled Interactions:**
- `onClick` on CTA: Navigate to fridge or reset filters

**Handled Validation:**
- None

**Types:**
- `RecommendationsEmptyStateProps`

**Props:**
```typescript
interface RecommendationsEmptyStateProps {
  reason: "no-products" | "no-matches" | "filters-too-strict";
  onAction: () => void;
  hasActiveFilters: boolean;
}
```

---

### 4.12 RateLimitWarning

**Component Description:**
Warning banner displayed when the user has hit the rate limit for AI recommendations.

**Main Elements:**
- Alert banner with warning styling
- `ExclamationCircleIcon` from Heroicons
- Message explaining rate limit
- Countdown timer until reset

**Handled Interactions:**
- None (display only)

**Handled Validation:**
- None

**Types:**
- `RateLimitWarningProps`

**Props:**
```typescript
interface RateLimitWarningProps {
  resetTime: number; // timestamp in ms
}
```

---

### 4.13 RecommendationsGrid

**Component Description:**
Grid container for displaying recommendation cards in a responsive layout.

**Main Elements:**
- CSS Grid container (responsive columns)
- Maps over filtered recommendations to render `RecommendedRecipeCard`

**Handled Interactions:**
- None (delegated to cards)

**Handled Validation:**
- None

**Types:**
- `RecommendationsGridProps`

**Props:**
```typescript
interface RecommendationsGridProps {
  recommendations: AIRecipeRecommendationDTO[];
  onRecipeClick: (recipeId: string) => void;
}
```

## 5. Types

### 5.1 Existing Types (from `src/types.ts`)

```typescript
// Match level for AI recipe recommendations
type RecipeMatchLevel = "idealny" | "prawie idealny" | "wymaga dokupienia";

// AI recipe recommendation DTO
interface AIRecipeRecommendationDTO {
  recipe: Pick<RecipeDTO, "id" | "name" | "mealCategory" | "prepTimeMinutes" | "nutritionalValues">;
  matchScore: number;
  matchLevel: RecipeMatchLevel;
  availableIngredients: number;
  missingIngredients: string[];
  usingExpiringIngredients: string[];
}

// Response DTO for AI recipe recommendations
interface AIRecipeRecommendationsResponse {
  recommendations: AIRecipeRecommendationDTO[];
  cacheUsed: boolean;
  generatedAt: string;
}

// Query parameters for AI recipe recommendations
interface AIRecipeRecommendationsQueryParams {
  meal_category?: Enums["meal_category"];
  max_missing_ingredients?: number;
  prioritize_expiring?: boolean;
  limit?: number;
}
```

### 5.2 New Types (create in `src/types/recommendations.ts`)

```typescript
import type { AIRecipeRecommendationDTO, RecipeMatchLevel, DatabaseEnums } from "@/types";

// =============================================================================
// FILTER STATE TYPES
// =============================================================================

/** Filter state for the recommendations view */
export interface RecommendationsFilterState {
  mealCategory: DatabaseEnums["meal_category"] | null;
  maxMissingIngredients: number;
  prioritizeExpiring: boolean;
  limit: number;
}

/** Default filter state */
export const DEFAULT_RECOMMENDATIONS_FILTER_STATE: RecommendationsFilterState = {
  mealCategory: null,
  maxMissingIngredients: 3,
  prioritizeExpiring: false,
  limit: 20,
};

// =============================================================================
// MATCH LEVEL TAB TYPES
// =============================================================================

/** Active tab type including "all" option */
export type MatchLevelTab = RecipeMatchLevel | "all";

/** Counts for each match level */
export interface MatchLevelCounts {
  all: number;
  idealny: number;
  "prawie idealny": number;
  "wymaga dokupienia": number;
}

// =============================================================================
// COMPONENT PROPS INTERFACES
// =============================================================================

/** Props for RecommendationsHeader */
export interface RecommendationsHeaderProps {
  totalCount: number;
  loading: boolean;
  cacheUsed: boolean;
  generatedAt: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  isRateLimited: boolean;
  rateLimitResetTime: number | null;
}

/** Props for RefreshRecommendationsButton */
export interface RefreshRecommendationsButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  isRateLimited: boolean;
  rateLimitResetTime: number | null;
  lastGeneratedAt: string | null;
}

/** Props for RecommendationsFilters */
export interface RecommendationsFiltersProps {
  filters: RecommendationsFilterState;
  onMealCategoryChange: (category: DatabaseEnums["meal_category"] | null) => void;
  onMaxMissingChange: (value: number) => void;
  onPrioritizeExpiringChange: (value: boolean) => void;
  onResetFilters: () => void;
  loading: boolean;
  activeFiltersCount: number;
}

/** Props for MatchLevelTabs */
export interface MatchLevelTabsProps {
  activeLevel: MatchLevelTab;
  counts: MatchLevelCounts;
  onChange: (level: MatchLevelTab) => void;
  disabled: boolean;
}

/** Props for RecommendedRecipeCard */
export interface RecommendedRecipeCardProps {
  recommendation: AIRecipeRecommendationDTO;
  onClick: (recipeId: string) => void;
}

/** Props for MatchScoreIndicator */
export interface MatchScoreIndicatorProps {
  score: number;
  matchLevel: RecipeMatchLevel;
}

/** Props for MissingIngredientsTag */
export interface MissingIngredientsTagProps {
  ingredients: string[];
  maxDisplay?: number;
}

/** Props for ExpiringIngredientsTag */
export interface ExpiringIngredientsTagProps {
  ingredients: string[];
}

/** Props for LoadingStateWithProgress */
export interface LoadingStateWithProgressProps {
  message?: string;
}

/** Props for RecommendationsEmptyState */
export interface RecommendationsEmptyStateProps {
  reason: "no-products" | "no-matches" | "filters-too-strict";
  onAction: () => void;
  hasActiveFilters: boolean;
}

/** Props for RateLimitWarning */
export interface RateLimitWarningProps {
  resetTime: number;
}

/** Props for RecommendationsGrid */
export interface RecommendationsGridProps {
  recommendations: AIRecipeRecommendationDTO[];
  onRecipeClick: (recipeId: string) => void;
}

// =============================================================================
// HOOK RETURN TYPE
// =============================================================================

/** Return type for useRecommendations hook */
export interface UseRecommendationsReturn {
  // Data
  recommendations: AIRecipeRecommendationDTO[];
  filteredRecommendations: AIRecipeRecommendationDTO[];

  // Loading states
  loading: boolean;
  isRefreshing: boolean;

  // Error handling
  error: string | null;

  // Cache info
  cacheUsed: boolean;
  generatedAt: string | null;

  // Rate limiting
  isRateLimited: boolean;
  rateLimitResetTime: number | null;

  // Filters
  filters: RecommendationsFilterState;
  activeMatchLevel: MatchLevelTab;
  matchLevelCounts: MatchLevelCounts;
  activeFiltersCount: number;
  hasActiveFilters: boolean;

  // Actions
  refresh: () => Promise<void>;
  setMealCategory: (category: DatabaseEnums["meal_category"] | null) => void;
  setMaxMissingIngredients: (value: number) => void;
  setPrioritizeExpiring: (value: boolean) => void;
  setActiveMatchLevel: (level: MatchLevelTab) => void;
  resetFilters: () => void;
  retry: () => void;
}

// =============================================================================
// UTILITY TYPES AND CONSTANTS
// =============================================================================

/** Match level configuration for styling */
export interface MatchLevelConfig {
  label: string;
  className: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

/** Match level styling configurations */
export const MATCH_LEVEL_CONFIG: Record<RecipeMatchLevel, MatchLevelConfig> = {
  "idealny": {
    label: "Idealny",
    className: "bg-green-100 text-green-800 border-green-200",
    bgColor: "bg-green-500",
    textColor: "text-green-800",
    borderColor: "border-green-200",
  },
  "prawie idealny": {
    label: "Prawie idealny",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    bgColor: "bg-yellow-500",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200",
  },
  "wymaga dokupienia": {
    label: "Wymaga dokupienia",
    className: "bg-red-100 text-red-800 border-red-200",
    bgColor: "bg-red-500",
    textColor: "text-red-800",
    borderColor: "border-red-200",
  },
};

/** Get match level configuration */
export const getMatchLevelConfig = (level: RecipeMatchLevel): MatchLevelConfig => {
  return MATCH_LEVEL_CONFIG[level];
};

/** Calculate match level counts from recommendations */
export const calculateMatchLevelCounts = (
  recommendations: AIRecipeRecommendationDTO[]
): MatchLevelCounts => {
  return {
    all: recommendations.length,
    idealny: recommendations.filter((r) => r.matchLevel === "idealny").length,
    "prawie idealny": recommendations.filter((r) => r.matchLevel === "prawie idealny").length,
    "wymaga dokupienia": recommendations.filter((r) => r.matchLevel === "wymaga dokupienia").length,
  };
};

/** Calculate active filters count */
export const calculateRecommendationsActiveFiltersCount = (
  filters: RecommendationsFilterState
): number => {
  let count = 0;
  if (filters.mealCategory !== null) count++;
  if (filters.maxMissingIngredients !== 3) count++; // 3 is default
  if (filters.prioritizeExpiring) count++;
  return count;
};
```

## 6. State Management

### 6.1 Custom Hook: `useRecommendations`

Create a custom hook at `src/hooks/useRecommendations.ts` that manages all state and API interactions for the recommendations view.

**State Variables:**

| State | Type | Purpose |
|-------|------|---------|
| `recommendations` | `AIRecipeRecommendationDTO[]` | Raw recommendations from API |
| `loading` | `boolean` | Initial loading state |
| `isRefreshing` | `boolean` | Manual refresh loading state |
| `error` | `string \| null` | Error message |
| `cacheUsed` | `boolean` | Whether cached results were used |
| `generatedAt` | `string \| null` | Timestamp of generation |
| `isRateLimited` | `boolean` | Rate limit status |
| `rateLimitResetTime` | `number \| null` | Rate limit reset timestamp |
| `filters` | `RecommendationsFilterState` | API query filters |
| `activeMatchLevel` | `MatchLevelTab` | Client-side tab filter |
| `refreshTrigger` | `number` | Trigger for manual refresh |

**Computed Values:**

| Computed | Type | Derivation |
|----------|------|------------|
| `filteredRecommendations` | `AIRecipeRecommendationDTO[]` | Filter by `activeMatchLevel` |
| `matchLevelCounts` | `MatchLevelCounts` | Count per match level |
| `activeFiltersCount` | `number` | Count of active filters |
| `hasActiveFilters` | `boolean` | `activeFiltersCount > 0` |

**Effects:**

1. **Initial Load Effect**: Fetch recommendations on mount
2. **Filter Change Effect**: Refetch when API filters change
3. **Rate Limit Timer Effect**: Countdown timer for rate limit reset

**Hook Implementation Outline:**

```typescript
export const useRecommendations = (): UseRecommendationsReturn => {
  // Core state
  const [recommendations, setRecommendations] = useState<AIRecipeRecommendationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheUsed, setCacheUsed] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<number | null>(null);

  // Filter state
  const [mealCategory, setMealCategory] = useState<DatabaseEnums["meal_category"] | null>(null);
  const [maxMissingIngredients, setMaxMissingIngredients] = useState(3);
  const [prioritizeExpiring, setPrioritizeExpiring] = useState(false);

  // Client-side tab filter
  const [activeMatchLevel, setActiveMatchLevel] = useState<MatchLevelTab>("all");

  // Fetch recommendations effect
  useEffect(() => {
    const fetchRecommendations = async () => {
      // ... implementation
    };
    fetchRecommendations();
  }, [mealCategory, maxMissingIngredients, prioritizeExpiring, refreshTrigger]);

  // Rate limit timer effect
  useEffect(() => {
    if (!rateLimitResetTime) return;
    const interval = setInterval(() => {
      if (Date.now() >= rateLimitResetTime) {
        setIsRateLimited(false);
        setRateLimitResetTime(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitResetTime]);

  // Computed values and handlers...

  return { /* ... */ };
};
```

## 7. API Integration

### 7.1 Endpoint Details

**Endpoint:** `GET /api/recipes/recommendations`

**Request:**
- Method: `GET`
- Headers:
  - `Authorization: Bearer {accessToken}`
  - `Content-Type: application/json`
- Query Parameters:
  - `meal_category` (optional): Filter by meal category
  - `max_missing_ingredients` (optional): Max missing ingredients (default: 3)
  - `prioritize_expiring` (optional): Prioritize expiring ingredients (default: false)
  - `limit` (optional): Number of recommendations (default: 10)

**Response (200 OK):**
```typescript
interface AIRecipeRecommendationsResponse {
  recommendations: AIRecipeRecommendationDTO[];
  cacheUsed: boolean;
  generatedAt: string; // ISO timestamp
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `429 Too Many Requests`: Rate limit exceeded (includes `Retry-After` header)
- `500 Internal Server Error`: AI processing error

### 7.2 API Integration Code

```typescript
const fetchRecommendations = async (
  filters: RecommendationsFilterState,
  accessToken: string
): Promise<AIRecipeRecommendationsResponse> => {
  const params = new URLSearchParams();

  if (filters.mealCategory) {
    params.append("meal_category", filters.mealCategory);
  }
  params.append("max_missing_ingredients", filters.maxMissingIngredients.toString());
  if (filters.prioritizeExpiring) {
    params.append("prioritize_expiring", "true");
  }
  params.append("limit", filters.limit.toString());

  const url = `/api/recipes/recommendations${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Sesja wygasla. Zaloguj sie ponownie.");
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const resetTime = retryAfter
        ? Date.now() + parseInt(retryAfter, 10) * 1000
        : Date.now() + 60000;
      throw new RateLimitError("Zbyt wiele zapytan. Sprobuj ponownie pozniej.", resetTime);
    }
    throw new Error(`Blad serwera: ${response.status}`);
  }

  return response.json();
};

// Custom error class for rate limiting
class RateLimitError extends Error {
  constructor(message: string, public resetTime: number) {
    super(message);
    this.name = "RateLimitError";
  }
}
```

## 8. User Interactions

### 8.1 Interaction Map

| Interaction | Component | Action | Result |
|-------------|-----------|--------|--------|
| Page load | `RecommendationsView` | Auto-fetch recommendations | Display recommendations or empty state |
| Click refresh button | `RefreshRecommendationsButton` | Call `refresh()` | Refetch recommendations, show loading |
| Change meal category | `RecommendationsFilters` | Update filter, refetch | New filtered recommendations |
| Adjust max missing slider | `RecommendationsFilters` | Update filter, refetch | New filtered recommendations |
| Toggle prioritize expiring | `RecommendationsFilters` | Update filter, refetch | New filtered recommendations |
| Click reset filters | `RecommendationsFilters` | Reset all filters, refetch | Default recommendations |
| Click match level tab | `MatchLevelTabs` | Update `activeMatchLevel` | Client-side filter change |
| Click recipe card | `RecommendedRecipeCard` | Navigate to `/recipes/{id}` | Recipe detail page |
| Keyboard Enter on card | `RecommendedRecipeCard` | Navigate to `/recipes/{id}` | Recipe detail page |
| Click CTA in empty state | `RecommendationsEmptyState` | Navigate or reset filters | Fridge page or cleared filters |

### 8.2 Interaction Details

**Refresh Button Behavior:**
1. User clicks refresh button
2. Button becomes disabled, icon spins
3. API call is made with current filters
4. On success: Update recommendations, show "fresh" indicator
5. On rate limit: Show rate limit warning, start countdown
6. On error: Show error message with retry option

**Tab Selection Behavior:**
1. User clicks a match level tab
2. Tab becomes active (highlighted)
3. Recommendations are filtered client-side (no API call)
4. Count badges update to show current filter context

**Recipe Card Click:**
1. User clicks anywhere on the card
2. Visual feedback (scale/shadow on click)
3. Navigate to `/recipes/{recipeId}`

## 9. Conditions and Validation

### 9.1 API Query Parameter Validation

| Parameter | Validation | Default | Error Handling |
|-----------|------------|---------|----------------|
| `meal_category` | Must be valid enum value | `null` (all) | Invalid values ignored |
| `max_missing_ingredients` | Integer 0-5 | `3` | Clamp to valid range |
| `prioritize_expiring` | Boolean | `false` | Parse as boolean |
| `limit` | Integer 1-50 | `10` | Clamp to valid range |

### 9.2 UI State Conditions

| Condition | UI Effect |
|-----------|-----------|
| `loading && !isRefreshing` | Show `LoadingStateWithProgress` |
| `isRefreshing` | Disable filters, show refresh animation |
| `isRateLimited` | Disable refresh, show `RateLimitWarning` |
| `error && !loading` | Show error state with retry button |
| `recommendations.length === 0 && !loading` | Show `RecommendationsEmptyState` |
| `filteredRecommendations.length === 0` | Show "no matches for this filter" message |
| `cacheUsed` | Show "cached" badge in header |

### 9.3 Component Validation

**MaxMissingIngredientsSlider:**
- Min: 0, Max: 5
- Step: 1
- Visual labels: "0 (tylko dostepne)" to "5 (do 5 brakujacych)"

**Rate Limit Timer:**
- Format: "Odczekaj {X}s" or "Odczekaj {X}m {Y}s"
- Updates every second
- Auto-clears when time expires

## 10. Error Handling

### 10.1 Error Scenarios

| Scenario | Detection | User Feedback | Recovery |
|----------|-----------|---------------|----------|
| Network error | `fetch` throws | "Blad polaczenia" message | Retry button |
| 401 Unauthorized | Response status | Redirect to login | Auto-redirect |
| 429 Rate Limited | Response status | Rate limit warning + timer | Wait for timer |
| 500 Server Error | Response status | "Blad serwera" message | Retry button |
| Empty fridge | Empty recommendations + no products | "Dodaj produkty" CTA | Link to fridge |
| No matching recipes | Empty recommendations | "Brak dopasowanych przepisow" | Suggest adjusting filters |
| AI processing timeout | Extended loading | "AI potrzebuje wiecej czasu" | Auto-retry |

### 10.2 Error State Component

Display a centered error card with:
- Red/warning styling
- Error icon
- Error message (user-friendly)
- Retry button
- Optional: link to support or help

```tsx
// Error state example
if (error && !loading) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <ExclamationCircleIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-red-800 mb-2">Wystapil blad</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={retry}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
      >
        Sprobuj ponownie
      </button>
    </div>
  );
}
```

### 10.3 Rate Limit Handling

```typescript
// In useRecommendations hook
const handleRateLimit = (resetTime: number) => {
  setIsRateLimited(true);
  setRateLimitResetTime(resetTime);
  setError(null); // Clear error, show rate limit UI instead
};

// In error catch block
if (err instanceof RateLimitError) {
  handleRateLimit(err.resetTime);
} else {
  setError(err.message);
}
```

## 11. Implementation Steps

### Step 1: Create Type Definitions
1. Create `src/types/recommendations.ts`
2. Add all interface definitions as specified in Section 5.2
3. Export types and utility functions

### Step 2: Create the Custom Hook
1. Create `src/hooks/useRecommendations.ts`
2. Implement state management for all required states
3. Implement `fetchRecommendations` function with proper error handling
4. Implement rate limit detection and timer
5. Add computed values (filtered recommendations, counts)
6. Add all action handlers
7. Return memoized object to prevent re-renders

### Step 3: Create Utility Components
1. Create `src/components/recommendations/MatchScoreIndicator.tsx`
2. Create `src/components/recommendations/MissingIngredientsTag.tsx`
3. Create `src/components/recommendations/ExpiringIngredientsTag.tsx`
4. Create `src/components/recommendations/RateLimitWarning.tsx`
5. Create `src/components/recommendations/LoadingStateWithProgress.tsx`

### Step 4: Create Filter Components
1. Create `src/components/recommendations/MatchLevelTabs.tsx`
2. Create `src/components/recommendations/MaxMissingIngredientsSlider.tsx`
3. Create `src/components/recommendations/PrioritizeExpiringToggle.tsx`
4. Create `src/components/recommendations/RecommendationsFilters.tsx`

### Step 5: Create Card and Grid Components
1. Create `src/components/recommendations/RecommendedRecipeCard.tsx`
2. Create `src/components/recommendations/RecommendationsGrid.tsx`
3. Create `src/components/recommendations/RecommendationsEmptyState.tsx`

### Step 6: Create Header Components
1. Create `src/components/recommendations/RefreshRecommendationsButton.tsx`
2. Create `src/components/recommendations/RecommendationsHeader.tsx`

### Step 7: Create Main View Component
1. Create `src/components/recommendations/RecommendationsView.tsx`
2. Wire up all child components with the hook
3. Implement conditional rendering for all states
4. Add proper error boundaries

### Step 8: Create Astro Page
1. Create `src/pages/recipes/recommendations.astro`
2. Use `AuthenticatedLayout`
3. Add `DemoModeIndicator` (conditional)
4. Mount `RecommendationsView` with `client:load`

### Step 9: API Endpoint (if not exists)
1. Create `src/pages/api/recipes/recommendations.ts`
2. Implement GET handler with query parameter parsing
3. Add authentication middleware
4. Add rate limiting middleware
5. Implement AI recommendation logic or mock response

### Step 10: Testing
1. Write unit tests for `useRecommendations` hook
2. Write component tests for key components
3. Write E2E tests for critical user flows:
   - Initial load and display
   - Filter interactions
   - Tab switching
   - Refresh functionality
   - Rate limit handling
   - Navigation to recipe detail

### Step 11: Polish and Accessibility
1. Add proper ARIA labels to all interactive elements
2. Ensure keyboard navigation works correctly
3. Test color contrast for match level indicators
4. Add focus management for modals and dialogs
5. Test responsive behavior on mobile devices

### Step 12: Final Review
1. Run ESLint and fix all issues (`npm run lint`)
2. Run all tests
3. Manual testing of all user flows
4. Performance review (check for unnecessary re-renders)
5. Accessibility audit
