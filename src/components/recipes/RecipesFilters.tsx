import React from "react";
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { SearchBar } from "@/components/fridge/SearchBar";
import { MealCategoryFilter } from "./MealCategoryFilter";
import { ProteinTypeFilter } from "./ProteinTypeFilter";
import type { RecipesFiltersProps } from "@/types/recipes";

/**
 * Filter panel containing search input and filter controls
 * Combines SearchBar, MealCategoryFilter, ProteinTypeFilter, and reset button
 */
const RecipesFiltersComponent: React.FC<RecipesFiltersProps> = ({
  filters,
  onSearchChange,
  onMealCategoryChange,
  onProteinTypeChange,
  onResetFilters,
  loading,
  activeFiltersCount,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search bar - full width */}
      {/* Note: SearchBar should NOT be disabled during search to preserve focus */}
      <div className="w-full">
        <SearchBar query={filters.searchQuery} onSearch={onSearchChange} placeholder="Szukaj przepisów..." />
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Meal category filter */}
        <div className="flex-1">
          <MealCategoryFilter value={filters.mealCategory} onChange={onMealCategoryChange} disabled={loading} />
        </div>

        {/* Protein type filter */}
        <div className="flex-1">
          <ProteinTypeFilter value={filters.proteinType} onChange={onProteinTypeChange} disabled={loading} />
        </div>

        {/* Reset filters button - only shown when filters are active */}
        <div className="flex items-end">
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Wyczyść wszystkie filtry"
            >
              <XMarkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Wyczyść</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {activeFiltersCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FunnelIcon className="w-4 h-4" />
          <span>
            Aktywne filtry: <strong>{activeFiltersCount}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

RecipesFiltersComponent.displayName = "RecipesFilters";

export const RecipesFilters = React.memo(RecipesFiltersComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.filters.searchQuery === nextProps.filters.searchQuery &&
    prevProps.filters.mealCategory === nextProps.filters.mealCategory &&
    prevProps.filters.proteinType === nextProps.filters.proteinType &&
    prevProps.onSearchChange === nextProps.onSearchChange &&
    prevProps.onMealCategoryChange === nextProps.onMealCategoryChange &&
    prevProps.onProteinTypeChange === nextProps.onProteinTypeChange &&
    prevProps.onResetFilters === nextProps.onResetFilters &&
    prevProps.loading === nextProps.loading &&
    prevProps.activeFiltersCount === nextProps.activeFiltersCount
  );
});
