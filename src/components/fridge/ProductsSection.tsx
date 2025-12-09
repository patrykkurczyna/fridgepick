import React from 'react';
import { ProductsList } from './ProductsList';
import { EmptyState } from './EmptyState';
import type { ProductDTO } from '@/types/fridge';

interface ProductsSectionProps {
  products: ProductDTO[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  searchQuery?: string;
}

/**
 * Wrapper component łączący ProductsList z empty states i error states
 * Zarządza wyświetlaniem odpowiedniego stanu na podstawie danych
 */
export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  searchQuery = ''
}) => {
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasProducts = products.length > 0;

  // Determine which empty state variant to show
  const getEmptyStateVariant = () => {
    if (hasSearchQuery && !hasProducts && !loading) {
      return 'no-results';
    }
    if (!hasSearchQuery && !hasProducts && !loading) {
      return 'empty';
    }
    return 'empty';
  };

  /**
   * Handle add first product action
   */
  const handleAddFirst = () => {
    // This will be handled by parent component navigation
    if (typeof window !== 'undefined') {
      window.location.href = '/fridge/add';
    }
  };

  return (
    <div className="products-section">
      {/* Results summary for search */}
      {hasSearchQuery && !loading && (
        <div className="mb-4 text-sm text-gray-600">
          {hasProducts ? (
            <>
              Znaleziono <span className="font-medium">{products.length}</span> {
                products.length === 1 ? 'produkt' : 
                products.length < 5 ? 'produkty' : 'produktów'
              } dla "{searchQuery}"
            </>
          ) : (
            <>Brak wyników dla "{searchQuery}"</>
          )}
        </div>
      )}

      {/* Products list or empty state */}
      {hasProducts || loading ? (
        <ProductsList
          products={products}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <EmptyState
          onAddFirst={handleAddFirst}
          variant={getEmptyStateVariant()}
        />
      )}

      {/* Search suggestions for no results */}
      {hasSearchQuery && !hasProducts && !loading && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Nie znalazłeś tego czego szukasz?
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Spróbuj:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Sprawdzić pisownię</li>
              <li>Użyć krótszych lub bardziej ogólnych słów</li>
              <li>Dodać nowy produkt do lodówki</li>
              <li>Przeglądnąć produkty według kategorii</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleAddFirst}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Dodaj nowy produkt →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};