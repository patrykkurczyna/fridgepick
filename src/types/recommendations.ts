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
  idealny: {
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
export const calculateMatchLevelCounts = (recommendations: AIRecipeRecommendationDTO[]): MatchLevelCounts => {
  return {
    all: recommendations.length,
    idealny: recommendations.filter((r) => r.matchLevel === "idealny").length,
    "prawie idealny": recommendations.filter((r) => r.matchLevel === "prawie idealny").length,
    "wymaga dokupienia": recommendations.filter((r) => r.matchLevel === "wymaga dokupienia").length,
  };
};

/** Calculate active filters count */
export const calculateRecommendationsActiveFiltersCount = (filters: RecommendationsFilterState): number => {
  let count = 0;
  if (filters.mealCategory !== null) count++;
  if (filters.maxMissingIngredients !== 3) count++; // 3 is default
  if (filters.prioritizeExpiring) count++;
  return count;
};

/** Filter recommendations by match level */
export const filterRecommendationsByMatchLevel = (
  recommendations: AIRecipeRecommendationDTO[],
  level: MatchLevelTab
): AIRecipeRecommendationDTO[] => {
  if (level === "all") {
    return recommendations;
  }
  return recommendations.filter((r) => r.matchLevel === level);
};
