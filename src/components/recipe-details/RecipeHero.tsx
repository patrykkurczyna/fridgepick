import React, { useState } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import type { RecipeHeroProps } from "@/types/recipe-details";
import { getMealCategoryBadge, getProteinTypeBadge } from "@/types/recipes";

/** Default placeholder image for recipes without images */
const PLACEHOLDER_IMAGE = "/images/recipe-placeholder.svg";

/**
 * Sekcja wizualna z obrazem przepisu oraz badge'ami kategorii
 */
export const RecipeHero: React.FC<RecipeHeroProps> = ({ imageUrl, name, mealCategory, proteinType, servings }) => {
  const [imageError, setImageError] = useState(false);

  const mealCategoryBadge = getMealCategoryBadge(mealCategory);
  const proteinTypeBadge = getProteinTypeBadge(proteinType);

  /**
   * Handle image load error - fall back to placeholder
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * Get image source with fallback
   */
  const getImageSrc = (): string => {
    if (imageError || !imageUrl) {
      return PLACEHOLDER_IMAGE;
    }
    return imageUrl;
  };

  return (
    <figure className="bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        <img src={getImageSrc()} alt={name} onError={handleImageError} className="w-full h-full object-cover" />

        {/* Badges overlay */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${mealCategoryBadge.className}`}
          >
            {mealCategoryBadge.label}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${proteinTypeBadge.className}`}
          >
            {proteinTypeBadge.label}
          </span>
        </div>

        {/* Servings badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <UserGroupIcon className="w-4 h-4" />
          <span>
            {servings} {servings === 1 ? "porcja" : servings < 5 ? "porcje" : "porcji"}
          </span>
        </div>
      </div>

      {/* Recipe name - visible on larger screens */}
      <figcaption className="hidden md:block p-4 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">{name}</h2>
      </figcaption>
    </figure>
  );
};
