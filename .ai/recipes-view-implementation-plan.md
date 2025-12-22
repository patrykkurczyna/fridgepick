# View Implementation Plan: Recipes Browsing

## 1. Overview

The Recipes browsing view (`/recipes`) allows users to explore and discover available recipes in the application. It provides a grid-based display of recipe cards with search functionality, filtering capabilities (by meal category and protein type), and pagination. The view also includes a link to AI-powered recipe recommendations. This view addresses user stories US-009, US-010, and US-018 from the PRD.

## 2. View Routing

- **Path:** `/recipes`
- **File Location:** `src/pages/recipes/index.astro`
- **Authentication:** Required (JWT token via `requireDemoFriendlyAuth`)
- **Layout:** Uses main application layout with navigation

## 3. Component Structure

```
RecipesPage (Astro page)
└── RecipesView (React component - main container)
    ├── RecipesHeader
    │   ├── Page title
    │   └── RecommendationsButton (link to AI matching)
    ├── RecipesFilters
    │   ├── SearchBar (reusable from fridge)
    │   ├── MealCategoryFilter (dropdown/pills)
    │   ├── ProteinTypeFilter (dropdown/pills)
    │   └── ResetFiltersButton
    ├── RecipesGrid
    │   ├── LoadingSkeleton (during loading)
    │   ├── EmptyState (no results)
    │   └── RecipeCard[] (grid of recipes)
    └── PaginationControls
        └── Pagination (reusable from fridge)
```

## 4. Component Details

### 4.1 RecipesView

- **Description:** Main container component that orchestrates the recipes browsing experience. Manages state through `useRecipes` hook, handles user interactions, and coordinates child components.
- **Main elements:**
  - `<div>` container with responsive padding
  - `RecipesHeader` component
  - `RecipesFilters` component
  - `RecipesGrid` component
  - `PaginationControls` component
- **Handled interactions:**
  - Filter changes (meal category, protein type)
  - Search query changes
  - Pagination navigation
  - Recipe card click (navigation to detail)
- **Handled validation:**
  - Ensures filter values are valid enum values
  - Validates pagination bounds
- **Types:** `RecipesViewProps`, `RecipesFiltersState`
- **Props:** None (top-level container)

### 4.2 RecipesHeader

- **Description:** Header section with page title and navigation to AI recommendations feature.
- **Main elements:**
  - `<header>` with flex layout
  - `<h1>` page title "Przepisy"
  - `<div>` with recipe count badge
  - `RecommendationsButton` component
- **Handled interactions:**
  - Click on RecommendationsButton (navigation to `/recipes/recommendations`)
- **Handled validation:** None
- **Types:** `RecipesHeaderProps`
- **Props:**
  - `totalCount: number` - total number of recipes
  - `loading: boolean` - loading state

### 4.3 RecommendationsButton

- **Description:** CTA button linking to the AI recipe matching feature.
- **Main elements:**
  - `<a>` or `<button>` styled as primary action
  - Icon (e.g., SparklesIcon from Heroicons)
  - Text "Dopasuj przepisy AI"
- **Handled interactions:**
  - Click - navigates to `/recipes/recommendations`
- **Handled validation:** None
- **Types:** None (stateless)
- **Props:**
  - `href?: string` - optional override for destination

### 4.4 RecipesFilters

- **Description:** Filter panel containing search input and filter controls for meal category and protein type.
- **Main elements:**
  - `<div>` container with responsive grid/flex layout
  - `SearchBar` component (reused from fridge)
  - `MealCategoryFilter` dropdown or pill buttons
  - `ProteinTypeFilter` dropdown or pill buttons
  - `ResetFiltersButton` button (shown when filters active)
  - Active filter count indicator
- **Handled interactions:**
  - Search input changes (debounced)
  - Meal category selection
  - Protein type selection
  - Reset all filters click
- **Handled validation:**
  - Search query: min 2 characters, max 100 characters, sanitized
  - Meal category: must be valid `meal_category` enum value or null
  - Protein type: must be valid `protein_type` enum value or null
- **Types:** `RecipesFiltersProps`, `RecipesFiltersState`
- **Props:**
  - `filters: RecipesFiltersState`
  - `onSearchChange: (query: string) => void`
  - `onMealCategoryChange: (category: MealCategory | null) => void`
  - `onProteinTypeChange: (type: ProteinType | null) => void`
  - `onResetFilters: () => void`
  - `loading: boolean`
  - `activeFiltersCount: number`

### 4.5 MealCategoryFilter

- **Description:** Filter control for selecting meal category (breakfast, lunch, dinner, snack).
- **Main elements:**
  - `<div>` with label
  - `<select>` dropdown or `<button>` pill group
  - Options: "Wszystkie", "Śniadanie", "Obiad", "Kolacja", "Przekąska"
- **Handled interactions:**
  - Selection change - calls `onChange`
- **Handled validation:**
  - Value must be one of: null | "śniadanie" | "obiad" | "kolacja" | "przekąska"
- **Types:** `MealCategoryFilterProps`
- **Props:**
  - `value: MealCategory | null`
  - `onChange: (category: MealCategory | null) => void`
  - `disabled?: boolean`

### 4.6 ProteinTypeFilter

- **Description:** Filter control for selecting protein type.
- **Main elements:**
  - `<div>` with label
  - `<select>` dropdown or `<button>` pill group
  - Options: "Wszystkie", "Ryba", "Drób", "Czerwone mięso", "Vege"
- **Handled interactions:**
  - Selection change - calls `onChange`
- **Handled validation:**
  - Value must be one of: null | "ryba" | "drób" | "czerwone mięso" | "vege"
- **Types:** `ProteinTypeFilterProps`
- **Props:**
  - `value: ProteinType | null`
  - `onChange: (type: ProteinType | null) => void`
  - `disabled?: boolean`

### 4.7 RecipesGrid

- **Description:** Grid container displaying recipe cards with responsive layout, loading skeleton, and empty state.
- **Main elements:**
  - `<div>` with CSS Grid layout (responsive columns)
  - `LoadingSkeleton` when loading
  - `EmptyState` when no recipes match filters
  - Map of `RecipeCard` components
- **Handled interactions:**
  - None directly (delegated to RecipeCard)
- **Handled validation:** None
- **Types:** `RecipesGridProps`
- **Props:**
  - `recipes: RecipeDTO[]`
  - `loading: boolean`
  - `isSearching: boolean`
  - `onRecipeClick: (recipeId: string) => void`

### 4.8 RecipeCard

- **Description:** Individual recipe card displaying recipe summary with image, name, category, prep time, and nutritional info.
- **Main elements:**
  - `<article>` as card container
  - `<img>` recipe image with lazy loading (with fallback placeholder)
  - `<h3>` recipe name
  - `<span>` meal category badge
  - `<span>` protein type badge
  - `<div>` prep time display (clock icon + minutes)
  - `<div>` calories display (if available)
  - `<div>` servings count
- **Handled interactions:**
  - Click on card - triggers `onClick` with recipe ID
  - Keyboard navigation (Enter/Space to select)
- **Handled validation:**
  - Image URL validation for safe loading
- **Types:** `RecipeCardProps`
- **Props:**
  - `recipe: RecipeDTO`
  - `onClick: (id: string) => void`

### 4.9 RecipesEmptyState

- **Description:** Empty state component shown when no recipes match current filters.
- **Main elements:**
  - `<div>` centered container
  - Icon (e.g., DocumentMagnifyingGlassIcon)
  - `<h3>` "Nie znaleziono przepisów"
  - `<p>` contextual message based on active filters
  - `<button>` "Wyczyść filtry" (if filters active)
- **Handled interactions:**
  - Click on clear filters button
- **Handled validation:** None
- **Types:** `RecipesEmptyStateProps`
- **Props:**
  - `hasActiveFilters: boolean`
  - `onClearFilters: () => void`
  - `searchQuery?: string`

### 4.10 RecipesLoadingSkeleton

- **Description:** Loading placeholder displaying skeleton cards while recipes are being fetched.
- **Main elements:**
  - Grid of skeleton card placeholders (6-12 items)
  - Each skeleton: animated gray boxes for image, title, badges
- **Handled interactions:** None
- **Handled validation:** None
- **Types:** `RecipesLoadingSkeletonProps`
- **Props:**
  - `count?: number` (default: 8)

### 4.11 PaginationControls

- **Description:** Wrapper component for pagination, adapts the reusable Pagination component.
- **Main elements:**
  - Reuses `Pagination` component from `@/components/fridge/Pagination`
- **Handled interactions:**
  - Page change - triggers `onPageChange`
- **Handled validation:**
  - Page number bounds (1 to totalPages)
- **Types:** Reuses `PaginationProps`
- **Props:**
  - `currentPage: number`
  - `totalPages: number`
  - `totalItems: number`
  - `onPageChange: (page: number) => void`

## 5. Types

### 5.1 Existing Types (from `src/types.ts`)

```typescript
// Recipe DTOs
interface RecipeDTO {
  id: string;
  name: string;
  description: string | null;
  mealCategory: "śniadanie" | "obiad" | "kolacja" | "przekąska";
  proteinType: "ryba" | "drób" | "czerwone mięso" | "vege";
  prepTimeMinutes: number;
  servings: number;
  nutritionalValues: NutritionalValuesDTO | null;
  imageUrl: string | null;
  createdAt: string;
}

interface NutritionalValuesDTO {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

interface RecipesResponse {
  recipes: RecipeDTO[];
  pagination: PaginationDTO;
}

interface PaginationDTO {
  total: number;
  limit: number;
  offset: number;
}

interface RecipesQueryParams extends ListQueryParams {
  search?: string;
  meal_category?: "śniadanie" | "obiad" | "kolacja" | "przekąska";
  protein_type?: "ryba" | "drób" | "czerwone mięso" | "vege";
  max_prep_time?: number;
  available_ingredients?: boolean;
}
```

### 5.2 New View-Specific Types (create in `src/types/recipes.ts`)

```typescript
// Type aliases for enums
type MealCategory = "śniadanie" | "obiad" | "kolacja" | "przekąska";
type ProteinType = "ryba" | "drób" | "czerwone mięso" | "vege";

// Filter state for the view
interface RecipesFiltersState {
  searchQuery: string;
  mealCategory: MealCategory | null;
  proteinType: ProteinType | null;
}

// Pagination state for the view
interface RecipesPaginationState {
  currentPage: number;
  totalPages: number;
  limit: number;
  total: number;
  offset: number;
}

// Combined view state
interface RecipesViewState {
  recipes: RecipeDTO[];
  loading: boolean;
  isSearching: boolean;
  error: string | null;
  filters: RecipesFiltersState;
  pagination: RecipesPaginationState;
}

// Component Props interfaces
interface RecipesHeaderProps {
  totalCount: number;
  loading: boolean;
}

interface RecipesFiltersProps {
  filters: RecipesFiltersState;
  onSearchChange: (query: string) => void;
  onMealCategoryChange: (category: MealCategory | null) => void;
  onProteinTypeChange: (type: ProteinType | null) => void;
  onResetFilters: () => void;
  loading: boolean;
  activeFiltersCount: number;
}

interface MealCategoryFilterProps {
  value: MealCategory | null;
  onChange: (category: MealCategory | null) => void;
  disabled?: boolean;
}

interface ProteinTypeFilterProps {
  value: ProteinType | null;
  onChange: (type: ProteinType | null) => void;
  disabled?: boolean;
}

interface RecipesGridProps {
  recipes: RecipeDTO[];
  loading: boolean;
  isSearching: boolean;
  onRecipeClick: (recipeId: string) => void;
}

interface RecipeCardProps {
  recipe: RecipeDTO;
  onClick: (id: string) => void;
}

interface RecipesEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  searchQuery?: string;
}

interface RecipesLoadingSkeletonProps {
  count?: number;
}

// Validation helpers
interface SearchValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

// Filter option configuration
interface FilterOption<T> {
  value: T | null;
  label: string;
}

const MEAL_CATEGORY_OPTIONS: FilterOption<MealCategory>[] = [
  { value: null, label: "Wszystkie" },
  { value: "śniadanie", label: "Śniadanie" },
  { value: "obiad", label: "Obiad" },
  { value: "kolacja", label: "Kolacja" },
  { value: "przekąska", label: "Przekąska" },
];

const PROTEIN_TYPE_OPTIONS: FilterOption<ProteinType>[] = [
  { value: null, label: "Wszystkie" },
  { value: "ryba", label: "Ryba" },
  { value: "drób", label: "Drób" },
  { value: "czerwone mięso", label: "Czerwone mięso" },
  { value: "vege", label: "Vege" },
];
```

## 6. State Management

### 6.1 Custom Hook: `useRecipes`

Create a custom hook `src/hooks/useRecipes.ts` to manage recipes state and API interactions.

```typescript
interface UseRecipesReturn {
  // State
  recipes: RecipeDTO[];
  loading: boolean;
  isSearching: boolean;
  error: string | null;
  filters: RecipesFiltersState;
  pagination: RecipesPaginationState;

  // Computed
  activeFiltersCount: number;
  hasActiveFilters: boolean;

  // Actions
  handleSearch: (query: string) => void;
  handleMealCategoryChange: (category: MealCategory | null) => void;
  handleProteinTypeChange: (type: ProteinType | null) => void;
  handlePageChange: (page: number) => void;
  handleResetFilters: () => void;
  retry: () => void;
  refresh: () => void;
}
```

**Hook Implementation Details:**

1. **State Variables:**
   - `recipes: RecipeDTO[]` - array of fetched recipes
   - `loading: boolean` - initial loading state
   - `isSearching: boolean` - searching/filtering loading state
   - `error: string | null` - error message
   - `filters: RecipesFiltersState` - current filter values
   - `currentPage: number` - current pagination page
   - `debouncedSearch: string` - debounced search query

2. **Effects:**
   - Debounce search query (300ms delay)
   - Fetch recipes when filters, pagination, or refresh trigger changes
   - Reset to page 1 when filters change

3. **Memoization:**
   - Memoize filter state object
   - Memoize pagination state object
   - Memoize return object to prevent re-renders

### 6.2 URL State Synchronization (Optional Enhancement)

Consider synchronizing filter state with URL query parameters for shareable/bookmarkable filtered views:
- `?search=omlet&category=śniadanie&protein=vege&page=2`

## 7. API Integration

### 7.1 Endpoint: GET /api/recipes

**Implementation Status:** Not yet implemented - needs to be created following the pattern from `src/pages/api/user-products.ts`

**Request:**
```typescript
// Query parameters
interface RecipesQueryParams {
  search?: string;           // Search in recipe names
  meal_category?: string;    // Filter by meal category
  protein_type?: string;     // Filter by protein type
  max_prep_time?: number;    // Max preparation time in minutes
  available_ingredients?: boolean; // Show only recipes user can make
  sort?: string;             // Sort by: name, prep_time, created_at
  limit?: number;            // Pagination limit (default: 20)
  offset?: number;           // Pagination offset
}

// Headers
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200):**
```typescript
interface RecipesResponse {
  recipes: RecipeDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

**Error Responses:**
- 400 - Invalid query parameters
- 401 - Unauthorized (missing/invalid token)
- 429 - Rate limit exceeded
- 500 - Internal server error

### 7.2 API Service Function

Create `src/services/recipesApi.ts`:

```typescript
interface FetchRecipesParams {
  search?: string;
  mealCategory?: MealCategory | null;
  proteinType?: ProteinType | null;
  limit?: number;
  offset?: number;
}

async function fetchRecipes(
  params: FetchRecipesParams,
  token: string
): Promise<RecipesResponse> {
  const searchParams = new URLSearchParams();

  if (params.search && params.search.trim().length >= 2) {
    searchParams.append("search", params.search.trim());
  }
  if (params.mealCategory) {
    searchParams.append("meal_category", params.mealCategory);
  }
  if (params.proteinType) {
    searchParams.append("protein_type", params.proteinType);
  }
  if (params.limit) {
    searchParams.append("limit", params.limit.toString());
  }
  if (params.offset) {
    searchParams.append("offset", params.offset.toString());
  }

  const url = `/api/recipes${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

## 8. User Interactions

### 8.1 Search Recipes
1. User types in search input
2. Input is debounced (300ms)
3. Minimum 2 characters required for search
4. API call with search query
5. Grid updates with filtered results
6. Pagination resets to page 1
7. Active filter count updates

### 8.2 Filter by Meal Category
1. User clicks meal category dropdown/pills
2. Selects a category or "Wszystkie"
3. API call with new filter
4. Grid updates with filtered results
5. Pagination resets to page 1
6. Active filter count updates

### 8.3 Filter by Protein Type
1. User clicks protein type dropdown/pills
2. Selects a type or "Wszystkie"
3. API call with new filter
4. Grid updates with filtered results
5. Pagination resets to page 1
6. Active filter count updates

### 8.4 Reset Filters
1. User clicks "Wyczyść filtry" button
2. All filters reset to default values
3. Search query cleared
4. API call for unfiltered recipes
5. Grid shows all recipes
6. Pagination resets to page 1

### 8.5 Navigate Pages
1. User clicks page number or next/previous
2. API call with new offset
3. Grid updates with new page of results
4. Scroll to top of grid (smooth scroll)

### 8.6 View Recipe Details
1. User clicks on recipe card
2. Navigation to `/recipes/{recipeId}`
3. Recipe detail view loads

### 8.7 Access AI Recommendations
1. User clicks "Dopasuj przepisy AI" button
2. Navigation to `/recipes/recommendations`
3. AI recommendation view loads

### 8.8 Keyboard Navigation
1. Tab through filter controls and recipe cards
2. Enter/Space to activate focused element
3. Escape to clear search input
4. Arrow keys for pagination (optional)

## 9. Conditions and Validation

### 9.1 Search Query Validation
- **Component:** RecipesFilters > SearchBar
- **Conditions:**
  - Minimum length: 2 characters (triggers search only when met)
  - Maximum length: 100 characters
  - Sanitization: trim whitespace, prevent XSS
- **Effect:** Queries under 2 chars show all recipes, valid queries filter results

### 9.2 Meal Category Validation
- **Component:** MealCategoryFilter
- **Conditions:**
  - Value must be null or one of: "śniadanie", "obiad", "kolacja", "przekąska"
- **Effect:** Invalid values are ignored, filter defaults to "all"

### 9.3 Protein Type Validation
- **Component:** ProteinTypeFilter
- **Conditions:**
  - Value must be null or one of: "ryba", "drób", "czerwone mięso", "vege"
- **Effect:** Invalid values are ignored, filter defaults to "all"

### 9.4 Pagination Validation
- **Component:** PaginationControls
- **Conditions:**
  - Page number: 1 <= page <= totalPages
  - Limit: positive integer (default 20)
  - Offset: non-negative integer
- **Effect:** Out-of-bounds pages are normalized to valid range

### 9.5 Image URL Validation
- **Component:** RecipeCard
- **Conditions:**
  - URL must be valid HTTPS URL or null
  - Fallback placeholder for invalid/missing images
- **Effect:** Invalid URLs show placeholder image

## 10. Error Handling

### 10.1 Network Errors
- **Scenario:** API request fails due to network issues
- **Handling:**
  - Show error message in dedicated error component
  - Display "Spróbuj ponownie" retry button
  - Preserve current filter state for retry
  - Log error for debugging

### 10.2 Authentication Errors (401)
- **Scenario:** JWT token expired or invalid
- **Handling:**
  - Clear local auth state
  - Redirect to login page with return URL
  - Show brief error toast (optional)

### 10.3 Rate Limit Errors (429)
- **Scenario:** User exceeds API rate limit
- **Handling:**
  - Show user-friendly message about rate limiting
  - Display retry timer if available from headers
  - Disable search/filter inputs temporarily

### 10.4 Server Errors (500)
- **Scenario:** Internal server error
- **Handling:**
  - Show generic error message
  - Provide retry button
  - Log error details for debugging

### 10.5 Empty Results
- **Scenario:** No recipes match current filters
- **Handling:**
  - Show EmptyState component
  - Explain why no results (based on active filters)
  - Provide "Wyczyść filtry" button if filters active

### 10.6 Image Loading Errors
- **Scenario:** Recipe image fails to load
- **Handling:**
  - Show placeholder image
  - Use CSS background color as fallback
  - No error propagation (silent failure)

### 10.7 Malformed API Response
- **Scenario:** API returns unexpected data structure
- **Handling:**
  - Validate response structure
  - Show generic error message
  - Log details for debugging

## 11. Implementation Steps

### Phase 1: API Endpoint (Backend)
1. Create `src/pages/api/recipes.ts` endpoint
2. Create `src/pages/api/recipes/[id].ts` for single recipe (needed for detail view)
3. Create `RecipeRepository.ts` following UserProductRepository pattern
4. Create `RecipeService.ts` with query building and business logic
5. Add request validation using Zod schemas
6. Implement filtering, search, sorting, and pagination
7. Add rate limiting and authentication middleware
8. Write unit tests for repository and service

### Phase 2: Types and Utilities
1. Create `src/types/recipes.ts` with view-specific types
2. Add validation helpers for search query and filter values
3. Export filter option constants

### Phase 3: Custom Hook
1. Create `src/hooks/useRecipes.ts`
2. Implement state management with useState
3. Add debounced search effect
4. Implement API fetching effect
5. Add memoized return values
6. Handle error states

### Phase 4: Base Components
1. Create `src/components/recipes/` directory
2. Implement `RecipesLoadingSkeleton.tsx`
3. Implement `RecipesEmptyState.tsx`
4. Implement `RecipeCard.tsx`

### Phase 5: Filter Components
1. Implement `MealCategoryFilter.tsx`
2. Implement `ProteinTypeFilter.tsx`
3. Implement `RecipesFilters.tsx` (combines search + filters)

### Phase 6: Container Components
1. Implement `RecipesHeader.tsx` with RecommendationsButton
2. Implement `RecipesGrid.tsx`
3. Implement `RecipesView.tsx` (main container)

### Phase 7: Page Setup
1. Create `src/pages/recipes/index.astro`
2. Import and render RecipesView component
3. Add page metadata and layout

### Phase 8: Testing
1. Write unit tests for useRecipes hook
2. Write component tests for RecipeCard
3. Write component tests for RecipesFilters
4. Write integration tests for RecipesView
5. Write E2E tests for critical user flows

### Phase 9: Polish and Optimization
1. Add keyboard navigation support
2. Implement lazy loading for recipe images
3. Add loading transitions and animations
4. Optimize re-renders with React.memo
5. Add aria-labels for accessibility
6. Test responsiveness on different screen sizes

### Phase 10: Validation and QA
1. Run ESLint and fix all errors
2. Verify TypeScript strict mode compliance
3. Test all user flows manually
4. Verify error handling scenarios
5. Test edge cases (empty data, long text, etc.)
6. Performance testing with large recipe sets
