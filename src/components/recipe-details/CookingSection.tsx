import React from "react";
import { FireIcon } from "@heroicons/react/24/outline";
import type { CookingSectionProps } from "@/types/recipe-details";
import { PortionsSelector } from "./PortionsSelector";
import { CookButton } from "./CookButton";

/**
 * Sekcja akcji gotowania z wyborem liczby porcji i przyciskiem "Ugotowane"
 */
export const CookingSection: React.FC<CookingSectionProps> = ({
  canCook,
  missingIngredients,
  portions,
  onPortionsChange,
  onCook,
  isCooking,
}) => {
  return (
    <section className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <FireIcon className="w-5 h-5 text-gray-600" />
        <h2 className="font-semibold text-gray-900">Gotowanie</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Missing ingredients warning */}
        {!canCook && missingIngredients.length > 0 && (
          <div className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
            <p className="font-medium mb-1">Brakujące składniki:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {missingIngredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Portions selector and cook button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Portions selector */}
          <PortionsSelector value={portions} onChange={onPortionsChange} min={1} max={10} disabled={isCooking} />

          {/* Cook button */}
          <CookButton onClick={onCook} disabled={isCooking} isLoading={isCooking} canCook={canCook} />
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-500">
          Po oznaczeniu jako ugotowane, składniki zostaną automatycznie odjęte z Twojej lodówki.
        </p>
      </div>
    </section>
  );
};
