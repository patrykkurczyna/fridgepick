import type { RecipeDTO, DatabaseEnums } from "@/types";

// =============================================================================
// TYPE ALIASES FOR ENUMS
// =============================================================================

/** Meal category type from database enums */
export type MealCategory = DatabaseEnums["meal_category"];

/** Protein type from database enums */
export type ProteinType = DatabaseEnums["protein_type"];

// =============================================================================
// FILTER STATE TYPES
// =============================================================================

/** Filter state for the recipes view */
export interface RecipesFiltersState {
  searchQuery: string;
  mealCategory: MealCategory | null;
  proteinType: ProteinType | null;
}

/** Default filter state */
export const DEFAULT_FILTERS_STATE: RecipesFiltersState = {
  searchQuery: "",
  mealCategory: null,
  proteinType: null,
};

// =============================================================================
// PAGINATION STATE TYPES
// =============================================================================

/** Pagination state for the recipes view */
export interface RecipesPaginationState {
  currentPage: number;
  totalPages: number;
  limit: number;
  total: number;
  offset: number;
}

/** Default pagination state */
export const DEFAULT_PAGINATION_STATE: RecipesPaginationState = {
  currentPage: 1,
  totalPages: 1,
  limit: 20,
  total: 0,
  offset: 0,
};

// =============================================================================
// VIEW STATE TYPES
// =============================================================================

/** Combined view state for recipes */
export interface RecipesViewState {
  recipes: RecipeDTO[];
  loading: boolean;
  isSearching: boolean;
  error: string | null;
  filters: RecipesFiltersState;
  pagination: RecipesPaginationState;
}

// =============================================================================
// COMPONENT PROPS INTERFACES
// =============================================================================

/** Props for RecipesHeader component */
export interface RecipesHeaderProps {
  totalCount: number;
  loading: boolean;
}

/** Props for RecipesFilters component */
export interface RecipesFiltersProps {
  filters: RecipesFiltersState;
  onSearchChange: (query: string) => void;
  onMealCategoryChange: (category: MealCategory | null) => void;
  onProteinTypeChange: (type: ProteinType | null) => void;
  onResetFilters: () => void;
  loading: boolean;
  activeFiltersCount: number;
}

/** Props for MealCategoryFilter component */
export interface MealCategoryFilterProps {
  value: MealCategory | null;
  onChange: (category: MealCategory | null) => void;
  disabled?: boolean;
}

/** Props for ProteinTypeFilter component */
export interface ProteinTypeFilterProps {
  value: ProteinType | null;
  onChange: (type: ProteinType | null) => void;
  disabled?: boolean;
}

/** Props for RecipesGrid component */
export interface RecipesGridProps {
  recipes: RecipeDTO[];
  loading: boolean;
  isSearching: boolean;
  onRecipeClick: (recipeId: string) => void;
}

/** Props for RecipeCard component */
export interface RecipeCardProps {
  recipe: RecipeDTO;
  onClick: (id: string) => void;
}

/** Props for RecipesEmptyState component */
export interface RecipesEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  searchQuery?: string;
}

/** Props for RecipesLoadingSkeleton component */
export interface RecipesLoadingSkeletonProps {
  count?: number;
}

// =============================================================================
// FILTER OPTIONS CONFIGURATION
// =============================================================================

/** Generic filter option type */
export interface FilterOption<T> {
  value: T | null;
  label: string;
}

/** Meal category filter options */
export const MEAL_CATEGORY_OPTIONS: FilterOption<MealCategory>[] = [
  { value: null, label: "Wszystkie" },
  { value: "śniadanie", label: "Śniadanie" },
  { value: "obiad", label: "Obiad" },
  { value: "kolacja", label: "Kolacja" },
  { value: "przekąska", label: "Przekąska" },
];

/** Protein type filter options */
export const PROTEIN_TYPE_OPTIONS: FilterOption<ProteinType>[] = [
  { value: null, label: "Wszystkie" },
  { value: "ryba", label: "Ryba" },
  { value: "drób", label: "Drób" },
  { value: "czerwone mięso", label: "Czerwone mięso" },
  { value: "vege", label: "Vege" },
];

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/** Search validation result type */
export interface SearchValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

/** Validate and sanitize search query */
export const validateRecipeSearchQuery = (query: string): SearchValidationResult => {
  const trimmed = query.trim();

  // Max length 100 characters
  if (trimmed.length > 100) {
    return {
      isValid: false,
      sanitized: trimmed.substring(0, 100),
      error: "Maksymalna długość wyszukiwania to 100 znaków",
    };
  }

  // Basic sanitization - remove special chars except spaces, letters, numbers, Polish characters
  const sanitized = trimmed.replace(/[^\w\s\u00C0-\u017F-]/g, "");

  return { isValid: true, sanitized };
};

/** Validate meal category value */
export const validateMealCategory = (value: string | null): value is MealCategory | null => {
  if (value === null) return true;
  return ["śniadanie", "obiad", "kolacja", "przekąska"].includes(value);
};

/** Validate protein type value */
export const validateProteinType = (value: string | null): value is ProteinType | null => {
  if (value === null) return true;
  return ["ryba", "drób", "czerwone mięso", "vege"].includes(value);
};

/** Calculate active filters count */
export const calculateActiveFiltersCount = (filters: RecipesFiltersState): number => {
  let count = 0;
  if (filters.searchQuery.trim().length >= 2) count++;
  if (filters.mealCategory !== null) count++;
  if (filters.proteinType !== null) count++;
  return count;
};

// =============================================================================
// API TYPES
// =============================================================================

/** Parameters for fetching recipes API */
export interface FetchRecipesParams {
  search?: string;
  mealCategory?: MealCategory | null;
  proteinType?: ProteinType | null;
  limit?: number;
  offset?: number;
}

/** Badge styling configuration */
export interface BadgeConfig {
  label: string;
  className: string;
}

/** Get meal category badge configuration */
export const getMealCategoryBadge = (category: MealCategory): BadgeConfig => {
  const configs: Record<MealCategory, BadgeConfig> = {
    śniadanie: { label: "Śniadanie", className: "bg-yellow-100 text-yellow-800" },
    obiad: { label: "Obiad", className: "bg-orange-100 text-orange-800" },
    kolacja: { label: "Kolacja", className: "bg-purple-100 text-purple-800" },
    przekąska: { label: "Przekąska", className: "bg-green-100 text-green-800" },
  };
  return configs[category];
};

/** Get protein type badge configuration */
export const getProteinTypeBadge = (type: ProteinType): BadgeConfig => {
  const configs: Record<ProteinType, BadgeConfig> = {
    ryba: { label: "Ryba", className: "bg-blue-100 text-blue-800" },
    drób: { label: "Drób", className: "bg-amber-100 text-amber-800" },
    "czerwone mięso": { label: "Czerwone mięso", className: "bg-red-100 text-red-800" },
    vege: { label: "Vege", className: "bg-emerald-100 text-emerald-800" },
  };
  return configs[type];
};
