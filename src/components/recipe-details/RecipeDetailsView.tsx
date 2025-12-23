import React, { useCallback } from "react";
import { useRecipeDetails } from "@/hooks/useRecipeDetails";
import type { RecipeDetailsViewProps } from "@/types/recipe-details";
import { RecipeDetailsLoadingSkeleton } from "./RecipeDetailsLoadingSkeleton";
import { RecipeDetailsErrorState } from "./RecipeDetailsErrorState";
import { StickyHeader } from "./StickyHeader";
import { RecipeHero } from "./RecipeHero";
import { CookabilityBanner } from "./CookabilityBanner";
import { IngredientsSection } from "./IngredientsSection";
import { InstructionsSection } from "./InstructionsSection";
import { NutritionalInfo } from "./NutritionalInfo";
import { CookingSection } from "./CookingSection";

/**
 * Główny widok szczegółów przepisu
 * Zarządza stanem, pobieraniem danych i renderowaniem komponentów
 */
export const RecipeDetailsView: React.FC<RecipeDetailsViewProps> = ({ recipeId }) => {
  const { recipe, loading, error, isCooking, portions, setPortions, markAsCooked, retry } = useRecipeDetails(recipeId);

  /**
   * Handle navigation back to recipes list
   */
  const handleBack = useCallback(() => {
    window.location.href = "/recipes";
  }, []);

  /**
   * Handle cook complete - show success message
   */
  const handleCookComplete = useCallback(() => {
    // Could show a toast here in the future
    console.log("Recipe marked as cooked successfully");
  }, []);

  /**
   * Handle cook error - show error message
   */
  const handleCookError = useCallback((errorMessage: string) => {
    // Could show an error toast here in the future
    console.error("Error marking as cooked:", errorMessage);
    alert(errorMessage);
  }, []);

  /**
   * Handle mark as cooked with error handling
   */
  const handleMarkAsCooked = useCallback(async () => {
    try {
      await markAsCooked();
      handleCookComplete();
    } catch (err) {
      handleCookError(err instanceof Error ? err.message : "Nie udało się oznaczyć jako ugotowane");
    }
  }, [markAsCooked, handleCookComplete, handleCookError]);

  // Loading state
  if (loading) {
    return <RecipeDetailsLoadingSkeleton />;
  }

  // Error state
  if (error || !recipe) {
    return (
      <RecipeDetailsErrorState
        error={error || "Nie udało się załadować przepisu"}
        onRetry={retry}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <StickyHeader
        recipeName={recipe.name}
        prepTimeMinutes={recipe.prepTimeMinutes}
        calories={recipe.nutritionalValues?.calories ?? null}
        onBack={handleBack}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <RecipeHero
          imageUrl={recipe.imageUrl}
          name={recipe.name}
          mealCategory={recipe.mealCategory}
          proteinType={recipe.proteinType}
          servings={recipe.servings}
        />

        {/* Description */}
        {recipe.description && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-700">{recipe.description}</p>
          </div>
        )}

        {/* Cookability Banner */}
        <CookabilityBanner canCook={recipe.canCook} missingIngredients={recipe.missingIngredients} />

        {/* Ingredients Section */}
        <IngredientsSection ingredients={recipe.ingredients} />

        {/* Instructions Section */}
        <InstructionsSection instructions={recipe.instructions} />

        {/* Nutritional Info */}
        <NutritionalInfo nutritionalValues={recipe.nutritionalValues} servings={recipe.servings} />

        {/* Cooking Section */}
        <CookingSection
          recipeId={recipe.id}
          defaultServings={recipe.servings}
          canCook={recipe.canCook}
          missingIngredients={recipe.missingIngredients}
          portions={portions}
          onPortionsChange={setPortions}
          onCook={handleMarkAsCooked}
          isCooking={isCooking}
        />
      </div>
    </div>
  );
};
