import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { RecipeDTO, RecipesResponse } from "@/types";
import type { RecipesFiltersState, RecipesPaginationState, MealCategory, ProteinType } from "@/types/recipes";
import { calculateActiveFiltersCount } from "@/types/recipes";
import { getAccessToken } from "@/hooks/useAuth";

/** Return type for useRecipes hook */
export interface UseRecipesReturn {
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

const ITEMS_PER_PAGE = 20;

/**
 * Custom hook for managing recipes state and API interactions
 * Handles filtering, searching, pagination, and data fetching
 */
export const useRecipes = (): UseRecipesReturn => {
  // Core state
  const [recipes, setRecipes] = useState<RecipeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isInitialLoadRef = useRef(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mealCategory, setMealCategory] = useState<MealCategory | null>(null);
  const [proteinType, setProteinType] = useState<ProteinType | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, mealCategory, proteinType]);

  // Fetch recipes when filters, pagination, or refresh trigger changes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const jwtToken = getAccessToken();
        if (!jwtToken) {
          setRecipes([]);
          setLoading(false);
          setIsSearching(false);
          return;
        }

        // Determine loading state type
        const isSearchAction =
          !isInitialLoadRef.current && (debouncedSearch !== "" || mealCategory !== null || proteinType !== null);

        if (isSearchAction) {
          setIsSearching(true);
        } else {
          setLoading(true);
        }

        // Build query parameters
        const params = new URLSearchParams();

        if (debouncedSearch && debouncedSearch.trim().length >= 2) {
          params.append("search", debouncedSearch.trim());
        }
        if (mealCategory) {
          params.append("meal_category", mealCategory);
        }
        if (proteinType) {
          params.append("protein_type", proteinType);
        }

        // Pagination params
        params.append("limit", ITEMS_PER_PAGE.toString());
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        params.append("offset", offset.toString());

        const url = `/api/recipes${params.toString() ? `?${params.toString()}` : ""}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Sesja wygasła. Zaloguj się ponownie.");
          }
          if (response.status === 429) {
            throw new Error("Zbyt wiele zapytań. Spróbuj ponownie za chwilę.");
          }
          throw new Error(`Błąd serwera: ${response.status}`);
        }

        const data: RecipesResponse = await response.json();

        setRecipes(data.recipes);
        setTotalItems(data.pagination.total);
        setError(null);
        setLoading(false);
        setIsSearching(false);
        isInitialLoadRef.current = false;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nie udało się załadować przepisów");
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchRecipes();
  }, [debouncedSearch, mealCategory, proteinType, currentPage, refreshTrigger]);

  // Handlers - wrapped in useCallback to prevent unnecessary re-renders
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleMealCategoryChange = useCallback((category: MealCategory | null) => {
    setMealCategory(category);
  }, []);

  const handleProteinTypeChange = useCallback((type: ProteinType | null) => {
    setProteinType(type);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of page on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setMealCategory(null);
    setProteinType(null);
    setCurrentPage(1);
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    isInitialLoadRef.current = true;
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const refresh = useCallback(() => {
    retry();
  }, [retry]);

  // Memoized filter state object
  const filters = useMemo<RecipesFiltersState>(
    () => ({
      searchQuery,
      mealCategory,
      proteinType,
    }),
    [searchQuery, mealCategory, proteinType]
  );

  // Memoized pagination state
  const pagination = useMemo<RecipesPaginationState>(
    () => ({
      currentPage,
      totalPages: Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)),
      limit: ITEMS_PER_PAGE,
      total: totalItems,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
    }),
    [currentPage, totalItems]
  );

  // Computed values
  const activeFiltersCount = useMemo(() => calculateActiveFiltersCount(filters), [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Memoized return object to prevent re-renders
  return useMemo(
    () => ({
      // State
      recipes,
      loading,
      isSearching,
      error,
      filters,
      pagination,

      // Computed
      activeFiltersCount,
      hasActiveFilters,

      // Actions
      handleSearch,
      handleMealCategoryChange,
      handleProteinTypeChange,
      handlePageChange,
      handleResetFilters,
      retry,
      refresh,
    }),
    [
      recipes,
      loading,
      isSearching,
      error,
      filters,
      pagination,
      activeFiltersCount,
      hasActiveFilters,
      handleSearch,
      handleMealCategoryChange,
      handleProteinTypeChange,
      handlePageChange,
      handleResetFilters,
      retry,
      refresh,
    ]
  );
};
