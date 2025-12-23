import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { ProductDTO, SortOption } from "@/types/fridge";
import type { UserProductsResponse } from "@/types";
import { getAccessToken } from "@/hooks/useAuth";

/**
 * Hook for fetching real products from API with proper authentication and search
 */
export const useRealFridgeProducts = () => {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isInitialLoadRef = useRef(true);
  const [lastFetchTime, setLastFetchTime] = useState(new Date());

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>("expires_at");

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products when debounced search or refresh trigger changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get access token dynamically from localStorage (set by useAuth)
        const jwtToken = getAccessToken();
        if (!jwtToken) {
          setProducts([]);
          setLoading(false);
          setIsSearching(false);
          return;
        }

        // Determine if this is a search or initial load
        const isSearchAction = !isInitialLoadRef.current && debouncedSearch !== "";

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
        // Always include sort parameter
        params.append("sort", sortBy);

        const url = `/api/user-products?${params.toString()}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserProductsResponse = await response.json();

        // Convert to the format expected by the UI
        const convertedProducts: ProductDTO[] = data.products.map((product) => ({
          id: product.id,
          name: product.name,
          categoryId: product.categoryId.toString(),
          categoryName: product.categoryName,
          quantity: product.quantity,
          unit: product.unit,
          expiresAt: product.expiresAt,
          isExpired: product.isExpired,
          daysUntilExpiry: product.daysUntilExpiry,
          createdAt: product.createdAt,
          updatedAt: product.createdAt,
        }));

        setProducts(convertedProducts);
        setError(null);
        setLoading(false);
        setIsSearching(false);
        isInitialLoadRef.current = false;
        setLastFetchTime(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nie udało się załadować produktów");
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, refreshTrigger, sortBy]);

  // Handlers for UI interactions - wrapped in useCallback to prevent re-renders
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
  }, []);

  const handlePageChange = useCallback(() => {
    // TODO: Implement pagination functionality
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    isInitialLoadRef.current = true;
    // Re-trigger fetch by incrementing refreshTrigger
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const refresh = useCallback(() => {
    retry();
  }, [retry]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
  }, []);

  // Memoize pagination object to prevent re-renders
  const pagination = useMemo(
    () => ({
      currentPage: 1,
      totalPages: 1,
      limit: 20,
      total: products.length,
      offset: 0,
    }),
    [products.length]
  );

  // Memoize filters object to prevent re-renders
  const filters = useMemo(
    () => ({
      query: searchQuery,
      sortBy,
      sortDirection: "asc" as const,
      showExpired: false,
      expiringSoon: undefined,
      categoryId: undefined,
    }),
    [searchQuery, sortBy]
  );

  // Memoize return object to prevent re-renders
  return useMemo(
    () => ({
      // State
      products,
      loading,
      isSearching,
      error,
      searchQuery,
      sortBy,
      currentPage: 1,
      pagination,
      filters,
      hasMore: false,

      // Actions
      handleSearch,
      handleSortChange,
      handlePageChange,
      retry,
      refresh,
      clearSearch,

      // Utility
      lastFetch: lastFetchTime,
    }),
    [
      products,
      loading,
      isSearching,
      error,
      searchQuery,
      sortBy,
      pagination,
      filters,
      lastFetchTime,
      handleSearch,
      handleSortChange,
      handlePageChange,
      retry,
      refresh,
      clearSearch,
    ]
  );
};
