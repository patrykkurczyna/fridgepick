import React, { useCallback } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import type { PortionsSelectorProps } from "@/types/recipe-details";

/**
 * Komponent do wyboru liczby porcji z przyciskami +/-
 */
export const PortionsSelector: React.FC<PortionsSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
}) => {
  /**
   * Decrease portions count
   */
  const handleDecrease = useCallback(() => {
    if (value > min) {
      onChange(value - 1);
    }
  }, [value, min, onChange]);

  /**
   * Increase portions count
   */
  const handleIncrease = useCallback(() => {
    if (value < max) {
      onChange(value + 1);
    }
  }, [value, max, onChange]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent, action: "decrease" | "increase") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (action === "decrease") {
        handleDecrease();
      } else {
        handleIncrease();
      }
    }
  };

  const canDecrease = value > min && !disabled;
  const canIncrease = value < max && !disabled;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Porcje:</span>

      <div className="flex items-center">
        {/* Decrease button */}
        <button
          type="button"
          onClick={handleDecrease}
          onKeyDown={(e) => handleKeyDown(e, "decrease")}
          disabled={!canDecrease}
          className={`
            w-8 h-8 flex items-center justify-center rounded-l-lg border border-r-0
            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${
              canDecrease
                ? "bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                : "bg-gray-50 border-gray-200 cursor-not-allowed"
            }
          `}
          aria-label="Zmniejsz liczbę porcji"
        >
          <MinusIcon className={`w-4 h-4 ${canDecrease ? "text-gray-700" : "text-gray-400"}`} />
        </button>

        {/* Value display */}
        <div
          className={`
            w-12 h-8 flex items-center justify-center border-y text-center font-medium
            ${disabled ? "bg-gray-50 text-gray-400 border-gray-200" : "bg-white text-gray-900 border-gray-300"}
          `}
        >
          {value}
        </div>

        {/* Increase button */}
        <button
          type="button"
          onClick={handleIncrease}
          onKeyDown={(e) => handleKeyDown(e, "increase")}
          disabled={!canIncrease}
          className={`
            w-8 h-8 flex items-center justify-center rounded-r-lg border border-l-0
            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${
              canIncrease
                ? "bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
                : "bg-gray-50 border-gray-200 cursor-not-allowed"
            }
          `}
          aria-label="Zwiększ liczbę porcji"
        >
          <PlusIcon className={`w-4 h-4 ${canIncrease ? "text-gray-700" : "text-gray-400"}`} />
        </button>
      </div>
    </div>
  );
};
