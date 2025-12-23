import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

const CACHE_KEY = "fridgepick_recommendations_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedRecommendations {
  recommendations: AIRecipeRecommendationDTO[];
  generatedAt: string;
  cachedAt: number;
  prioritizeExpiring: boolean;
}

function getCachedRecommendations(prioritizeExpiring: boolean): CachedRecommendations | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedRecommendations = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - data.cachedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if prioritizeExpiring setting matches
    if (data.prioritizeExpiring !== prioritizeExpiring) {
      return null;
    }

    return data;
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function setCachedRecommendations(
  recommendations: AIRecipeRecommendationDTO[],
  generatedAt: string,
  prioritizeExpiring: boolean
): void {
  try {
    const data: CachedRecommendations = {
      recommendations,
      generatedAt,
      cachedAt: Date.now(),
      prioritizeExpiring,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

function clearCachedRecommendations(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore
  }
}

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

  // Track if we've already loaded from cache on mount
  const hasLoadedFromCache = useRef(false);

  /**
   * Load recommendations from sessionStorage cache
   */
  const loadFromCache = useCallback(() => {
    const cached = getCachedRecommendations(prioritizeExpiring);
    if (cached) {
      setRecommendations(cached.recommendations);
      setGeneratedAt(cached.generatedAt);
      setCacheUsed(true);
      setLoading(false);
      setIsInitialLoad(false);
      return true;
    }
    return false;
  }, [prioritizeExpiring]);

  /**
   * Fetch recommendations from API
   * Note: Filtering by category and maxMissing is done locally, not via API
   */
  const fetchRecommendations = useCallback(
    async (forceRefresh = false) => {
      try {
        const jwtToken = getAccessToken();
        if (!jwtToken) {
          console.warn("No access token available, skipping fetch");
          setRecommendations([]);
          setLoading(false);
          setIsRefreshing(false);
          return;
        }

        // On force refresh, clear cache first
        if (forceRefresh) {
          clearCachedRecommendations();
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }

        // Build query parameters - only prioritize_expiring affects AI behavior
        const params = new URLSearchParams();
        if (prioritizeExpiring) {
          params.append("prioritize_expiring", "true");
        }

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

        // Save to cache
        setCachedRecommendations(data.recommendations, data.generatedAt, prioritizeExpiring);

        setRecommendations(data.recommendations);
        setCacheUsed(false); // Fresh data, not from cache
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
    [prioritizeExpiring]
  );

  // Track previous prioritizeExpiring value to detect changes
  const prevPrioritizeExpiring = useRef(prioritizeExpiring);

  // On mount: try to load from cache first, otherwise fetch from API
  useEffect(() => {
    if (hasLoadedFromCache.current) return;
    hasLoadedFromCache.current = true;

    const cachedLoaded = loadFromCache();
    if (!cachedLoaded) {
      fetchRecommendations(false);
    }
  }, [loadFromCache, fetchRecommendations]);

  // When prioritizeExpiring changes (not on mount), refetch from API
  useEffect(() => {
    if (!hasLoadedFromCache.current) return; // Skip on initial mount
    if (prevPrioritizeExpiring.current === prioritizeExpiring) return; // No change

    prevPrioritizeExpiring.current = prioritizeExpiring;
    fetchRecommendations(true); // Force refresh with new prioritization
  }, [prioritizeExpiring, fetchRecommendations]);

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

  const handleSetPrioritizeExpiring = useCallback(
    (value: boolean) => {
      setPrioritizeExpiring(value);
      setActiveMatchLevel("all");
      // Clear cache and refetch since this affects the API query
      clearCachedRecommendations();
      // Fetch will happen via useEffect when prioritizeExpiring changes
    },
    []
  );

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
    await fetchRecommendations(true);
  }, [isRateLimited, isRefreshing, fetchRecommendations]);

  const handleRetry = useCallback(async () => {
    setError(null);
    await fetchRecommendations(false);
  }, [fetchRecommendations]);

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

  // Apply category and maxMissing filters first (for counts and final filtering)
  const preFilteredRecommendations = useMemo<AIRecipeRecommendationDTO[]>(() => {
    let filtered = recommendations;

    // Filter by meal category
    if (mealCategory) {
      filtered = filtered.filter((r) => r.recipe.mealCategory === mealCategory);
    }

    // Filter by max missing ingredients
    filtered = filtered.filter((r) => r.missingIngredients.length <= maxMissingIngredients);

    return filtered;
  }, [recommendations, mealCategory, maxMissingIngredients]);

  // Computed values - counts based on pre-filtered data
  const matchLevelCounts = useMemo<MatchLevelCounts>(
    () => calculateMatchLevelCounts(preFilteredRecommendations),
    [preFilteredRecommendations]
  );

  // Apply match level tab filter on top of pre-filtered data
  const filteredRecommendations = useMemo<AIRecipeRecommendationDTO[]>(
    () => filterRecommendationsByMatchLevel(preFilteredRecommendations, activeMatchLevel),
    [preFilteredRecommendations, activeMatchLevel]
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
