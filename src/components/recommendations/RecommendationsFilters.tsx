import React from "react";
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { MealCategoryFilter } from "@/components/recipes/MealCategoryFilter";
import { MaxMissingIngredientsSlider } from "./MaxMissingIngredientsSlider";
import { PrioritizeExpiringToggle } from "./PrioritizeExpiringToggle";
import type { RecommendationsFiltersProps } from "@/types/recommendations";
import type { MealCategory } from "@/types/recipes";

/**
 * Filter panel for refining AI recommendations
 * Includes meal category filter, max missing ingredients slider,
 * and toggle for prioritizing expiring ingredients
 */
const RecommendationsFiltersComponent: React.FC<RecommendationsFiltersProps> = ({
  filters,
  onMealCategoryChange,
  onMaxMissingChange,
  onPrioritizeExpiringChange,
  onResetFilters,
  loading,
  activeFiltersCount,
}) => {
  /**
   * Handle meal category change with type coercion
   */
  const handleMealCategoryChange = (category: MealCategory | null) => {
    onMealCategoryChange(category);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* First row: Meal category and prioritize expiring */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Meal category filter */}
        <div className="flex-1">
          <MealCategoryFilter value={filters.mealCategory} onChange={handleMealCategoryChange} disabled={loading} />
        </div>

        {/* Prioritize expiring toggle */}
        <div className="flex items-end">
          <PrioritizeExpiringToggle
            checked={filters.prioritizeExpiring}
            onChange={onPrioritizeExpiringChange}
            disabled={loading}
          />
        </div>
      </div>

      {/* Second row: Max missing ingredients slider */}
      <div className="pt-2 border-t border-gray-100">
        <MaxMissingIngredientsSlider
          value={filters.maxMissingIngredients}
          onChange={onMaxMissingChange}
          disabled={loading}
        />
      </div>

      {/* Reset filters button and active filters indicator */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FunnelIcon className="w-4 h-4" aria-hidden="true" />
            <span>
              Aktywne filtry: <strong>{activeFiltersCount}</strong>
            </span>
          </div>

          <button
            onClick={onResetFilters}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Wyczysc wszystkie filtry"
          >
            <XMarkIcon className="w-4 h-4" aria-hidden="true" />
            <span>Wyczysc filtry</span>
          </button>
        </div>
      )}
    </div>
  );
};

RecommendationsFiltersComponent.displayName = "RecommendationsFilters";

export const RecommendationsFilters = React.memo(RecommendationsFiltersComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.filters.mealCategory === nextProps.filters.mealCategory &&
    prevProps.filters.maxMissingIngredients === nextProps.filters.maxMissingIngredients &&
    prevProps.filters.prioritizeExpiring === nextProps.filters.prioritizeExpiring &&
    prevProps.onMealCategoryChange === nextProps.onMealCategoryChange &&
    prevProps.onMaxMissingChange === nextProps.onMaxMissingChange &&
    prevProps.onPrioritizeExpiringChange === nextProps.onPrioritizeExpiringChange &&
    prevProps.onResetFilters === nextProps.onResetFilters &&
    prevProps.loading === nextProps.loading &&
    prevProps.activeFiltersCount === nextProps.activeFiltersCount
  );
});
