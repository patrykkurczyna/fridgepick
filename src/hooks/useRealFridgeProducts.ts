import { useState, useEffect } from 'react';
import type { ProductDTO } from '@/types/fridge';
import type { UserProductsResponse } from '@/types';

/**
 * Hook for fetching real products from API with proper authentication and search
 */
export const useRealFridgeProducts = () => {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Get token from environment variable
  const jwtToken = import.meta.env.PUBLIC_JWT_TOKEN;

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
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (debouncedSearch && debouncedSearch.trim().length >= 2) {
          params.append('search', debouncedSearch.trim());
        }

        const url = `/api/user-products${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserProductsResponse = await response.json();

        // Convert to the format expected by the UI
        const convertedProducts: ProductDTO[] = data.products.map(product => ({
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
          updatedAt: product.createdAt
        }));

        setProducts(convertedProducts);
        setError(null);
        setLoading(false);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, refreshTrigger, jwtToken]);

  // Handlers for UI interactions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (sortBy: string) => {
    // TODO: Implement sorting functionality
  };

  const handlePageChange = (page: number) => {
    // TODO: Implement pagination functionality
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    // Re-trigger fetch by incrementing refreshTrigger
    setRefreshTrigger(prev => prev + 1);
  };

  const refresh = () => {
    retry();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
  };

  return {
    // State
    products,
    loading,
    error,
    searchQuery,
    sortBy: 'expires_at',
    currentPage: 1,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      limit: 20,
      total: products.length,
      offset: 0
    },
    filters: {
      query: searchQuery,
      sortBy: 'expires_at',
      sortDirection: 'asc' as const,
      showExpired: false,
      expiringSoon: undefined,
      categoryId: undefined
    },
    hasMore: false,

    // Actions
    handleSearch,
    handleSortChange,
    handlePageChange,
    retry,
    refresh,
    clearSearch,

    // Utility
    lastFetch: new Date()
  };
};
