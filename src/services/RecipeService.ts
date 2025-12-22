import type {
  RecipeDTO,
  RecipesResponse,
  RecipeDetailDTO,
  RecipeDetailResponse,
  RecipeIngredientDTO,
  RecipesQueryParams,
  PaginationDTO,
  NutritionalValuesDTO,
} from "../types";
import type {
  IRecipeRepository,
  RecipeFilters,
  RecipeRow,
  RecipeWithIngredients,
  RecipeIngredientRow,
} from "../repositories/RecipeRepository";
import { DatabaseError } from "../repositories/ProductCategoryRepository";

/**
 * Service interface for recipes business logic
 */
export interface IRecipeService {
  getRecipes(queryParams?: RecipesQueryParams): Promise<RecipesResponse>;
  getRecipeById(id: string): Promise<RecipeDetailResponse | null>;
}

/**
 * Business logic error class for recipes
 */
export class RecipeServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 400,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "RecipeServiceError";
  }
}

/**
 * Service class for recipes business logic
 * Handles data transformation, filtering, and pagination
 */
export class RecipeService implements IRecipeService {
  constructor(private readonly repository: IRecipeRepository) {}

  /**
   * Retrieves recipes with filtering, sorting, and pagination
   *
   * @param queryParams - Optional query parameters for filtering and pagination
   * @returns Promise<RecipesResponse> Recipes with pagination metadata
   */
  async getRecipes(queryParams: RecipesQueryParams = {}): Promise<RecipesResponse> {
    try {
      console.info("RecipeService: Starting getRecipes", { queryParams });

      const startTime = Date.now();

      // Build filters from query params
      const filters = this.buildFilters(queryParams);

      // Get total count for pagination
      const totalCount = await this.repository.countAll({
        search: filters.search,
        meal_category: filters.meal_category,
        protein_type: filters.protein_type,
        max_prep_time: filters.max_prep_time,
      });

      // Get the actual data
      const dbRecipes = await this.repository.findAll(filters);

      // Transform to DTOs
      const recipes = dbRecipes.map((recipe) => this.transformToDTO(recipe));

      // Build pagination metadata
      const pagination: PaginationDTO = {
        total: totalCount,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
      };

      const responseTime = Date.now() - startTime;

      console.info("RecipeService: getRecipes completed successfully", {
        recipeCount: recipes.length,
        totalCount,
        responseTime: `${responseTime}ms`,
      });

      return {
        recipes,
        pagination,
      };
    } catch (error) {
      console.error("RecipeService: Error in getRecipes", {
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof DatabaseError) {
        throw new RecipeServiceError("Failed to retrieve recipes", "DATABASE_ERROR", 500, {
          originalError: error.message,
        });
      }

      throw error;
    }
  }

  /**
   * Retrieves a single recipe by ID with ingredients
   * TODO: Add userId parameter for inventory availability check
   *
   * @param id - Recipe ID to retrieve
   * @returns Promise<RecipeDetailResponse | null> Recipe detail or null
   */
  async getRecipeById(id: string): Promise<RecipeDetailResponse | null> {
    try {
      console.info("RecipeService: Starting getRecipeById", { recipeId: id });

      const startTime = Date.now();

      const recipeWithIngredients = await this.repository.findById(id);

      if (!recipeWithIngredients) {
        console.debug("RecipeService: Recipe not found", { recipeId: id });
        return null;
      }

      // Transform to detail DTO
      const recipeDetail = this.transformToDetailDTO(recipeWithIngredients);

      const responseTime = Date.now() - startTime;

      console.info("RecipeService: getRecipeById completed successfully", {
        recipeId: id,
        ingredientCount: recipeDetail.ingredients.length,
        responseTime: `${responseTime}ms`,
      });

      return {
        recipe: recipeDetail,
      };
    } catch (error) {
      console.error("RecipeService: Error in getRecipeById", {
        recipeId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof DatabaseError) {
        throw new RecipeServiceError("Failed to retrieve recipe", "DATABASE_ERROR", 500, {
          originalError: error.message,
        });
      }

      throw error;
    }
  }

  /**
   * Transforms database row to RecipeDTO
   *
   * @param dbRecipe - Database recipe row
   * @returns RecipeDTO Transformed DTO
   */
  private transformToDTO(dbRecipe: RecipeRow): RecipeDTO {
    return {
      id: dbRecipe.id,
      name: dbRecipe.name,
      description: dbRecipe.description,
      mealCategory: dbRecipe.meal_category,
      proteinType: dbRecipe.protein_type,
      prepTimeMinutes: dbRecipe.prep_time_minutes,
      servings: dbRecipe.servings,
      nutritionalValues: this.parseNutritionalValues(dbRecipe.nutritional_values),
      imageUrl: dbRecipe.image_url,
      createdAt: dbRecipe.created_at || new Date().toISOString(),
    };
  }

  /**
   * Transforms database row to RecipeDetailDTO with ingredients
   *
   * @param dbRecipe - Database recipe with ingredients
   * @returns RecipeDetailDTO Transformed detail DTO
   */
  private transformToDetailDTO(dbRecipe: RecipeWithIngredients): RecipeDetailDTO {
    // Transform ingredients
    const ingredients: RecipeIngredientDTO[] = dbRecipe.ingredients.map((ing) => this.transformIngredientToDTO(ing));

    // Calculate missing ingredients (those that user doesn't have)
    const missingIngredients = ingredients
      .filter((ing) => ing.isRequired && !ing.userHasIngredient)
      .map((ing) => ing.name);

    // User can cook if no required ingredients are missing
    const canCook = missingIngredients.length === 0;

    return {
      id: dbRecipe.id,
      name: dbRecipe.name,
      description: dbRecipe.description,
      mealCategory: dbRecipe.meal_category,
      proteinType: dbRecipe.protein_type,
      prepTimeMinutes: dbRecipe.prep_time_minutes,
      servings: dbRecipe.servings,
      nutritionalValues: this.parseNutritionalValues(dbRecipe.nutritional_values),
      imageUrl: dbRecipe.image_url,
      createdAt: dbRecipe.created_at || new Date().toISOString(),
      instructions: dbRecipe.instructions,
      ingredients,
      canCook,
      missingIngredients,
    };
  }

  /**
   * Transforms ingredient row to DTO
   * TODO: Implement actual user inventory check
   *
   * @param ingredient - Database ingredient row
   * @returns RecipeIngredientDTO Transformed ingredient DTO
   */
  private transformIngredientToDTO(ingredient: RecipeIngredientRow): RecipeIngredientDTO {
    // TODO: Implement actual user inventory check
    // For now, return false for userHasIngredient and 0 for userQuantity
    return {
      id: ingredient.id,
      name: ingredient.ingredient_name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      isRequired: ingredient.is_required,
      userHasIngredient: false, // TODO: Check against user's inventory
      userQuantity: 0, // TODO: Get from user's inventory
    };
  }

  /**
   * Parses nutritional values from JSON to typed object
   *
   * @param values - Raw nutritional values from database
   * @returns NutritionalValuesDTO | null Parsed values or null
   */
  private parseNutritionalValues(values: Record<string, unknown> | null): NutritionalValuesDTO | null {
    if (!values) return null;

    const calories = values.calories;
    if (typeof calories !== "number") return null;

    return {
      calories,
      protein: typeof values.protein === "number" ? values.protein : undefined,
      carbs: typeof values.carbs === "number" ? values.carbs : undefined,
      fat: typeof values.fat === "number" ? values.fat : undefined,
      fiber: typeof values.fiber === "number" ? values.fiber : undefined,
      sugar: typeof values.sugar === "number" ? values.sugar : undefined,
    };
  }

  /**
   * Builds repository filters from query parameters
   *
   * @param queryParams - Raw query parameters
   * @returns RecipeFilters Validated and sanitized filters
   */
  private buildFilters(queryParams: RecipesQueryParams): RecipeFilters {
    const filters: RecipeFilters = {};

    // Search filter
    if (queryParams.search !== undefined && queryParams.search.trim().length >= 2) {
      filters.search = queryParams.search.trim();
    }

    // Meal category filter
    if (queryParams.meal_category) {
      const validCategories = ["śniadanie", "obiad", "kolacja", "przekąska"];
      if (validCategories.includes(queryParams.meal_category)) {
        filters.meal_category = queryParams.meal_category;
      }
    }

    // Protein type filter
    if (queryParams.protein_type) {
      const validTypes = ["ryba", "drób", "czerwone mięso", "vege"];
      if (validTypes.includes(queryParams.protein_type)) {
        filters.protein_type = queryParams.protein_type;
      }
    }

    // Max prep time filter
    if (queryParams.max_prep_time !== undefined) {
      const maxTime = Number(queryParams.max_prep_time);
      if (!isNaN(maxTime) && maxTime > 0) {
        filters.max_prep_time = maxTime;
      }
    }

    // Sort filter
    if (queryParams.sort) {
      const validSorts = ["name", "prep_time", "created_at"];
      if (validSorts.includes(queryParams.sort)) {
        filters.sort = queryParams.sort as "name" | "prep_time" | "created_at";
      }
    }

    // Pagination
    if (queryParams.limit !== undefined) {
      const limit = Number(queryParams.limit);
      if (!isNaN(limit) && limit > 0 && limit <= 100) {
        filters.limit = limit;
      }
    } else {
      filters.limit = 20; // Default limit
    }

    if (queryParams.offset !== undefined) {
      const offset = Number(queryParams.offset);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    return filters;
  }
}
