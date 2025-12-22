import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import type { ExpiringIngredientsTagProps } from "@/types/recommendations";

/**
 * Tag component highlighting ingredients that are expiring soon
 * and would be used in this recipe
 */
export const ExpiringIngredientsTag: React.FC<ExpiringIngredientsTagProps> = ({ ingredients }) => {
  // Don't render if no expiring ingredients
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
      <ClockIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-sm">
        <span className="font-medium text-amber-700">Wykorzystuje wygasajace: </span>
        <span className="text-amber-600">{ingredients.join(", ")}</span>
      </div>
    </div>
  );
};

ExpiringIngredientsTag.displayName = "ExpiringIngredientsTag";
