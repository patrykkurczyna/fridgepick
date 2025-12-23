import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Enums } from "../db/database.types";
import { DatabaseError } from "./ProductCategoryRepository";

/**
 * Filter parameters for recipes queries
 */
export interface RecipeFilters {
  search?: string;
  meal_category?: Enums["meal_category"];
  protein_type?: Enums["protein_type"];
  max_prep_time?: number;
  sort?: "name" | "prep_time" | "created_at";
  limit?: number;
  offset?: number;
}

/**
 * Raw database row for recipe
 */
export interface RecipeRow {
  id: string;
  name: string;
  description: string | null;
  instructions: string;
  meal_category: Enums["meal_category"];
  protein_type: Enums["protein_type"];
  prep_time_minutes: number;
  servings: number;
  nutritional_values: Record<string, unknown> | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Recipe ingredient row from database
 */
export interface RecipeIngredientRow {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity: number;
  unit: Enums["unit_type"];
  is_required: boolean;
}

/**
 * Recipe with ingredients for detail view
 */
export interface RecipeWithIngredients extends RecipeRow {
  ingredients: RecipeIngredientRow[];
}

/**
 * Repository interface for recipes data access
 */
export interface IRecipeRepository {
  findAll(filters?: RecipeFilters): Promise<RecipeRow[]>;
  findAllWithIngredients(filters?: RecipeFilters): Promise<RecipeWithIngredients[]>;
  countAll(filters?: Omit<RecipeFilters, "limit" | "offset" | "sort">): Promise<number>;
  findById(id: string): Promise<RecipeWithIngredients | null>;
}

/**
 * Repository class for recipes data access layer
 * Handles all database interactions for recipes table
 */
export class RecipeRepository implements IRecipeRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Retrieves recipes with optional filtering, sorting, and pagination
   *
   * @param filters - Optional filters for meal category, protein type, etc.
   * @returns Promise<RecipeRow[]> Array of recipe records
   * @throws {DatabaseError} When database query fails
   */
  async findAll(filters: RecipeFilters = {}): Promise<RecipeRow[]> {
    try {
      console.info("RecipeRepository: Starting findAll query", { filters });

      const queryStartTime = Date.now();

      // Build the base query - only get active recipes
      let query = this.supabase
        .from("recipes")
        .select(
          `
          id,
          name,
          description,
          instructions,
          meal_category,
          protein_type,
          prep_time_minutes,
          servings,
          nutritional_values,
          image_url,
          is_active,
          created_at,
          updated_at
        `
        )
        .eq("is_active", true);

      // Apply filters
      if (filters.search && filters.search.trim().length >= 2) {
        query = query.ilike("name", `%${filters.search.trim()}%`);
      }

      if (filters.meal_category) {
        query = query.eq("meal_category", filters.meal_category);
      }

      if (filters.protein_type) {
        query = query.eq("protein_type", filters.protein_type);
      }

      if (filters.max_prep_time) {
        query = query.lte("prep_time_minutes", filters.max_prep_time);
      }

      // Apply sorting
      if (filters.sort) {
        const sortField = filters.sort === "prep_time" ? "prep_time_minutes" : filters.sort;
        query = query.order(sortField);
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      const queryTime = Date.now() - queryStartTime;

      if (error) {
        console.error("RecipeRepository: Database error in findAll", {
          error: error.message,
          code: error.code,
          queryTime: `${queryTime}ms`,
        });

        throw new DatabaseError("Failed to fetch recipes from database", error, error.code || "RECIPES_QUERY_ERROR");
      }

      console.debug("RecipeRepository: findAll query executed successfully", {
        queryTime: `${queryTime}ms`,
        rowCount: (data || []).length,
      });

      return (data || []) as RecipeRow[];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }

      console.error("RecipeRepository: Unexpected error in findAll", {
        error: error instanceof Error ? error.message : String(error),
      });

      throw new DatabaseError("Unexpected error occurred while fetching recipes", error, "UNEXPECTED_ERROR");
    }
  }

  /**
   * Retrieves recipes with ingredients in TWO queries (not N+1)
   * Optimized for batch fetching to avoid Cloudflare subrequest limits
   *
   * @param filters - Optional filters for meal category, protein type, etc.
   * @returns Promise<RecipeWithIngredients[]> Array of recipes with ingredients
   * @throws {DatabaseError} When database query fails
   */
  async findAllWithIngredients(filters: RecipeFilters = {}): Promise<RecipeWithIngredients[]> {
    try {
      console.info("RecipeRepository: Starting findAllWithIngredients query", { filters });

      const queryStartTime = Date.now();

      // Step 1: Get all recipes matching filters
      const recipes = await this.findAll(filters);

      if (recipes.length === 0) {
        console.debug("RecipeRepository: No recipes found, skipping ingredients fetch");
        return [];
      }

      // Step 2: Get all ingredients for these recipes in ONE query
      const recipeIds = recipes.map((r) => r.id);

      const { data: ingredientsData, error: ingredientsError } = await this.supabase
        .from("recipe_ingredients")
        .select(
          `
          id,
          recipe_id,
          ingredient_name,
          quantity,
          unit,
          is_required
        `
        )
        .in("recipe_id", recipeIds)
        .order("is_required", { ascending: false })
        .order("ingredient_name");

      if (ingredientsError) {
        console.error("RecipeRepository: Database error fetching ingredients batch", {
          error: ingredientsError.message,
          code: ingredientsError.code,
          recipeCount: recipeIds.length,
        });

        throw new DatabaseError(
          "Failed to fetch recipe ingredients",
          ingredientsError,
          ingredientsError.code || "RECIPE_INGREDIENTS_BATCH_ERROR"
        );
      }

      // Step 3: Group ingredients by recipe_id
      const ingredientsByRecipeId = new Map<string, RecipeIngredientRow[]>();
      for (const ing of ingredientsData || []) {
        const existing = ingredientsByRecipeId.get(ing.recipe_id) || [];
        existing.push(ing as RecipeIngredientRow);
        ingredientsByRecipeId.set(ing.recipe_id, existing);
      }

      // Step 4: Combine recipes with their ingredients
      const recipesWithIngredients: RecipeWithIngredients[] = recipes.map((recipe) => ({
        ...recipe,
        ingredients: ingredientsByRecipeId.get(recipe.id) || [],
      }));

      const queryTime = Date.now() - queryStartTime;

      console.debug("RecipeRepository: findAllWithIngredients completed", {
        queryTime: `${queryTime}ms`,
        recipeCount: recipesWithIngredients.length,
        totalIngredients: (ingredientsData || []).length,
      });

      return recipesWithIngredients;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }

      console.error("RecipeRepository: Unexpected error in findAllWithIngredients", {
        error: error instanceof Error ? error.message : String(error),
      });

      throw new DatabaseError(
        "Unexpected error occurred while fetching recipes with ingredients",
        error,
        "UNEXPECTED_ERROR"
      );
    }
  }

  /**
   * Counts total recipes matching filters (for pagination)
   *
   * @param filters - Optional filters excluding pagination parameters
   * @returns Promise<number> Total count of matching recipes
   * @throws {DatabaseError} When database query fails
   */
  async countAll(filters: Omit<RecipeFilters, "limit" | "offset" | "sort"> = {}): Promise<number> {
    try {
      console.debug("RecipeRepository: Starting countAll query", { filters });

      let query = this.supabase.from("recipes").select("*", { count: "exact", head: true }).eq("is_active", true);

      // Apply the same filters as findAll (excluding pagination/sort)
      if (filters.search && filters.search.trim().length >= 2) {
        query = query.ilike("name", `%${filters.search.trim()}%`);
      }

      if (filters.meal_category) {
        query = query.eq("meal_category", filters.meal_category);
      }

      if (filters.protein_type) {
        query = query.eq("protein_type", filters.protein_type);
      }

      if (filters.max_prep_time) {
        query = query.lte("prep_time_minutes", filters.max_prep_time);
      }

      const { count, error } = await query;

      if (error) {
        console.error("RecipeRepository: Database error in countAll", {
          error: error.message,
          code: error.code,
        });

        throw new DatabaseError("Failed to count recipes", error, error.code || "RECIPES_COUNT_ERROR");
      }

      return count || 0;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError("Unexpected error occurred while counting recipes", error, "UNEXPECTED_ERROR");
    }
  }

  /**
   * Finds a single recipe by ID with its ingredients
   *
   * @param id - Recipe ID to find
   * @returns Promise<RecipeWithIngredients | null> Recipe with ingredients or null
   * @throws {DatabaseError} When database query fails
   */
  async findById(id: string): Promise<RecipeWithIngredients | null> {
    try {
      console.debug("RecipeRepository: Starting findById query", { recipeId: id });

      // Get recipe
      const { data: recipeData, error: recipeError } = await this.supabase
        .from("recipes")
        .select(
          `
          id,
          name,
          description,
          instructions,
          meal_category,
          protein_type,
          prep_time_minutes,
          servings,
          nutritional_values,
          image_url,
          is_active,
          created_at,
          updated_at
        `
        )
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (recipeError) {
        if (recipeError.code === "PGRST116") {
          console.debug("RecipeRepository: Recipe not found", { recipeId: id });
          return null;
        }

        console.error("RecipeRepository: Database error in findById (recipe)", {
          error: recipeError.message,
          code: recipeError.code,
          recipeId: id,
        });

        throw new DatabaseError(
          "Failed to find recipe by ID",
          recipeError,
          recipeError.code || "RECIPE_FINDBYID_ERROR"
        );
      }

      if (!recipeData) {
        return null;
      }

      // Get ingredients for the recipe
      const { data: ingredientsData, error: ingredientsError } = await this.supabase
        .from("recipe_ingredients")
        .select(
          `
          id,
          recipe_id,
          ingredient_name,
          quantity,
          unit,
          is_required
        `
        )
        .eq("recipe_id", id)
        .order("is_required", { ascending: false })
        .order("ingredient_name");

      if (ingredientsError) {
        console.error("RecipeRepository: Database error in findById (ingredients)", {
          error: ingredientsError.message,
          code: ingredientsError.code,
          recipeId: id,
        });

        throw new DatabaseError(
          "Failed to fetch recipe ingredients",
          ingredientsError,
          ingredientsError.code || "RECIPE_INGREDIENTS_ERROR"
        );
      }

      console.debug("RecipeRepository: Recipe found successfully", {
        recipeId: id,
        ingredientCount: (ingredientsData || []).length,
      });

      return {
        ...(recipeData as RecipeRow),
        ingredients: (ingredientsData || []) as RecipeIngredientRow[],
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError("Unexpected error occurred while finding recipe by ID", error, "UNEXPECTED_ERROR");
    }
  }
}
