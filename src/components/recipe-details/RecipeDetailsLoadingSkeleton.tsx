import React from "react";

/**
 * Skeleton placeholder component
 */
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

/**
 * Komponent skeleton wyświetlany podczas ładowania danych przepisu
 */
export const RecipeDetailsLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Skeleton */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <Skeleton className="aspect-video w-full" />
          <div className="hidden md:block p-4 border-t border-gray-100">
            <Skeleton className="h-7 w-64" />
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Cookability Banner Skeleton */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        {/* Ingredients Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="p-4 space-y-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* Nutritional Info Skeleton */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Cooking Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-full sm:w-48 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
