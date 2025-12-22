import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { MissingIngredientsTagProps } from "@/types/recommendations";

/**
 * Tag component displaying a list of missing ingredients needed for the recipe
 * Shows up to maxDisplay ingredients with "+X more" for the rest
 */
export const MissingIngredientsTag: React.FC<MissingIngredientsTagProps> = ({ ingredients, maxDisplay = 3 }) => {
  // Don't render if no missing ingredients
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  const displayedIngredients = ingredients.slice(0, maxDisplay);
  const remainingCount = ingredients.length - maxDisplay;
  const hasMore = remainingCount > 0;

  return (
    <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
      <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-sm">
        <span className="font-medium text-red-700">Brakuje: </span>
        <span className="text-red-600">
          {displayedIngredients.join(", ")}
          {hasMore && (
            <span className="text-red-500" title={ingredients.slice(maxDisplay).join(", ")}>
              {" "}
              +{remainingCount} wiecej
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

MissingIngredientsTag.displayName = "MissingIngredientsTag";
