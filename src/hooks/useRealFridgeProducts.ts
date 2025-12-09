import { useState, useEffect } from 'react';
import type { ProductDTO } from '@/types/fridge';
import type { UserProductsResponse } from '@/types';

/**
 * Hook for fetching real products from API with proper authentication
 */
export const useRealFridgeProducts = () => {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get token from environment variable
  const jwtToken = import.meta.env.PUBLIC_JWT_TOKEN;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/user-products', {
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
        setLoading(false);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handlers for UI interactions
  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
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
    // Re-trigger fetch by dependency change
  };

  const refresh = () => {
    retry();
  };

  const clearSearch = () => {
    // TODO: Clear search functionality
  };

  return {
    // State
    products,
    loading,
    error,
    searchQuery: '',
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
      query: '',
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