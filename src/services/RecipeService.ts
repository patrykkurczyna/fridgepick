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
import type { IUserProductRepository, UserProductWithCategory } from "../repositories/UserProductRepository";
import { DatabaseError } from "../repositories/ProductCategoryRepository";

/**
 * Service interface for recipes business logic
 */
export interface IRecipeService {
  getRecipes(queryParams?: RecipesQueryParams): Promise<RecipesResponse>;
  getRecipeById(id: string, userId?: string): Promise<RecipeDetailResponse | null>;
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
  constructor(
    private readonly repository: IRecipeRepository,
    private readonly userProductRepository?: IUserProductRepository
  ) {}

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
   * If userId is provided, checks ingredient availability against user's inventory
   *
   * @param id - Recipe ID to retrieve
   * @param userId - Optional user ID for inventory availability check
   * @returns Promise<RecipeDetailResponse | null> Recipe detail or null
   */
  async getRecipeById(id: string, userId?: string): Promise<RecipeDetailResponse | null> {
    try {
      console.info("RecipeService: Starting getRecipeById", {
        recipeId: id,
        hasUserId: !!userId,
      });

      const startTime = Date.now();

      const recipeWithIngredients = await this.repository.findById(id);

      if (!recipeWithIngredients) {
        console.debug("RecipeService: Recipe not found", { recipeId: id });
        return null;
      }

      // Fetch user products if userId is provided and repository is available
      let userProducts: UserProductWithCategory[] = [];
      if (userId && this.userProductRepository) {
        try {
          userProducts = await this.userProductRepository.findByUserId(userId, { limit: 500 });
          console.debug("RecipeService: Fetched user products for availability check", {
            userId: userId.substring(0, 8) + "...",
            productCount: userProducts.length,
          });
        } catch (error) {
          // Log but don't fail - just use empty products array
          console.warn("RecipeService: Failed to fetch user products, continuing without availability check", {
            userId: userId.substring(0, 8) + "...",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Transform to detail DTO with user products for availability check
      const recipeDetail = this.transformToDetailDTO(recipeWithIngredients, userProducts);

      const responseTime = Date.now() - startTime;

      console.info("RecipeService: getRecipeById completed successfully", {
        recipeId: id,
        ingredientCount: recipeDetail.ingredients.length,
        canCook: recipeDetail.canCook,
        missingCount: recipeDetail.missingIngredients.length,
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
   * @param userProducts - Optional user products for availability check
   * @returns RecipeDetailDTO Transformed detail DTO
   */
  private transformToDetailDTO(
    dbRecipe: RecipeWithIngredients,
    userProducts: UserProductWithCategory[] = []
  ): RecipeDetailDTO {
    // Transform ingredients with user product availability
    const ingredients: RecipeIngredientDTO[] = dbRecipe.ingredients.map((ing) =>
      this.transformIngredientToDTO(ing, userProducts)
    );

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
   * Transforms ingredient row to DTO with user inventory availability check
   *
   * @param ingredient - Database ingredient row
   * @param userProducts - User's products for availability check
   * @returns RecipeIngredientDTO Transformed ingredient DTO
   */
  private transformIngredientToDTO(
    ingredient: RecipeIngredientRow,
    userProducts: UserProductWithCategory[] = []
  ): RecipeIngredientDTO {
    // Find matching user product
    const matchedProduct = this.findMatchingUserProduct(ingredient.ingredient_name, userProducts);

    // Calculate user quantity (sum if multiple products match)
    let userQuantity = 0;
    let userHasIngredient = false;

    if (matchedProduct) {
      userQuantity = matchedProduct.quantity;
      // User has ingredient if they have any quantity (for non-required)
      // or if they have at least the required amount (for required)
      userHasIngredient = userQuantity >= ingredient.quantity;
    }

    return {
      id: ingredient.id,
      name: ingredient.ingredient_name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      isRequired: ingredient.is_required,
      userHasIngredient,
      userQuantity,
    };
  }

  /**
   * Finds a matching user product for an ingredient
   * Uses fuzzy matching to handle variations like "mleko" vs "mleko 3.2%"
   *
   * @param ingredientName - Name of the ingredient to match
   * @param userProducts - User's products to search
   * @returns Matched product or null
   */
  private findMatchingUserProduct(
    ingredientName: string,
    userProducts: UserProductWithCategory[]
  ): UserProductWithCategory | null {
    if (userProducts.length === 0) return null;

    const normalizedIngredient = this.normalizeProductName(ingredientName);

    // First try exact match
    for (const product of userProducts) {
      const normalizedProduct = this.normalizeProductName(product.name);
      if (normalizedProduct === normalizedIngredient) {
        return product;
      }
    }

    // Then try contains match (product name contains ingredient or vice versa)
    for (const product of userProducts) {
      const normalizedProduct = this.normalizeProductName(product.name);
      if (normalizedProduct.includes(normalizedIngredient) || normalizedIngredient.includes(normalizedProduct)) {
        return product;
      }
    }

    // Try matching first word (e.g., "jajka" matches "jajka kurze L")
    const ingredientFirstWord = normalizedIngredient.split(" ")[0];
    for (const product of userProducts) {
      const productFirstWord = this.normalizeProductName(product.name).split(" ")[0];
      if (productFirstWord === ingredientFirstWord) {
        return product;
      }
    }

    return null;
  }

  /**
   * Normalizes a product/ingredient name for matching
   * - Converts to lowercase
   * - Removes diacritics
   * - Trims whitespace
   *
   * @param name - Name to normalize
   * @returns Normalized name
   */
  private normalizeProductName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
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
