import React, { useMemo } from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { IngredientsSectionProps } from "@/types/recipe-details";
import { transformIngredientsToViewModel } from "@/types/recipe-details";
import { IngredientItem } from "./IngredientItem";

/**
 * Sekcja prezentująca listę składników przepisu
 * Podział na wymagane i opcjonalne z podsumowaniem dostępności
 */
export const IngredientsSection: React.FC<IngredientsSectionProps> = ({ ingredients }) => {
  /**
   * Transform ingredients to ViewModel with availability info
   */
  const viewModel = useMemo(() => transformIngredientsToViewModel(ingredients), [ingredients]);

  return (
    <section className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Składniki</h2>
        </div>

        {/* Availability summary */}
        <div className="text-sm text-gray-600">
          <span className="font-medium text-green-600">{viewModel.availableCount}</span>
          <span className="text-gray-500"> / {viewModel.totalCount} dostępnych</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Required ingredients */}
        {viewModel.required.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Wymagane ({viewModel.required.length})
            </h3>
            <ul className="bg-gray-50 rounded-lg px-3">
              {viewModel.required.map((ingredient) => (
                <IngredientItem key={ingredient.id} ingredient={ingredient} showUserQuantity />
              ))}
            </ul>
          </div>
        )}

        {/* Optional ingredients */}
        {viewModel.optional.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Opcjonalne ({viewModel.optional.length})
            </h3>
            <ul className="bg-gray-50 rounded-lg px-3">
              {viewModel.optional.map((ingredient) => (
                <IngredientItem key={ingredient.id} ingredient={ingredient} showUserQuantity />
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {ingredients.length === 0 && (
          <p className="text-gray-500 text-center py-4">Brak składników dla tego przepisu.</p>
        )}
      </div>
    </section>
  );
};
