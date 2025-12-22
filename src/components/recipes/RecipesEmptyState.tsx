import React from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import type { RecipesEmptyStateProps } from "@/types/recipes";

/**
 * Empty state component shown when no recipes match current filters
 * Provides contextual messaging and option to clear filters
 */
export const RecipesEmptyState: React.FC<RecipesEmptyStateProps> = ({
  hasActiveFilters,
  onClearFilters,
  searchQuery,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {hasActiveFilters ? (
          <FunnelIcon className="w-8 h-8 text-gray-400" />
        ) : (
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nie znaleziono przepisów</h3>

      {/* Description - contextual based on filters */}
      <p className="text-gray-600 text-center max-w-md mb-6">{getEmptyStateMessage(hasActiveFilters, searchQuery)}</p>

      {/* Clear filters button - only shown when filters are active */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <FunnelIcon className="w-4 h-4" />
          Wyczyść filtry
        </button>
      )}
    </div>
  );
};

/**
 * Generate contextual empty state message based on active filters
 */
function getEmptyStateMessage(hasActiveFilters: boolean, searchQuery?: string): string {
  if (searchQuery && searchQuery.trim().length >= 2) {
    return `Nie znaleziono przepisów pasujących do "${searchQuery}". Spróbuj innych słów kluczowych lub wyczyść filtry.`;
  }

  if (hasActiveFilters) {
    return "Nie znaleziono przepisów spełniających wybrane kryteria. Spróbuj zmienić filtry lub je wyczyścić.";
  }

  return "Brak przepisów w bazie danych. Przepisy zostaną wkrótce dodane.";
}
