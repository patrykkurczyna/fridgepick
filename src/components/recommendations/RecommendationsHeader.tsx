import React from "react";
import { SparklesIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { RefreshRecommendationsButton } from "./RefreshRecommendationsButton";
import type { RecommendationsHeaderProps } from "@/types/recommendations";

/**
 * Get proper Polish grammatical form for recipe count
 */
function getRecommendationsLabel(count: number): string {
  if (count === 1) return "rekomendacja";
  if (count >= 2 && count <= 4) return "rekomendacje";
  if (count >= 5 && count <= 21) return "rekomendacji";
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "rekomendacji";
  if (lastDigit >= 2 && lastDigit <= 4) return "rekomendacje";
  return "rekomendacji";
}

/**
 * Header section displaying the page title, recommendation count,
 * cache status indicator, and refresh button
 */
export const RecommendationsHeader: React.FC<RecommendationsHeaderProps> = ({
  totalCount,
  loading,
  cacheUsed,
  generatedAt,
  onRefresh,
  isRefreshing,
  isRateLimited,
  rateLimitResetTime,
}) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title and count */}
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-7 h-7 text-blue-600" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-gray-900">Rekomendacje AI</h1>
            </div>

            <div className="flex items-center gap-3 mt-1">
              {loading ? (
                <span className="inline-block w-32 h-4 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-gray-600">
                  Znaleziono <strong>{totalCount}</strong> {getRecommendationsLabel(totalCount)}
                </p>
              )}

              {/* Cache indicator */}
              {!loading && cacheUsed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckBadgeIcon className="w-3.5 h-3.5" aria-hidden="true" />Z cache
                </span>
              )}
            </div>
          </div>

          {/* Refresh button */}
          <RefreshRecommendationsButton
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            isRateLimited={isRateLimited}
            rateLimitResetTime={rateLimitResetTime}
            lastGeneratedAt={generatedAt}
          />
        </div>
      </div>
    </header>
  );
};

RecommendationsHeader.displayName = "RecommendationsHeader";
