import React from "react";
import { RecommendedRecipeCard } from "./RecommendedRecipeCard";
import type { RecommendationsGridProps } from "@/types/recommendations";

/**
 * Responsive grid container for displaying recommendation cards
 */
export const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({ recommendations, onRecipeClick }) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      role="list"
      aria-label="Lista rekomendowanych przepisow"
    >
      {recommendations.map((recommendation) => (
        <div key={recommendation.recipe.id} role="listitem">
          <RecommendedRecipeCard recommendation={recommendation} onClick={onRecipeClick} />
        </div>
      ))}
    </div>
  );
};

RecommendationsGrid.displayName = "RecommendationsGrid";
