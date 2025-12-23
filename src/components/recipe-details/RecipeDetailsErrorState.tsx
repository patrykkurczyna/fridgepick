import React from "react";
import { ExclamationCircleIcon, ArrowPathIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { RecipeDetailsErrorStateProps } from "@/types/recipe-details";

/**
 * Komponent wyświetlany w przypadku błędu ładowania przepisu
 */
export const RecipeDetailsErrorState: React.FC<RecipeDetailsErrorStateProps> = ({ error, onRetry, onBack }) => {
  /**
   * Handle keyboard navigation for buttons
   */
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-6 text-center">
        {/* Error icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ExclamationCircleIcon className="w-10 h-10 text-red-600" />
        </div>

        {/* Error title */}
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Wystąpił błąd</h1>

        {/* Error message */}
        <p className="text-gray-600 mb-6">{error}</p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Retry button */}
          <button
            onClick={onRetry}
            onKeyDown={(e) => handleKeyDown(e, onRetry)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Spróbuj ponownie
          </button>

          {/* Back button */}
          <button
            onClick={onBack}
            onKeyDown={(e) => handleKeyDown(e, onBack)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Wróć do przepisów
          </button>
        </div>
      </div>
    </div>
  );
};
