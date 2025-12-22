import { useState, useEffect, useCallback, useMemo } from "react";
import type { AIRecipeRecommendationDTO, AIRecipeRecommendationsResponse, DatabaseEnums } from "@/types";
import type {
  UseRecommendationsReturn,
  RecommendationsFilterState,
  MatchLevelTab,
  MatchLevelCounts,
} from "@/types/recommendations";
import {
  DEFAULT_RECOMMENDATIONS_FILTER_STATE,
  calculateMatchLevelCounts,
  calculateRecommendationsActiveFiltersCount,
  filterRecommendationsByMatchLevel,
} from "@/types/recommendations";
import { getAccessToken } from "@/hooks/useAuth";

/** Custom error class for rate limiting */
class RateLimitError extends Error {
  constructor(
    message: string,
    public resetTime: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Custom hook for managing AI recommendations state and API interactions
 * Handles filtering, rate limiting, and data fetching
 */
export const useRecommendations = (): UseRecommendationsReturn => {
  // Core state
  const [recommendations, setRecommendations] = useState<AIRecipeRecommendationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheUsed, setCacheUsed] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<number | null>(null);

  // Filter state
  const [mealCategory, setMealCategory] = useState<DatabaseEnums["meal_category"] | null>(
    DEFAULT_RECOMMENDATIONS_FILTER_STATE.mealCategory
  );
  const [maxMissingIngredients, setMaxMissingIngredients] = useState(
    DEFAULT_RECOMMENDATIONS_FILTER_STATE.maxMissingIngredients
  );
  const [prioritizeExpiring, setPrioritizeExpiring] = useState(DEFAULT_RECOMMENDATIONS_FILTER_STATE.prioritizeExpiring);
  const [limit] = useState(DEFAULT_RECOMMENDATIONS_FILTER_STATE.limit);

  // Client-side tab filter
  const [activeMatchLevel, setActiveMatchLevel] = useState<MatchLevelTab>("all");

  /**
   * Fetch recommendations from API
   */
  const fetchRecommendations = useCallback(
    async (isManualRefresh = false) => {
      try {
        const jwtToken = getAccessToken();
        if (!jwtToken) {
          console.warn("No access token available, skipping fetch");
          setRecommendations([]);
          setLoading(false);
          setIsRefreshing(false);
          return;
        }

        // Determine loading state type
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else if (isInitialLoad) {
          setLoading(true);
        }

        // Build query parameters
        const params = new URLSearchParams();

        if (mealCategory) {
          params.append("meal_category", mealCategory);
        }
        params.append("max_missing_ingredients", maxMissingIngredients.toString());
        if (prioritizeExpiring) {
          params.append("prioritize_expiring", "true");
        }
        params.append("limit", limit.toString());

        const url = `/api/recipes/recommendations${params.toString() ? `?${params.toString()}` : ""}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Sesja wygasla. Zaloguj sie ponownie.");
          }
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After");
            const resetTime = retryAfter ? Date.now() + parseInt(retryAfter, 10) * 1000 : Date.now() + 60000;
            throw new RateLimitError("Zbyt wiele zapytan. Sprobuj ponownie pozniej.", resetTime);
          }
          throw new Error(`Blad serwera: ${response.status}`);
        }

        const data: AIRecipeRecommendationsResponse = await response.json();

        setRecommendations(data.recommendations);
        setCacheUsed(data.cacheUsed);
        setGeneratedAt(data.generatedAt);
        setError(null);
        setIsRateLimited(false);
        setRateLimitResetTime(null);
        setLoading(false);
        setIsRefreshing(false);
        setIsInitialLoad(false);
      } catch (err) {
        if (err instanceof RateLimitError) {
          setIsRateLimited(true);
          setRateLimitResetTime(err.resetTime);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : "Nie udalo sie zaladowac rekomendacji");
        }
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [mealCategory, maxMissingIngredients, prioritizeExpiring, limit, isInitialLoad]
  );

  // Fetch recommendations on mount and when API filters change
  useEffect(() => {
    fetchRecommendations(false);
  }, [fetchRecommendations, refreshTrigger]);

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

  // Handlers
  const handleSetMealCategory = useCallback((category: DatabaseEnums["meal_category"] | null) => {
    setMealCategory(category);
    setActiveMatchLevel("all"); // Reset tab filter when API filter changes
  }, []);

  const handleSetMaxMissingIngredients = useCallback((value: number) => {
    // Clamp to valid range
    const clamped = Math.max(0, Math.min(5, value));
    setMaxMissingIngredients(clamped);
    setActiveMatchLevel("all");
  }, []);

  const handleSetPrioritizeExpiring = useCallback((value: boolean) => {
    setPrioritizeExpiring(value);
    setActiveMatchLevel("all");
  }, []);

  const handleSetActiveMatchLevel = useCallback((level: MatchLevelTab) => {
    setActiveMatchLevel(level);
  }, []);

  const handleResetFilters = useCallback(() => {
    setMealCategory(DEFAULT_RECOMMENDATIONS_FILTER_STATE.mealCategory);
    setMaxMissingIngredients(DEFAULT_RECOMMENDATIONS_FILTER_STATE.maxMissingIngredients);
    setPrioritizeExpiring(DEFAULT_RECOMMENDATIONS_FILTER_STATE.prioritizeExpiring);
    setActiveMatchLevel("all");
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isRateLimited || isRefreshing) return;
    setRefreshTrigger((prev) => prev + 1);
    await fetchRecommendations(true);
  }, [isRateLimited, isRefreshing, fetchRecommendations]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setIsInitialLoad(true);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Memoized filter state object
  const filters = useMemo<RecommendationsFilterState>(
    () => ({
      mealCategory,
      maxMissingIngredients,
      prioritizeExpiring,
      limit,
    }),
    [mealCategory, maxMissingIngredients, prioritizeExpiring, limit]
  );

  // Computed values
  const matchLevelCounts = useMemo<MatchLevelCounts>(
    () => calculateMatchLevelCounts(recommendations),
    [recommendations]
  );

  const filteredRecommendations = useMemo<AIRecipeRecommendationDTO[]>(
    () => filterRecommendationsByMatchLevel(recommendations, activeMatchLevel),
    [recommendations, activeMatchLevel]
  );

  const activeFiltersCount = useMemo(() => calculateRecommendationsActiveFiltersCount(filters), [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Memoized return object to prevent re-renders
  return useMemo(
    () => ({
      // Data
      recommendations,
      filteredRecommendations,

      // Loading states
      loading,
      isRefreshing,

      // Error handling
      error,

      // Cache info
      cacheUsed,
      generatedAt,

      // Rate limiting
      isRateLimited,
      rateLimitResetTime,

      // Filters
      filters,
      activeMatchLevel,
      matchLevelCounts,
      activeFiltersCount,
      hasActiveFilters,

      // Actions
      refresh: handleRefresh,
      setMealCategory: handleSetMealCategory,
      setMaxMissingIngredients: handleSetMaxMissingIngredients,
      setPrioritizeExpiring: handleSetPrioritizeExpiring,
      setActiveMatchLevel: handleSetActiveMatchLevel,
      resetFilters: handleResetFilters,
      retry: handleRetry,
    }),
    [
      recommendations,
      filteredRecommendations,
      loading,
      isRefreshing,
      error,
      cacheUsed,
      generatedAt,
      isRateLimited,
      rateLimitResetTime,
      filters,
      activeMatchLevel,
      matchLevelCounts,
      activeFiltersCount,
      hasActiveFilters,
      handleRefresh,
      handleSetMealCategory,
      handleSetMaxMissingIngredients,
      handleSetPrioritizeExpiring,
      handleSetActiveMatchLevel,
      handleResetFilters,
      handleRetry,
    ]
  );
};
