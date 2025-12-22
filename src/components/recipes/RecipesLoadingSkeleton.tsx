import React from "react";
import type { RecipesLoadingSkeletonProps } from "@/types/recipes";

/**
 * Loading placeholder displaying skeleton cards while recipes are being fetched
 * Shows animated gray boxes for image, title, and badges
 */
export const RecipesLoadingSkeleton: React.FC<RecipesLoadingSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

/**
 * Individual skeleton card component
 */
const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video bg-gray-200" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title placeholder */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />

        {/* Description placeholder */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>

        {/* Badges placeholder */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>

        {/* Meta info placeholder */}
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
};
