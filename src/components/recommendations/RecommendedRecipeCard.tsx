import React from "react";
import { ClockIcon, FireIcon } from "@heroicons/react/24/outline";
import { MatchScoreIndicator } from "./MatchScoreIndicator";
import { MissingIngredientsTag } from "./MissingIngredientsTag";
import { ExpiringIngredientsTag } from "./ExpiringIngredientsTag";
import type { RecommendedRecipeCardProps } from "@/types/recommendations";
import { getMatchLevelConfig } from "@/types/recommendations";
import { getMealCategoryBadge } from "@/types/recipes";

/**
 * Individual recipe card displaying a recommended recipe
 * with match indicators, missing ingredients, and expiring ingredients highlighting
 */
export const RecommendedRecipeCard: React.FC<RecommendedRecipeCardProps> = ({ recommendation, onClick }) => {
  const { recipe, matchScore, matchLevel, missingIngredients, usingExpiringIngredients } = recommendation;
  const matchConfig = getMatchLevelConfig(matchLevel);
  const categoryBadge = getMealCategoryBadge(recipe.mealCategory);

  /**
   * Handle card click
   */
  const handleClick = () => {
    onClick(recipe.id);
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(recipe.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {/* Header with match level badge */}
      <div className={`px-4 py-2 ${matchConfig.className} border-b`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{matchConfig.label}</span>
          <span className="text-xs opacity-75">{Math.round(matchScore * 100)}% dopasowania</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
          {recipe.name}
        </h3>

        {/* Match score indicator */}
        <MatchScoreIndicator score={matchScore} matchLevel={matchLevel} />

        {/* Category and meta info */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryBadge.className}`}
          >
            {categoryBadge.label}
          </span>

          {/* Prep time */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4" aria-hidden="true" />
            <span>{recipe.prepTimeMinutes} min</span>
          </div>

          {/* Calories */}
          {recipe.nutritionalValues?.calories && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FireIcon className="w-4 h-4" aria-hidden="true" />
              <span>{recipe.nutritionalValues.calories} kcal</span>
            </div>
          )}
        </div>

        {/* Expiring ingredients tag */}
        {usingExpiringIngredients.length > 0 && <ExpiringIngredientsTag ingredients={usingExpiringIngredients} />}

        {/* Missing ingredients tag */}
        {missingIngredients.length > 0 && <MissingIngredientsTag ingredients={missingIngredients} />}
      </div>
    </div>
  );
};

RecommendedRecipeCard.displayName = "RecommendedRecipeCard";
