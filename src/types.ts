import type { Database } from './db/database.types';

// Database table type shortcuts for easier access
type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

/** Command Model for user registration */
export interface AuthRegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

/** Command Model for user login */
export interface AuthLoginRequest {
  email: string;
  password: string;
}

/** Command Model for password reset request */
export interface ForgotPasswordRequest {
  email: string;
}

/** Command Model for password reset completion */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/** Command Model for email verification */
export interface VerifyEmailRequest {
  token: string;
}

/** Public user data DTO - excludes sensitive information */
export interface UserDTO {
  id: string;
  email: string;
  isDemo: boolean;
  isEmailVerified: boolean;
}

/** Authentication response DTO */
export interface AuthResponse {
  success: boolean;
  user: UserDTO;
  accessToken: string;
}

/** Standard API success response */
export interface ApiSuccessResponse {
  success: true;
  message: string;
}

// =============================================================================
// PRODUCT CATEGORY TYPES
// =============================================================================

/** Product category DTO - directly mapped from database */
export type ProductCategoryDTO = Pick<
  Tables['product_categories']['Row'],
  'id' | 'name' | 'description'
>;

/** Response DTO for product categories list */
export interface ProductCategoriesResponse {
  categories: ProductCategoryDTO[];
}

// =============================================================================
// USER PRODUCTS TYPES (FRIDGE INVENTORY)
// =============================================================================

/** Enhanced user product DTO with computed fields */
export interface UserProductDTO {
  id: string;
  name: string;
  categoryId: number;
  categoryName: string;
  quantity: number;
  unit: Enums['unit_type'];
  expiresAt: string | null;
  createdAt: string;
  isExpired: boolean;
  daysUntilExpiry: number | null;
}

/** Command Model for creating user product */
export interface CreateUserProductRequest {
  name: string;
  categoryId: number;
  quantity: number;
  unit: Enums['unit_type'];
  expiresAt?: string;
}

/** Command Model for updating user product */
export interface UpdateUserProductRequest {
  name: string;
  categoryId: number;
  quantity: number;
  unit: Enums['unit_type'];
  expiresAt?: string;
}

/** Response DTO for user products list with pagination */
export interface UserProductsResponse {
  products: UserProductDTO[];
  pagination: PaginationDTO;
}

/** Response DTO for single user product operation */
export interface UserProductResponse {
  success: boolean;
  product: UserProductDTO;
}

// =============================================================================
// RECIPE TYPES
// =============================================================================

/** Nutritional values structure for recipes */
export interface NutritionalValuesDTO {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

/** Basic recipe DTO for list views */
export interface RecipeDTO {
  id: string;
  name: string;
  description: string | null;
  mealCategory: Enums['meal_category'];
  proteinType: Enums['protein_type'];
  prepTimeMinutes: number;
  servings: number;
  nutritionalValues: NutritionalValuesDTO | null;
  imageUrl: string | null;
  createdAt: string;
}

/** Enhanced recipe ingredient DTO with user inventory status */
export interface RecipeIngredientDTO {
  id: string;
  name: string;
  quantity: number;
  unit: Enums['unit_type'];
  isRequired: boolean;
  userHasIngredient: boolean;
  userQuantity: number;
}

/** Detailed recipe DTO with ingredients and cooking status */
export interface RecipeDetailDTO extends RecipeDTO {
  instructions: string;
  ingredients: RecipeIngredientDTO[];
  canCook: boolean;
  missingIngredients: string[];
}

/** Response DTO for recipes list */
export interface RecipesResponse {
  recipes: RecipeDTO[];
  pagination: PaginationDTO;
}

/** Response DTO for single recipe detail */
export interface RecipeDetailResponse {
  recipe: RecipeDetailDTO;
}

// =============================================================================
// AI RECIPE RECOMMENDATION TYPES
// =============================================================================

/** Match level for AI recipe recommendations */
export type RecipeMatchLevel = 'idealny' | 'prawie idealny' | 'wymaga dokupienia';

/** AI recipe recommendation DTO */
export interface AIRecipeRecommendationDTO {
  recipe: Pick<RecipeDTO, 'id' | 'name' | 'mealCategory' | 'prepTimeMinutes' | 'nutritionalValues'>;
  matchScore: number;
  matchLevel: RecipeMatchLevel;
  availableIngredients: number;
  missingIngredients: string[];
  usingExpiringIngredients: string[];
}

/** Response DTO for AI recipe recommendations */
export interface AIRecipeRecommendationsResponse {
  recommendations: AIRecipeRecommendationDTO[];
  cacheUsed: boolean;
  generatedAt: string;
}

// =============================================================================
// USER PREFERENCES TYPES
// =============================================================================

/** User dietary preferences DTO */
export interface UserPreferencesDTO {
  id: string;
  maxMeatMealsPerWeek: number | null;
  minFishMealsPerWeek: number | null;
  maxFishMealsPerWeek: number | null;
  vegeMealsPerWeek: number | null;
  eggBreakfastsPerWeek: number | null;
  eggDinnersPerWeek: number | null;
  sweetBreakfastRatio: number | null;
  dailyCalories: number | null;
  additionalPreferences: Record<string, any> | null;
}

/** Command Model for updating user preferences */
export interface UpdateUserPreferencesRequest {
  maxMeatMealsPerWeek?: number;
  minFishMealsPerWeek?: number;
  maxFishMealsPerWeek?: number;
  vegeMealsPerWeek?: number;
  eggBreakfastsPerWeek?: number;
  eggDinnersPerWeek?: number;
  sweetBreakfastRatio?: number;
  dailyCalories?: number;
}

/** Response DTO for user preferences */
export interface UserPreferencesResponse {
  preferences: UserPreferencesDTO;
}

/** Response DTO for user preferences update */
export interface UpdateUserPreferencesResponse {
  success: boolean;
  preferences: UserPreferencesDTO & {
    updatedAt: string;
  };
}

// =============================================================================
// WEEKLY MEAL PLAN TYPES
// =============================================================================

/** Basic weekly meal plan DTO for list views */
export interface WeeklyMealPlanDTO {
  id: string;
  name: string;
  weekStartDate: string;
  isActive: boolean;
  generatedAt: string;
  mealsCount: number;
}

/** Meal plan item DTO with recipe information */
export interface MealPlanItemDTO {
  id: string;
  mealDate: string;
  mealType: Enums['meal_type'];
  portions: number;
  recipe: {
    id: string;
    name: string;
    prepTimeMinutes: number;
    nutritionalValues: NutritionalValuesDTO | null;
  };
  canCook: boolean;
  missingIngredients: string[];
}

/** Shopping list item for meal plan */
export interface ShoppingListItemDTO {
  ingredient: string;
  totalQuantity: number;
  unit: Enums['unit_type'];
  userHas: number;
  needToBuy: number;
}

/** Detailed weekly meal plan DTO with all meals */
export interface WeeklyMealPlanDetailDTO extends WeeklyMealPlanDTO {
  meals: MealPlanItemDTO[];
  totalCaloriesPerDay: Record<string, number>;
  shoppingList: ShoppingListItemDTO[];
}

/** Command Model for generating weekly meal plan */
export interface CreateWeeklyMealPlanRequest {
  weekStartDate: string;
  name: string;
  usePreferences?: boolean;
  prioritizeExpiringIngredients?: boolean;
  targetCaloriesPerDay?: number;
}

/** Command Model for updating weekly meal plan */
export interface UpdateWeeklyMealPlanRequest {
  name?: string;
  isActive?: boolean;
}

/** Command Model for updating meal plan item */
export interface UpdateMealPlanItemRequest {
  recipeId: string;
  portions: number;
}

/** Response DTO for weekly meal plans list */
export interface WeeklyMealPlansResponse {
  mealPlans: WeeklyMealPlanDTO[];
  pagination: PaginationDTO;
}

/** Response DTO for single weekly meal plan detail */
export interface WeeklyMealPlanDetailResponse {
  mealPlan: WeeklyMealPlanDetailDTO;
}

/** Response DTO for meal plan creation */
export interface CreateWeeklyMealPlanResponse {
  success: boolean;
  mealPlan: WeeklyMealPlanDTO;
  message: string;
}

/** Response DTO for meal plan item update */
export interface UpdateMealPlanItemResponse {
  success: boolean;
  mealItem: {
    id: string;
    mealDate: string;
    mealType: Enums['meal_type'];
    portions: number;
    recipe: {
      id: string;
      name: string;
    };
  };
}

// =============================================================================
// COOKED MEALS TYPES
// =============================================================================

/** Cooked meal DTO with recipe information */
export interface CookedMealDTO {
  id: string;
  cookedAt: string;
  portionsCount: number;
  recipe: {
    id: string;
    name: string;
  };
  mealPlanItemId: string | null;
  ingredientsDeducted: boolean;
}

/** Command Model for creating cooked meal */
export interface CreateCookedMealRequest {
  recipeId: string;
  portionsCount: number;
  mealPlanItemId?: string;
}

/** Inventory update item for cooked meal response */
export interface InventoryUpdateDTO {
  productId: string;
  productName: string;
  oldQuantity: number;
  newQuantity: number;
  deducted: number;
  unit: Enums['unit_type'];
}

/** Response DTO for cooked meals list */
export interface CookedMealsResponse {
  cookedMeals: CookedMealDTO[];
  pagination: PaginationDTO;
}

/** Response DTO for cooked meal creation */
export interface CreateCookedMealResponse {
  success: boolean;
  cookedMeal: {
    id: string;
    recipeId: string;
    portionsCount: number;
    cookedAt: string;
    mealPlanItemId: string | null;
  };
  inventoryUpdates: InventoryUpdateDTO[];
  insufficientIngredients: string[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Generic pagination DTO */
export interface PaginationDTO {
  total: number;
  limit: number;
  offset: number;
}

/** Generic API error response */
export interface ApiErrorResponse {
  error: boolean;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/** Query parameters for list endpoints */
export interface ListQueryParams {
  limit?: number;
  offset?: number;
  sort?: string;
}

/** Query parameters for user products */
export interface UserProductsQueryParams extends ListQueryParams {
  category?: number;
  expired?: boolean;
  expiring_soon?: number;
}

/** Query parameters for recipes */
export interface RecipesQueryParams extends ListQueryParams {
  search?: string;
  meal_category?: Enums['meal_category'];
  protein_type?: Enums['protein_type'];
  max_prep_time?: number;
  available_ingredients?: boolean;
}

/** Query parameters for AI recipe recommendations */
export interface AIRecipeRecommendationsQueryParams {
  meal_category?: Enums['meal_category'];
  max_missing_ingredients?: number;
  prioritize_expiring?: boolean;
  limit?: number;
}

/** Query parameters for weekly meal plans */
export interface WeeklyMealPlansQueryParams extends ListQueryParams {
  active_only?: boolean;
  week_start?: string;
}

/** Query parameters for cooked meals */
export interface CookedMealsQueryParams extends ListQueryParams {
  date_from?: string;
  date_to?: string;
  recipe_id?: string;
}

// =============================================================================
// TYPE EXPORTS FOR CONVENIENCE
// =============================================================================

/** Re-export database enums for convenience */
export type {
  Enums as DatabaseEnums,
  Tables as DatabaseTables
};

/** Match level union type for AI recommendations */
export const RECIPE_MATCH_LEVELS = ['idealny', 'prawie idealny', 'wymaga dokupienia'] as const;

/** Unit type constants for validation */
export const UNIT_TYPES = ['g', 'l', 'szt'] as const;

/** Meal category constants for validation */
export const MEAL_CATEGORIES = ['śniadanie', 'obiad', 'kolacja', 'przekąska'] as const;

/** Meal type constants for validation */
export const MEAL_TYPES = [
  'śniadanie',
  'drugie śniadanie', 
  'obiad',
  'podwieczorek',
  'kolacja'
] as const;

/** Protein type constants for validation */
export const PROTEIN_TYPES = ['ryba', 'drób', 'czerwone mięso', 'vege'] as const;