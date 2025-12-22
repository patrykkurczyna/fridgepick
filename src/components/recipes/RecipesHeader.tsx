import React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import type { RecipesHeaderProps } from "@/types/recipes";

/**
 * Header section with page title and navigation to AI recommendations
 */
export const RecipesHeader: React.FC<RecipesHeaderProps> = ({ totalCount, loading }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title and count */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Przepisy</h1>
            <p className="text-gray-600 mt-1">
              {loading ? (
                <span className="inline-block w-24 h-4 bg-gray-200 rounded animate-pulse" />
              ) : (
                <>
                  Znaleziono <strong>{totalCount}</strong> {getRecipesLabel(totalCount)}
                </>
              )}
            </p>
          </div>

          {/* AI Recommendations button */}
          <RecommendationsButton />
        </div>
      </div>
    </header>
  );
};

/**
 * Button linking to AI recipe matching feature
 */
const RecommendationsButton: React.FC<{ href?: string }> = ({ href = "/recipes/recommendations" }) => {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
    >
      <SparklesIcon className="w-5 h-5" />
      Dopasuj przepisy AI
    </a>
  );
};

/**
 * Get proper Polish grammatical form for recipe count
 */
function getRecipesLabel(count: number): string {
  if (count === 1) return "przepis";
  if (count >= 2 && count <= 4) return "przepisy";
  if (count >= 5 && count <= 21) return "przepisów";
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "przepisów";
  if (lastDigit >= 2 && lastDigit <= 4) return "przepisy";
  return "przepisów";
}
