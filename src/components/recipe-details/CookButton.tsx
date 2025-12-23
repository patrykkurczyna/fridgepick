import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import type { CookButtonProps } from "@/types/recipe-details";

/**
 * Przycisk akcji "Ugotowane" z obsługą stanu ładowania i disabled
 */
export const CookButton: React.FC<CookButtonProps> = ({ onClick, disabled, isLoading, canCook }) => {
  const isDisabled = disabled || isLoading || !canCook;

  /**
   * Get button text based on state
   */
  const getButtonText = (): string => {
    if (isLoading) return "Zapisuję...";
    if (!canCook) return "Brakuje składników";
    return "Oznacz jako ugotowane";
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      className={`
        w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg
        font-medium text-base transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white cursor-pointer focus:ring-green-500"
        }
      `}
      aria-label={getButtonText()}
    >
      {/* Icon */}
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <CheckIcon className="w-5 h-5" />
      )}

      {/* Text */}
      <span>{getButtonText()}</span>
    </button>
  );
};
