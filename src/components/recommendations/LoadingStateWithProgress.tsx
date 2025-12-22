import React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import type { LoadingStateWithProgressProps } from "@/types/recommendations";

/**
 * Loading indicator shown during AI processing
 * with progress indication and helpful message
 */
export const LoadingStateWithProgress: React.FC<LoadingStateWithProgressProps> = ({
  message = "Analizuje Twoje skladniki...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" role="status" aria-live="polite">
      {/* AI Icon with pulse animation */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-400 rounded-full opacity-25 animate-ping" />
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4">
          <SparklesIcon className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
      </div>

      {/* Loading message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>

      {/* Animated dots */}
      <div className="flex items-center gap-1 mb-4">
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>

      {/* Helpful tip */}
      <p className="text-sm text-gray-500 text-center max-w-md">
        AI dobiera najlepsze przepisy na podstawie Twoich skladnikow i preferencji...
      </p>

      {/* Screen reader text */}
      <span className="sr-only">Ladowanie rekomendacji AI, prosze czekac</span>
    </div>
  );
};

LoadingStateWithProgress.displayName = "LoadingStateWithProgress";
