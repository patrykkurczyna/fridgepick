import { useState, useEffect, useCallback, useMemo } from "react";
import type { RecipeDetailDTO, RecipeDetailResponse, CreateCookedMealResponse } from "@/types";
import type { UseRecipeDetailsReturn, IngredientsViewModel } from "@/types/recipe-details";
import { transformIngredientsToViewModel, isValidUUID, clampPortions } from "@/types/recipe-details";
import { getAccessToken } from "@/hooks/useAuth";

/**
 * Custom hook do zarządzania stanem widoku szczegółów przepisu
 * Obsługuje pobieranie danych, zarządzanie porcjami i oznaczanie jako ugotowane
 */
export const useRecipeDetails = (recipeId: string): UseRecipeDetailsReturn => {
  // Core state
  const [recipe, setRecipe] = useState<RecipeDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCooking, setIsCooking] = useState(false);
  const [cookingResult, setCookingResult] = useState<CreateCookedMealResponse | null>(null);
  const [portions, setPortionsState] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Pobieranie szczegółów przepisu z API
   */
  const fetchRecipeDetails = useCallback(async () => {
    // Validate recipe ID first
    if (!isValidUUID(recipeId)) {
      setError("Nieprawidłowy identyfikator przepisu");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getAccessToken();
      if (!token) {
        setError("Sesja wygasła. Zaloguj się ponownie.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/recipes/${recipeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Przepis nie został znaleziony");
        }
        if (response.status === 401) {
          throw new Error("Sesja wygasła. Zaloguj się ponownie.");
        }
        if (response.status === 429) {
          throw new Error("Zbyt wiele zapytań. Spróbuj ponownie za chwilę.");
        }
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      const data: RecipeDetailResponse = await response.json();

      setRecipe(data.recipe);
      setPortionsState(data.recipe.servings);
      setError(null);
    } catch (err) {
      console.error("Error fetching recipe details:", err);
      setError(err instanceof Error ? err.message : "Nie udało się załadować przepisu");
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  /**
   * Fetch recipe on mount and when recipeId or refreshTrigger changes
   */
  useEffect(() => {
    fetchRecipeDetails();
  }, [fetchRecipeDetails, refreshTrigger]);

  /**
   * Set portions with validation
   */
  const setPortions = useCallback((value: number) => {
    const clampedValue = clampPortions(value, 1, 10);
    setPortionsState(clampedValue);
  }, []);

  /**
   * Mark recipe as cooked - calls POST /api/cooked-meals
   * Note: This endpoint may not exist yet
   */
  const markAsCooked = useCallback(async () => {
    if (!recipe) {
      console.warn("Cannot mark as cooked: no recipe loaded");
      return;
    }

    try {
      setIsCooking(true);

      const token = getAccessToken();
      if (!token) {
        throw new Error("Sesja wygasła. Zaloguj się ponownie.");
      }

      const response = await fetch("/api/cooked-meals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          portionsCount: portions,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesja wygasła. Zaloguj się ponownie.");
        }
        if (response.status === 404) {
          throw new Error("Funkcja oznaczania jako ugotowane nie jest jeszcze dostępna.");
        }

        // Try to parse error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Błąd serwera: ${response.status}`);
        } catch {
          throw new Error(`Błąd serwera: ${response.status}`);
        }
      }

      const result: CreateCookedMealResponse = await response.json();
      setCookingResult(result);
    } catch (err) {
      console.error("Error marking as cooked:", err);
      throw err;
    } finally {
      setIsCooking(false);
    }
  }, [recipe, portions]);

  /**
   * Retry fetching recipe data
   */
  const retry = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  /**
   * Clear cooking result
   */
  const clearCookingResult = useCallback(() => {
    setCookingResult(null);
  }, []);

  /**
   * Computed: Transform ingredients to ViewModel
   */
  const ingredientsViewModel: IngredientsViewModel | null = useMemo(() => {
    if (!recipe?.ingredients) return null;
    return transformIngredientsToViewModel(recipe.ingredients);
  }, [recipe?.ingredients]);

  /**
   * Return memoized object to prevent unnecessary re-renders
   */
  return useMemo(
    () => ({
      // State
      recipe,
      loading,
      error,
      isCooking,
      portions,
      cookingResult,

      // Computed
      ingredientsViewModel,

      // Actions
      setPortions,
      markAsCooked,
      retry,
      clearCookingResult,
    }),
    [
      recipe,
      loading,
      error,
      isCooking,
      portions,
      cookingResult,
      ingredientsViewModel,
      setPortions,
      markAsCooked,
      retry,
      clearCookingResult,
    ]
  );
};
