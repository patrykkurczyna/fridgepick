import React from "react";
import type { IngredientItemProps } from "@/types/recipe-details";
import { calculateAvailabilityStatus } from "@/types/recipe-details";
import { AvailabilityIndicator } from "./AvailabilityIndicator";

/**
 * Pojedynczy element listy składników
 * Wyświetla nazwę, ilość, jednostkę oraz wskaźnik dostępności
 */
export const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient, showUserQuantity = false }) => {
  const availabilityStatus = calculateAvailabilityStatus(ingredient.quantity, ingredient.userQuantity);

  /**
   * Format quantity with unit
   */
  const formatQuantity = (quantity: number, unit: string): string => {
    // Round to 1 decimal place if needed
    const formatted = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
    return `${formatted} ${unit}`;
  };

  return (
    <li className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Availability indicator */}
        <AvailabilityIndicator
          status={availabilityStatus}
          requiredQuantity={ingredient.quantity}
          userQuantity={ingredient.userQuantity}
          unit={ingredient.unit}
        />

        {/* Ingredient name */}
        <span className="text-gray-800 truncate">{ingredient.name}</span>
      </div>

      {/* Quantity info */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-gray-600 text-sm font-medium">
          {formatQuantity(ingredient.quantity, ingredient.unit)}
        </span>

        {/* User quantity - shown only if enabled and user has some */}
        {showUserQuantity && ingredient.userQuantity > 0 && (
          <span className="text-xs text-gray-500">
            (masz: {formatQuantity(ingredient.userQuantity, ingredient.unit)})
          </span>
        )}
      </div>
    </li>
  );
};
