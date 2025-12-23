import React from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import type { CookabilityBannerProps } from "@/types/recipe-details";

/**
 * Banner informujący o możliwości ugotowania przepisu
 * Zielony gdy wszystkie składniki są dostępne, żółty gdy brakuje składników
 */
export const CookabilityBanner: React.FC<CookabilityBannerProps> = ({ canCook, missingIngredients }) => {
  if (canCook) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-800">Masz wszystkie składniki!</h3>
            <p className="text-sm text-green-700 mt-0.5">
              Możesz przygotować ten przepis z produktów, które masz w lodówce.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-amber-800">Brakuje niektórych składników</h3>
          <p className="text-sm text-amber-700 mt-0.5">Aby przygotować ten przepis, musisz dokupić:</p>
          <ul className="mt-2 space-y-1">
            {missingIngredients.map((ingredient, index) => (
              <li key={index} className="text-sm text-amber-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
