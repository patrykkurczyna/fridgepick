import type { RecipeDetailDTO, RecipeIngredientDTO, NutritionalValuesDTO, CreateCookedMealResponse } from "@/types";
import type { MealCategory, ProteinType } from "./recipes";

// =============================================================================
// AVAILABILITY STATUS TYPES
// =============================================================================

/** Status dostępności składnika */
export type IngredientAvailabilityStatus = "available" | "partial" | "missing";

// =============================================================================
// VIEW MODEL TYPES
// =============================================================================

/** ViewModel dla składnika z obliczonym statusem */
export interface IngredientViewModel extends RecipeIngredientDTO {
  availabilityStatus: IngredientAvailabilityStatus;
  availabilityPercentage: number;
}

/** ViewModel dla sekcji składników */
export interface IngredientsViewModel {
  required: IngredientViewModel[];
  optional: IngredientViewModel[];
  totalCount: number;
  availableCount: number;
  availabilityPercentage: number;
}

/** Stan widoku szczegółów przepisu */
export interface RecipeDetailsViewState {
  recipe: RecipeDetailDTO | null;
  loading: boolean;
  error: string | null;
  isCooking: boolean;
  cookingResult: CreateCookedMealResponse | null;
  portions: number;
}

// =============================================================================
// COMPONENT PROPS INTERFACES
// =============================================================================

/** Propsy głównego widoku */
export interface RecipeDetailsViewProps {
  recipeId: string;
}

/** Propsy dla StickyHeader */
export interface StickyHeaderProps {
  recipeName: string;
  prepTimeMinutes: number;
  calories: number | null;
  onBack: () => void;
}

/** Propsy dla RecipeHero */
export interface RecipeHeroProps {
  imageUrl: string | null;
  name: string;
  mealCategory: MealCategory;
  proteinType: ProteinType;
  servings: number;
}

/** Propsy dla CookabilityBanner */
export interface CookabilityBannerProps {
  canCook: boolean;
  missingIngredients: string[];
}

/** Propsy dla IngredientsSection */
export interface IngredientsSectionProps {
  ingredients: RecipeIngredientDTO[];
}

/** Propsy dla IngredientItem */
export interface IngredientItemProps {
  ingredient: RecipeIngredientDTO;
  showUserQuantity?: boolean;
}

/** Propsy dla AvailabilityIndicator */
export interface AvailabilityIndicatorProps {
  status: IngredientAvailabilityStatus;
  requiredQuantity: number;
  userQuantity: number;
  unit: string;
}

/** Propsy dla InstructionsSection */
export interface InstructionsSectionProps {
  instructions: string;
}

/** Propsy dla NutritionalInfo */
export interface NutritionalInfoProps {
  nutritionalValues: NutritionalValuesDTO | null;
  servings: number;
}

/** Propsy dla CookingSection */
export interface CookingSectionProps {
  recipeId: string;
  defaultServings: number;
  canCook: boolean;
  missingIngredients: string[];
  portions: number;
  onPortionsChange: (portions: number) => void;
  onCook: () => void;
  isCooking: boolean;
}

/** Propsy dla PortionsSelector */
export interface PortionsSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/** Propsy dla CookButton */
export interface CookButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  canCook: boolean;
}

/** Propsy dla RecipeDetailsErrorState */
export interface RecipeDetailsErrorStateProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

// =============================================================================
// HOOK RETURN TYPE
// =============================================================================

/** Return type for useRecipeDetails hook */
export interface UseRecipeDetailsReturn {
  // Stan
  recipe: RecipeDetailDTO | null;
  loading: boolean;
  error: string | null;
  isCooking: boolean;
  portions: number;
  cookingResult: CreateCookedMealResponse | null;

  // Computed
  ingredientsViewModel: IngredientsViewModel | null;

  // Akcje
  setPortions: (portions: number) => void;
  markAsCooked: () => Promise<void>;
  retry: () => void;
  clearCookingResult: () => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Oblicza status dostępności składnika na podstawie wymaganej i posiadanej ilości
 */
export function calculateAvailabilityStatus(required: number, available: number): IngredientAvailabilityStatus {
  if (available >= required) return "available";
  if (available > 0) return "partial";
  return "missing";
}

/**
 * Oblicza procent dostępności składnika
 */
export function calculateAvailabilityPercentage(required: number, available: number): number {
  if (required <= 0) return 100;
  const percentage = (available / required) * 100;
  return Math.min(100, Math.round(percentage));
}

/**
 * Transformuje pojedynczy składnik do ViewModel
 */
export function transformIngredientToViewModel(ingredient: RecipeIngredientDTO): IngredientViewModel {
  const availabilityStatus = calculateAvailabilityStatus(ingredient.quantity, ingredient.userQuantity);
  const availabilityPercentage = calculateAvailabilityPercentage(ingredient.quantity, ingredient.userQuantity);

  return {
    ...ingredient,
    availabilityStatus,
    availabilityPercentage,
  };
}

/**
 * Transformuje listę składników do IngredientsViewModel
 */
export function transformIngredientsToViewModel(ingredients: RecipeIngredientDTO[]): IngredientsViewModel {
  const viewModelIngredients = ingredients.map(transformIngredientToViewModel);

  const required = viewModelIngredients.filter((ing) => ing.isRequired);
  const optional = viewModelIngredients.filter((ing) => !ing.isRequired);

  const totalCount = ingredients.length;
  const availableCount = viewModelIngredients.filter((ing) => ing.availabilityStatus === "available").length;
  const availabilityPercentage = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;

  return {
    required,
    optional,
    totalCount,
    availableCount,
    availabilityPercentage,
  };
}

/**
 * Waliduje czy ID jest poprawnym UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Clamp wartości porcji do zakresu
 */
export function clampPortions(value: number, min = 1, max = 10): number {
  return Math.max(min, Math.min(max, Math.floor(value)));
}
