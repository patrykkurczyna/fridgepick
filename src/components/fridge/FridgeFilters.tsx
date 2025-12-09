import React from 'react';
import { SearchBar } from './SearchBar';
import { SortControls } from './SortControls';
import type { SortOption } from '@/types/fridge';

interface FridgeFiltersProps {
  searchQuery: string;
  sortBy: SortOption;
  onSearch: (query: string) => void;
  onSortChange: (option: SortOption) => void;
  onClearSearch: () => void;
  loading?: boolean;
}

/**
 * Wrapper component dla wszystkich filtrów i kontrolek wyszukiwania
 * Łączy SearchBar i SortControls w responsywny layout
 */
export const FridgeFilters: React.FC<FridgeFiltersProps> = ({
  searchQuery,
  sortBy,
  onSearch,
  onSortChange,
  onClearSearch,
  loading = false
}) => {
  const hasActiveSearch = searchQuery.trim().length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search section */}
        <div className="flex-1 lg:max-w-md">
          <SearchBar
            query={searchQuery}
            onSearch={onSearch}
            disabled={loading}
            placeholder="Szukaj produktów po nazwie..."
          />
        </div>

        {/* Sort and actions section */}
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <SortControls
            sortBy={sortBy}
            onSortChange={onSortChange}
            disabled={loading}
          />

          {/* Clear search button (mobile friendly) */}
          {hasActiveSearch && (
            <button
              onClick={onClearSearch}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors px-3 py-1 rounded border border-gray-300 hover:border-gray-400"
              disabled={loading}
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {/* Active filters indicator */}
      {hasActiveSearch && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Aktywne filtry:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                Wyszukiwanie: "{searchQuery}"
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};