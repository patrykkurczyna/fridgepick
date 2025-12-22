import React, { useState } from "react";
import { ClockIcon, UserGroupIcon, FireIcon } from "@heroicons/react/24/outline";
import type { RecipeCardProps } from "@/types/recipes";
import { getMealCategoryBadge, getProteinTypeBadge } from "@/types/recipes";

/** Default placeholder image for recipes without images */
const PLACEHOLDER_IMAGE = "/images/recipe-placeholder.svg";

/**
 * Individual recipe card displaying recipe summary
 * Shows image, name, category, prep time, and nutritional info
 */
export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const mealCategoryBadge = getMealCategoryBadge(recipe.mealCategory);
  const proteinTypeBadge = getProteinTypeBadge(recipe.proteinType);

  /**
   * Handle card click
   */
  const handleClick = () => {
    onClick(recipe.id);
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(recipe.id);
    }
  };

  /**
   * Handle image load error
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * Get image source with fallback
   */
  const getImageSrc = (): string => {
    if (imageError || !recipe.imageUrl) {
      return PLACEHOLDER_IMAGE;
    }
    return recipe.imageUrl;
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={getImageSrc()}
          alt={recipe.name}
          loading="lazy"
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Prep time overlay */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5" />
          {recipe.prepTimeMinutes} min
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {recipe.name}
        </h3>

        {/* Description */}
        {recipe.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mealCategoryBadge.className}`}
          >
            {mealCategoryBadge.label}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proteinTypeBadge.className}`}
          >
            {proteinTypeBadge.label}
          </span>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-600">
          {/* Servings */}
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{recipe.servings} porcji</span>
          </div>

          {/* Calories */}
          {recipe.nutritionalValues?.calories && (
            <div className="flex items-center gap-1">
              <FireIcon className="w-4 h-4" />
              <span>{recipe.nutritionalValues.calories} kcal</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
