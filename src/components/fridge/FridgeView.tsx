import React from 'react';
import { FridgeHeader } from './FridgeHeader';
import { FridgeFilters } from './FridgeFilters';
import { QuickAddPanel } from './QuickAddPanel';
import { ProductsSection } from './ProductsSection';
import { Pagination } from './Pagination';
import { useRealFridgeProducts as useFridgeProducts } from '@/hooks/useRealFridgeProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useAuth } from '@/hooks/useAuth';
import type { QuickAddItem } from '@/types/fridge';

/**
 * Główny container widoku lodówki
 * Zarządza stanem produktów, filtrowaniem i paginacją
 */
export const FridgeView: React.FC = () => {
  console.log('[FridgeView] RENDER');

  const { categories } = useProductCategories();

  const {
    products,
    loading,
    isSearching,
    error,
    searchQuery,
    sortBy,
    pagination,
    hasMore,
    handleSearch,
    handleSortChange,
    handlePageChange,
    retry,
    refresh,
    clearSearch
  } = useFridgeProducts();

  // Quick add panel state
  const [quickAddExpanded, setQuickAddExpanded] = React.useState(false);

  /**
   * Handle navigation to add product page
   */
  const handleAddProduct = () => {
    window.location.href = '/fridge/add';
  };

  /**
   * Handle product edit navigation
   */
  const handleEditProduct = (productId: string) => {
    window.location.href = `/fridge/edit/${productId}`;
  };

  /**
   * Handle product deletion
   */
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) {
      return;
    }

    try {
      const jwtToken = import.meta.env.PUBLIC_JWT_TOKEN;

      const response = await fetch(`/api/user-products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh products list
        refresh();

        // Show success message (could be replaced with toast notification)
        alert('Produkt został usunięty pomyślnie');
      } else {
        throw new Error('Nie udało się usunąć produktu');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Wystąpił błąd podczas usuwania produktu');
    }
  };

  /**
   * Handle quick add item selection
   */
  const handleQuickAdd = async (item: QuickAddItem, customData?: Partial<QuickAddItem>): Promise<void> => {
    try {
      // Get JWT token from environment variable (same as useRealFridgeProducts)
      const jwtToken = import.meta.env.PUBLIC_JWT_TOKEN;

      // Merge item with custom data from modal
      const finalItem = { ...item, ...customData };

      const response = await fetch('/api/user-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: finalItem.name,
          categoryId: finalItem.categoryId,
          quantity: finalItem.defaultQuantity,
          unit: finalItem.defaultUnit,
          expiresAt: finalItem.expiresAt || undefined
        })
      });

      if (response.ok) {
        // Refresh products list
        refresh();

        // Show success message
        alert(`Dodano ${finalItem.name} do lodówki`);
      } else {
        throw new Error('Nie udało się dodać produktu');
      }
    } catch (error) {
      console.error('Error adding quick product:', error);
      throw error; // Re-throw for component error handling
    }
  };

  /**
   * Toggle quick add panel
   */
  const handleQuickAddToggle = () => {
    setQuickAddExpanded(prev => !prev);
  };

  // Error boundary fallback
  if (error && !loading) {
    return (
      <div className="fridge-view min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Wystąpił błąd
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={retry}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fridge-view min-h-screen bg-gray-50">
      {/* Header z tytułem i główną akcją */}
      <FridgeHeader onAddProduct={handleAddProduct} />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Filtry i wyszukiwanie */}
        <FridgeFilters
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          onClearSearch={clearSearch}
          loading={isSearching}
        />

        {/* Quick add panel */}
        <QuickAddPanel
          isExpanded={quickAddExpanded}
          onToggle={handleQuickAddToggle}
          onQuickAdd={handleQuickAdd}
          categories={categories}
        />

        {/* Lista produktów z loading states */}
        <ProductsSection
          products={products}
          loading={loading}
          isSearching={isSearching}
          searchQuery={searchQuery}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />

        {/* Paginacja */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};
