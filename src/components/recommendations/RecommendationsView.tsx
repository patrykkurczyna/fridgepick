import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { RecommendationsHeader } from "./RecommendationsHeader";
import { RecommendationsFilters } from "./RecommendationsFilters";
import { MatchLevelTabs } from "./MatchLevelTabs";
import { RecommendationsGrid } from "./RecommendationsGrid";
import { RecommendationsEmptyState } from "./RecommendationsEmptyState";
import { LoadingStateWithProgress } from "./LoadingStateWithProgress";
import { RateLimitWarning } from "./RateLimitWarning";
import { useRecommendations } from "@/hooks/useRecommendations";

/**
 * Main container component for the AI recommendations view
 * Orchestrates all child components and manages state via useRecommendations hook
 */
export const RecommendationsView: React.FC = () => {
  const {
    // Data
    recommendations,
    filteredRecommendations,

    // Loading states
    loading,
    isRefreshing,

    // Error handling
    error,

    // Cache info
    cacheUsed,
    generatedAt,

    // Rate limiting
    isRateLimited,
    rateLimitResetTime,

    // Filters
    filters,
    activeMatchLevel,
    matchLevelCounts,
    activeFiltersCount,
    hasActiveFilters,

    // Actions
    refresh,
    setMealCategory,
    setMaxMissingIngredients,
    setPrioritizeExpiring,
    setActiveMatchLevel,
    resetFilters,
    retry,
  } = useRecommendations();

  /**
   * Handle recipe card click - navigate to recipe detail
   */
  const handleRecipeClick = (recipeId: string) => {
    window.location.href = `/recipes/${recipeId}`;
  };

  /**
   * Handle empty state action
   */
  const handleEmptyStateAction = () => {
    if (hasActiveFilters) {
      resetFilters();
    } else {
      window.location.href = "/fridge";
    }
  };

  /**
   * Determine empty state reason
   */
  const getEmptyStateReason = (): "no-products" | "no-matches" | "filters-too-strict" => {
    if (hasActiveFilters) {
      return "filters-too-strict";
    }
    // If no recommendations and no filters, assume no products
    // In real implementation, this could check if user has products
    return "no-products";
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="recommendations-view min-h-screen bg-gray-50">
        <RecommendationsHeader
          totalCount={0}
          loading={false}
          cacheUsed={false}
          generatedAt={null}
          onRefresh={retry}
          isRefreshing={false}
          isRateLimited={false}
          rateLimitResetTime={null}
        />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <ExclamationCircleIcon className="w-12 h-12 mx-auto text-red-500 mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Wystapil blad</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={retry}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sprobuj ponownie
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-view min-h-screen bg-gray-50">
      {/* Header with title and refresh button */}
      <RecommendationsHeader
        totalCount={recommendations.length}
        loading={loading}
        cacheUsed={cacheUsed}
        generatedAt={generatedAt}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        isRateLimited={isRateLimited}
        rateLimitResetTime={rateLimitResetTime}
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Rate limit warning */}
        {isRateLimited && rateLimitResetTime && <RateLimitWarning resetTime={rateLimitResetTime} />}

        {/* Filters section */}
        <RecommendationsFilters
          filters={filters}
          onMealCategoryChange={setMealCategory}
          onMaxMissingChange={setMaxMissingIngredients}
          onPrioritizeExpiringChange={setPrioritizeExpiring}
          onResetFilters={resetFilters}
          loading={loading || isRefreshing}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Match level tabs */}
        {!loading && recommendations.length > 0 && (
          <MatchLevelTabs
            activeLevel={activeMatchLevel}
            counts={matchLevelCounts}
            onChange={setActiveMatchLevel}
            disabled={isRefreshing}
          />
        )}

        {/* Loading state */}
        {loading && !isRefreshing && <LoadingStateWithProgress />}

        {/* Empty state */}
        {!loading && recommendations.length === 0 && (
          <RecommendationsEmptyState
            reason={getEmptyStateReason()}
            onAction={handleEmptyStateAction}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        {/* No results for current tab filter */}
        {!loading && recommendations.length > 0 && filteredRecommendations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Brak przepisow dla wybranego poziomu dopasowania.</p>
            <button
              onClick={() => setActiveMatchLevel("all")}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Pokaz wszystkie
            </button>
          </div>
        )}

        {/* Recommendations grid */}
        {!loading && filteredRecommendations.length > 0 && (
          <RecommendationsGrid recommendations={filteredRecommendations} onRecipeClick={handleRecipeClick} />
        )}
      </div>
    </div>
  );
};

RecommendationsView.displayName = "RecommendationsView";
