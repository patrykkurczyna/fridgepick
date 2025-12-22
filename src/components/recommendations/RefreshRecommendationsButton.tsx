import React, { useState, useEffect } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { RefreshRecommendationsButtonProps } from "@/types/recommendations";

/**
 * Format remaining time for display
 */
const formatRemainingTime = (remainingMs: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Format generation time for tooltip
 */
const formatGeneratedAt = (isoString: string | null): string => {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    return date.toLocaleString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return "";
  }
};

/**
 * Button to manually trigger AI recommendation refresh
 * with rate limiting feedback and cooldown timer
 */
export const RefreshRecommendationsButton: React.FC<RefreshRecommendationsButtonProps> = ({
  onRefresh,
  isRefreshing,
  isRateLimited,
  rateLimitResetTime,
  lastGeneratedAt,
}) => {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Update countdown every second when rate limited
  useEffect(() => {
    if (!rateLimitResetTime) {
      setRemainingTime(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, rateLimitResetTime - Date.now());
      setRemainingTime(remaining);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [rateLimitResetTime]);

  const isDisabled = isRefreshing || isRateLimited;
  const generatedAtText = formatGeneratedAt(lastGeneratedAt);

  /**
   * Handle button click
   */
  const handleClick = () => {
    if (!isDisabled) {
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg
          transition-all shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${
            isDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 cursor-pointer"
          }
        `}
        aria-label={isRateLimited ? `Odczekaj ${formatRemainingTime(remainingTime)}` : "Odswiez rekomendacje"}
        title={generatedAtText ? `Ostatnio wygenerowano: ${generatedAtText}` : undefined}
      >
        <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
        {isRateLimited ? (
          <span>Odczekaj {formatRemainingTime(remainingTime)}</span>
        ) : isRefreshing ? (
          <span>Odswiezam...</span>
        ) : (
          <span>Odswiez</span>
        )}
      </button>

      {/* Last generated timestamp */}
      {generatedAtText && !isRefreshing && (
        <span className="text-xs text-gray-500">Wygenerowano: {generatedAtText}</span>
      )}
    </div>
  );
};

RefreshRecommendationsButton.displayName = "RefreshRecommendationsButton";
