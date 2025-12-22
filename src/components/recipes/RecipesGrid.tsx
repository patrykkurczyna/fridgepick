import React from "react";
import { RecipeCard } from "./RecipeCard";
import { RecipesLoadingSkeleton } from "./RecipesLoadingSkeleton";
import { RecipesEmptyState } from "./RecipesEmptyState";
import type { RecipesGridProps } from "@/types/recipes";

interface ExtendedRecipesGridProps extends RecipesGridProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  searchQuery: string;
}

/**
 * Grid container displaying recipe cards
 * Handles loading, empty, and normal states
 */
export const RecipesGrid: React.FC<ExtendedRecipesGridProps> = ({
  recipes,
  loading,
  isSearching,
  onRecipeClick,
  hasActiveFilters,
  onClearFilters,
  searchQuery,
}) => {
  // Show loading skeleton during initial load
  if (loading && !isSearching) {
    return <RecipesLoadingSkeleton count={8} />;
  }

  // Show empty state when no recipes and not searching
  if (!loading && !isSearching && recipes.length === 0) {
    return (
      <RecipesEmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        searchQuery={searchQuery}
      />
    );
  }

  return (
    <div className="relative">
      {/* Searching overlay */}
      {isSearching && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Szukam przepisów...</span>
          </div>
        </div>
      )}

      {/* Recipe cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={onRecipeClick} />
        ))}
      </div>
    </div>
  );
};
