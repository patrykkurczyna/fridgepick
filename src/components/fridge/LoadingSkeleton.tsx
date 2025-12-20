import React from "react";

interface LoadingSkeletonProps {
  count?: number;
  variant?: "card" | "list";
}

/**
 * Placeholder skeleton podczas ładowania listy produktów
 * Shimmer effect w layout podobnym do ProductCard
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 6, variant = "card" }) => {
  const items = Array.from({ length: count }, (_, index) => index);

  if (variant === "list") {
    return (
      <div className="space-y-4">
        {items.map((index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="animate-pulse">
            {/* Header z nazwą i akcjami */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {/* Nazwa produktu */}
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                {/* Kategoria */}
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>

              {/* Action buttons placeholder */}
              <div className="flex items-center gap-1 ml-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Ilość i warning icon placeholder */}
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>

            {/* Data ważności placeholder */}
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>

            {/* Dodana data placeholder */}
            <div className="h-2 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
};
