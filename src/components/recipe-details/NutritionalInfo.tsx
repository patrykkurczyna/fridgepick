import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import type { NutritionalInfoProps } from "@/types/recipe-details";

/**
 * Nutrient configuration for display
 */
interface NutrientConfig {
  key: keyof NonNullable<NutritionalInfoProps["nutritionalValues"]>;
  label: string;
  unit: string;
  colorClass: string;
  bgClass: string;
}

const NUTRIENTS: NutrientConfig[] = [
  { key: "calories", label: "Kalorie", unit: "kcal", colorClass: "text-orange-700", bgClass: "bg-orange-100" },
  { key: "protein", label: "Białko", unit: "g", colorClass: "text-red-700", bgClass: "bg-red-100" },
  { key: "carbs", label: "Węglowodany", unit: "g", colorClass: "text-blue-700", bgClass: "bg-blue-100" },
  { key: "fat", label: "Tłuszcze", unit: "g", colorClass: "text-yellow-700", bgClass: "bg-yellow-100" },
  { key: "fiber", label: "Błonnik", unit: "g", colorClass: "text-green-700", bgClass: "bg-green-100" },
  { key: "sugar", label: "Cukry", unit: "g", colorClass: "text-pink-700", bgClass: "bg-pink-100" },
];

/**
 * Panel prezentujący wartości odżywcze przepisu
 */
export const NutritionalInfo: React.FC<NutritionalInfoProps> = ({ nutritionalValues, servings }) => {
  // No nutritional values available
  if (!nutritionalValues) {
    return (
      <section className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
          <ChartBarIcon className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Wartości odżywcze</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-center py-4">Brak informacji o wartościach odżywczych.</p>
        </div>
      </section>
    );
  }

  /**
   * Filter nutrients that have values
   */
  const availableNutrients = NUTRIENTS.filter(
    (nutrient) => nutritionalValues[nutrient.key] !== undefined && nutritionalValues[nutrient.key] !== null
  );

  return (
    <section className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Wartości odżywcze</h2>
        </div>
        <span className="text-sm text-gray-500">na porcję</span>
      </div>

      {/* Nutrients grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableNutrients.map((nutrient) => {
            const value = nutritionalValues[nutrient.key];
            if (value === undefined || value === null) return null;

            return (
              <div key={nutrient.key} className={`${nutrient.bgClass} rounded-lg p-3 text-center`}>
                <div className={`text-2xl font-bold ${nutrient.colorClass}`}>
                  {value}
                  <span className="text-sm font-normal ml-1">{nutrient.unit}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{nutrient.label}</div>
              </div>
            );
          })}
        </div>

        {/* Servings info */}
        <p className="text-xs text-gray-500 text-center mt-3">
          Przepis na {servings} {servings === 1 ? "porcję" : servings < 5 ? "porcje" : "porcji"}
        </p>
      </div>
    </section>
  );
};
