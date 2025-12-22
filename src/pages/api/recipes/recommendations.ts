import type { APIRoute } from "astro";
import type { AIRecipeRecommendationsResponse, AIRecipeRecommendationDTO } from "@/types";
import { requireDemoFriendlyAuth, checkUserRateLimit } from "../../../middleware/auth";
import { HttpStatus, ErrorCode, ApiError, createErrorResponse } from "../../../middleware/errorHandler";

/**
 * Dummy recommendations data for development/testing
 * TODO: Replace with actual AI-powered recommendation logic
 */
const DUMMY_RECOMMENDATIONS: AIRecipeRecommendationDTO[] = [
  {
    recipe: {
      id: "rec-001",
      name: "Jajecznica z pomidorami",
      mealCategory: "śniadanie",
      prepTimeMinutes: 15,
      nutritionalValues: {
        calories: 280,
        protein: 18,
        carbs: 8,
        fat: 20,
      },
    },
    matchScore: 1.0,
    matchLevel: "idealny",
    availableIngredients: 4,
    missingIngredients: [],
    usingExpiringIngredients: ["jajka", "pomidory"],
  },
  {
    recipe: {
      id: "rec-002",
      name: "Salatka grecka",
      mealCategory: "obiad",
      prepTimeMinutes: 20,
      nutritionalValues: {
        calories: 350,
        protein: 12,
        carbs: 15,
        fat: 28,
      },
    },
    matchScore: 0.92,
    matchLevel: "idealny",
    availableIngredients: 6,
    missingIngredients: [],
    usingExpiringIngredients: ["ogorki"],
  },
  {
    recipe: {
      id: "rec-003",
      name: "Makaron z sosem pomidorowym",
      mealCategory: "obiad",
      prepTimeMinutes: 30,
      nutritionalValues: {
        calories: 450,
        protein: 14,
        carbs: 65,
        fat: 12,
      },
    },
    matchScore: 0.85,
    matchLevel: "prawie idealny",
    availableIngredients: 5,
    missingIngredients: ["bazylia"],
    usingExpiringIngredients: ["pomidory"],
  },
  {
    recipe: {
      id: "rec-004",
      name: "Omlet z warzywami",
      mealCategory: "śniadanie",
      prepTimeMinutes: 15,
      nutritionalValues: {
        calories: 320,
        protein: 22,
        carbs: 10,
        fat: 22,
      },
    },
    matchScore: 0.78,
    matchLevel: "prawie idealny",
    availableIngredients: 4,
    missingIngredients: ["papryka"],
    usingExpiringIngredients: ["jajka"],
  },
  {
    recipe: {
      id: "rec-005",
      name: "Kurczak z ryzem",
      mealCategory: "obiad",
      prepTimeMinutes: 45,
      nutritionalValues: {
        calories: 520,
        protein: 35,
        carbs: 55,
        fat: 15,
      },
    },
    matchScore: 0.65,
    matchLevel: "wymaga dokupienia",
    availableIngredients: 3,
    missingIngredients: ["kurczak", "ryz"],
    usingExpiringIngredients: [],
  },
  {
    recipe: {
      id: "rec-006",
      name: "Zupa pomidorowa",
      mealCategory: "obiad",
      prepTimeMinutes: 40,
      nutritionalValues: {
        calories: 180,
        protein: 6,
        carbs: 25,
        fat: 6,
      },
    },
    matchScore: 0.72,
    matchLevel: "prawie idealny",
    availableIngredients: 4,
    missingIngredients: ["makaron"],
    usingExpiringIngredients: ["pomidory", "marchew"],
  },
  {
    recipe: {
      id: "rec-007",
      name: "Kanapki z serem i warzywami",
      mealCategory: "przekąska",
      prepTimeMinutes: 10,
      nutritionalValues: {
        calories: 250,
        protein: 12,
        carbs: 30,
        fat: 10,
      },
    },
    matchScore: 0.55,
    matchLevel: "wymaga dokupienia",
    availableIngredients: 2,
    missingIngredients: ["chleb", "ser zolty"],
    usingExpiringIngredients: [],
  },
  {
    recipe: {
      id: "rec-008",
      name: "Salatka owocowa",
      mealCategory: "przekąska",
      prepTimeMinutes: 10,
      nutritionalValues: {
        calories: 150,
        protein: 2,
        carbs: 35,
        fat: 1,
      },
    },
    matchScore: 0.95,
    matchLevel: "idealny",
    availableIngredients: 5,
    missingIngredients: [],
    usingExpiringIngredients: ["jablka", "banany"],
  },
];

/**
 * Parse and validate query parameters for recommendations
 */
interface RecommendationsQueryParams {
  mealCategory: string | null;
  maxMissingIngredients: number;
  prioritizeExpiring: boolean;
  limit: number;
}

function parseQueryParams(url: URL): RecommendationsQueryParams {
  const mealCategory = url.searchParams.get("meal_category");
  const maxMissingStr = url.searchParams.get("max_missing_ingredients");
  const prioritizeExpiringStr = url.searchParams.get("prioritize_expiring");
  const limitStr = url.searchParams.get("limit");

  return {
    mealCategory: mealCategory || null,
    maxMissingIngredients: maxMissingStr ? Math.min(5, Math.max(0, parseInt(maxMissingStr, 10))) : 3,
    prioritizeExpiring: prioritizeExpiringStr === "true",
    limit: limitStr ? Math.min(50, Math.max(1, parseInt(limitStr, 10))) : 20,
  };
}

/**
 * Filter dummy recommendations based on query params
 * TODO: This will be replaced with actual AI recommendation logic
 */
function filterRecommendations(
  recommendations: AIRecipeRecommendationDTO[],
  params: RecommendationsQueryParams
): AIRecipeRecommendationDTO[] {
  let filtered = [...recommendations];

  // Filter by meal category
  if (params.mealCategory) {
    filtered = filtered.filter((r) => r.recipe.mealCategory === params.mealCategory);
  }

  // Filter by max missing ingredients
  filtered = filtered.filter((r) => r.missingIngredients.length <= params.maxMissingIngredients);

  // Sort by prioritize expiring
  if (params.prioritizeExpiring) {
    filtered.sort((a, b) => b.usingExpiringIngredients.length - a.usingExpiringIngredients.length);
  } else {
    // Default sort by match score
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Apply limit
  return filtered.slice(0, params.limit);
}

/**
 * GET /api/recipes/recommendations
 *
 * AI-powered recipe recommendations based on user's ingredients.
 * Currently returns dummy data - TODO: Integrate with AI service.
 *
 * Query Parameters:
 * - meal_category: Filter by meal category (optional)
 * - max_missing_ingredients: Max number of missing ingredients (default: 3, max: 5)
 * - prioritize_expiring: Prioritize recipes using expiring ingredients (default: false)
 * - limit: Number of recommendations to return (default: 20, max: 50)
 *
 * Response:
 * - recommendations: Array of AIRecipeRecommendationDTO
 * - cacheUsed: Whether cached results were used
 * - generatedAt: ISO timestamp of generation
 */
export const GET: APIRoute = async ({ locals, request, url }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Authentication
    if (!locals.supabase) {
      throw new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.DATABASE_UNAVAILABLE,
        "Database connection not available"
      );
    }

    const user = await requireDemoFriendlyAuth(request, locals.supabase);

    // Rate limiting for authenticated users
    const rateLimitResult = checkUserRateLimit(user);
    if (!rateLimitResult.allowed) {
      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded. Please try again later.",
        { retryAfter: rateLimitResult.headers["X-RateLimit-Reset-User"] }
      );
    }

    // Parse query parameters
    const params = parseQueryParams(url);

    // TODO: Replace with actual AI recommendation logic
    // This should:
    // 1. Fetch user's products from the database
    // 2. Fetch all recipes from the database
    // 3. Call AI service to match recipes to products
    // 4. Return ranked recommendations with match scores

    // For now, filter dummy recommendations
    const recommendations = filterRecommendations(DUMMY_RECOMMENDATIONS, params);

    // Build response
    const response: AIRecipeRecommendationsResponse = {
      recommendations,
      cacheUsed: false, // TODO: Implement caching
      generatedAt: new Date().toISOString(),
    };

    const responseTime = Date.now() - startTime;

    return new Response(JSON.stringify(response), {
      status: HttpStatus.OK,
      headers: {
        "Content-Type": "application/json",
        "X-Response-Time": `${responseTime}ms`,
        "X-Request-ID": requestId,
        ...rateLimitResult.headers,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    const errorResponse = createErrorResponse(error, requestId);
    errorResponse.headers.set("X-Response-Time", `${responseTime}ms`);

    // Add Retry-After header for rate limit errors
    if (error instanceof ApiError && error.status === HttpStatus.TOO_MANY_REQUESTS) {
      const retryAfter = error.details?.retryAfter;
      if (retryAfter) {
        errorResponse.headers.set("Retry-After", String(retryAfter));
      }
    }

    return errorResponse;
  }
};
