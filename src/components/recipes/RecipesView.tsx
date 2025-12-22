import React from "react";
import { RecipesHeader } from "./RecipesHeader";
import { RecipesFilters } from "./RecipesFilters";
import { RecipesGrid } from "./RecipesGrid";
import { Pagination } from "@/components/fridge/Pagination";
import { useRecipes } from "@/hooks/useRecipes";

/**
 * Main container component for the recipes browsing view
 * Orchestrates all child components and manages state via useRecipes hook
 */
export const RecipesView: React.FC = () => {
  const {
    recipes,
    loading,
    isSearching,
    error,
    filters,
    pagination,
    activeFiltersCount,
    hasActiveFilters,
    handleSearch,
    handleMealCategoryChange,
    handleProteinTypeChange,
    handlePageChange,
    handleResetFilters,
    retry,
  } = useRecipes();

  /**
   * Handle recipe card click - navigate to recipe detail
   */
  const handleRecipeClick = (recipeId: string) => {
    window.location.href = `/recipes/${recipeId}`;
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="recipes-view min-h-screen bg-gray-50">
        <RecipesHeader totalCount={0} loading={false} />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Wystąpił błąd</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={retry}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recipes-view min-h-screen bg-gray-50">
      {/* Header with title and AI recommendations button */}
      <RecipesHeader totalCount={pagination.total} loading={loading} />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Filters section */}
        <RecipesFilters
          filters={filters}
          onSearchChange={handleSearch}
          onMealCategoryChange={handleMealCategoryChange}
          onProteinTypeChange={handleProteinTypeChange}
          onResetFilters={handleResetFilters}
          loading={loading || isSearching}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Recipes grid */}
        <RecipesGrid
          recipes={recipes}
          loading={loading}
          isSearching={isSearching}
          onRecipeClick={handleRecipeClick}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleResetFilters}
          searchQuery={filters.searchQuery}
        />

        {/* Pagination */}
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
