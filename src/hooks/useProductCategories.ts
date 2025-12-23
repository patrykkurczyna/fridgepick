import { useState, useEffect, useCallback } from "react";
import type { ProductCategory } from "@/types/fridge";
import type { ProductCategoriesResponse } from "@/types";
import { useAuth } from "@/hooks/useAuth";

/**
 * Custom hook for fetching and caching product categories
 * Static data z długim cache TTL
 */
export const useProductCategories = () => {
  const { isAuthenticated, user } = useAuth();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  /**
   * Fetch categories from API with caching
   */
  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("Not authenticated");
      return;
    }

    // Check cache first (1 hour TTL)
    const cacheKey = "product-categories";
    const cacheTimestampKey = "product-categories-timestamp";
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(cacheTimestampKey);

    if (cachedData && cacheTimestamp) {
      const cacheAge = Date.now() - parseInt(cacheTimestamp, 10);
      const cacheMaxAge = 60 * 60 * 1000; // 1 hour

      if (cacheAge < cacheMaxAge) {
        try {
          const parsed = JSON.parse(cachedData) as ProductCategory[];
          setCategories(parsed);
          setLoading(false);
          setError(null);
          setLastFetch(new Date(parseInt(cacheTimestamp, 10)));
          return;
        } catch {
          // Invalid cache, proceed to fetch
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(cacheTimestampKey);
        }
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/product-categories", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductCategoriesResponse = await response.json();

      setCategories(data.categories);
      setLoading(false);
      setError(null);

      const timestamp = Date.now();
      setLastFetch(new Date(timestamp));

      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify(data.categories));
      localStorage.setItem(cacheTimestampKey, String(timestamp));
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  }, [isAuthenticated, user?.accessToken]);

  /**
   * Get category name by ID with fallback
   */
  const getCategoryName = useCallback(
    (categoryId: number): string => {
      const category = categories.find((c) => c.id === categoryId);
      return category ? category.name : `Kategoria ${categoryId}`;
    },
    [categories]
  );

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback(
    (categoryId: number): ProductCategory | undefined => {
      return categories.find((c) => c.id === categoryId);
    },
    [categories]
  );

  /**
   * Check if categories are available
   */
  const hasCategories = categories.length > 0;

  /**
   * Retry fetching categories
   */
  const retry = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Clear cache and refetch
   */
  const refresh = useCallback(() => {
    localStorage.removeItem("product-categories");
    localStorage.removeItem("product-categories-timestamp");
    fetchCategories();
  }, [fetchCategories]);

  // Initialize on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    } else {
      setCategories([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, fetchCategories]);

  return {
    // State
    categories,
    loading,
    error,
    hasCategories,
    lastFetch,

    // Utility functions
    getCategoryName,
    getCategoryById,

    // Actions
    retry,
    refresh,
  };
};
