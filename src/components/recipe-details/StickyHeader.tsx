import React from "react";
import { ArrowLeftIcon, ClockIcon, FireIcon } from "@heroicons/react/24/outline";
import type { StickyHeaderProps } from "@/types/recipe-details";

/**
 * Przyklejony nagłówek z kluczowymi informacjami o przepisie
 * Pozostaje widoczny podczas przewijania strony
 */
export const StickyHeader: React.FC<StickyHeaderProps> = ({ recipeName, prepTimeMinutes, calories, onBack }) => {
  /**
   * Handle keyboard navigation for back button
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBack();
    }
  };

  /**
   * Truncate recipe name if too long
   */
  const truncatedName = recipeName.length > 40 ? `${recipeName.substring(0, 40)}...` : recipeName;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Back button and title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onBack}
              onKeyDown={handleKeyDown}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Wróć do listy przepisów"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>

            <h1 className="font-semibold text-gray-900 truncate text-lg" title={recipeName}>
              {truncatedName}
            </h1>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Prep time */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{prepTimeMinutes} min</span>
              <span className="sm:hidden">{prepTimeMinutes}&apos;</span>
            </div>

            {/* Calories */}
            {calories !== null && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <FireIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{calories} kcal</span>
                <span className="sm:hidden">{calories}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
