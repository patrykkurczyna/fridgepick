import React from "react";
import type { MatchScoreIndicatorProps } from "@/types/recommendations";
import { getMatchLevelConfig } from "@/types/recommendations";

/**
 * Visual indicator showing the match score as a progress bar
 * with percentage and color coding based on match level
 */
export const MatchScoreIndicator: React.FC<MatchScoreIndicatorProps> = ({ score, matchLevel }) => {
  const config = getMatchLevelConfig(matchLevel);
  const percentage = Math.round(score * 100);

  // Determine progress bar color based on match level
  const getProgressColor = (): string => {
    switch (matchLevel) {
      case "idealny":
        return "bg-green-500";
      case "prawie idealny":
        return "bg-yellow-500";
      case "wymaga dokupienia":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Progress bar container */}
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Dopasowanie: ${percentage}%`}
        />
      </div>

      {/* Percentage label */}
      <span className={`text-sm font-medium ${config.textColor} min-w-[3rem] text-right`}>{percentage}%</span>
    </div>
  );
};

MatchScoreIndicator.displayName = "MatchScoreIndicator";
