import React, { useState, useEffect } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import type { RateLimitWarningProps } from "@/types/recommendations";

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
 * Warning banner displayed when the user has hit the rate limit
 * for AI recommendations with countdown timer
 */
export const RateLimitWarning: React.FC<RateLimitWarningProps> = ({ resetTime }) => {
  const [remainingTime, setRemainingTime] = useState<number>(Math.max(0, resetTime - Date.now()));

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, resetTime - Date.now());
      setRemainingTime(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTime]);

  // Don't render if time has expired
  if (remainingTime <= 0) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg"
      role="alert"
      aria-live="polite"
    >
      <ExclamationCircleIcon className="w-6 h-6 text-orange-500 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium text-orange-800">Limit zapytan osiagniety</p>
        <p className="text-sm text-orange-600">
          Zbyt wiele zapytan do AI. Odczekaj <span className="font-semibold">{formatRemainingTime(remainingTime)}</span>{" "}
          przed kolejna proba.
        </p>
      </div>
    </div>
  );
};

RateLimitWarning.displayName = "RateLimitWarning";
