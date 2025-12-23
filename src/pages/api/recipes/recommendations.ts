import type { APIRoute } from "astro";
import { z } from "zod";
import type {
  AIRecipeRecommendationsResponse,
  AIRecipeRecommendationDTO,
  RecipeMatchLevel,
  DatabaseEnums,
} from "@/types";
import { requireDemoFriendlyAuth, checkUserRateLimit } from "../../../middleware/auth";
import { HttpStatus, ErrorCode, ApiError, createErrorResponse } from "../../../middleware/errorHandler";
import { UserProductRepository } from "../../../repositories/UserProductRepository";
import { RecipeRepository } from "../../../repositories/RecipeRepository";
import {
  getOpenRouterService,
  shouldUseAI,
  isOpenRouterConfigured,
  OpenRouterError,
  type JsonSchema,
  type RuntimeEnv,
} from "../../../services";

// =============================================================================
// DUMMY DATA (fallback when AI is disabled or for demo users)
// =============================================================================

const DUMMY_RECOMMENDATIONS: AIRecipeRecommendationDTO[] = [
  {
    recipe: {
      id: "rec-001",
      name: "Jajecznica z pomidorami",
      mealCategory: "śniadanie",
      prepTimeMinutes: 15,
      nutritionalValues: { calories: 280, protein: 18, carbs: 8, fat: 20 },
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
      nutritionalValues: { calories: 350, protein: 12, carbs: 15, fat: 28 },
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
      nutritionalValues: { calories: 450, protein: 14, carbs: 65, fat: 12 },
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
      nutritionalValues: { calories: 320, protein: 22, carbs: 10, fat: 22 },
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
      nutritionalValues: { calories: 520, protein: 35, carbs: 55, fat: 15 },
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
      nutritionalValues: { calories: 180, protein: 6, carbs: 25, fat: 6 },
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
      nutritionalValues: { calories: 250, protein: 12, carbs: 30, fat: 10 },
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
      nutritionalValues: { calories: 150, protein: 2, carbs: 35, fat: 1 },
    },
    matchScore: 0.95,
    matchLevel: "idealny",
    availableIngredients: 5,
    missingIngredients: [],
    usingExpiringIngredients: ["jablka", "banany"],
  },
];

// =============================================================================
// AI RESPONSE SCHEMA
// =============================================================================

/** Zod schema for validating AI response */
const AIRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      recipeId: z.string(),
      matchScore: z.number().min(0).max(1),
      matchLevel: z.enum(["idealny", "prawie idealny", "wymaga dokupienia"]),
      availableIngredients: z.number().int().min(0),
      missingIngredients: z.array(z.string()),
      usingExpiringIngredients: z.array(z.string()),
      reasoning: z.string().optional(),
    })
  ),
});

type AIRecommendation = z.infer<typeof AIRecommendationSchema>;

/** JSON Schema for OpenRouter response_format (OpenAI structured outputs compatible) */
const aiRecommendationJsonSchema: JsonSchema = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          recipeId: { type: "string", description: "ID przepisu z listy" },
          matchScore: {
            type: "number",
            description: "Wynik dopasowania 0-1",
          },
          matchLevel: {
            type: "string",
            enum: ["idealny", "prawie idealny", "wymaga dokupienia"],
            description: "Poziom dopasowania",
          },
          availableIngredients: {
            type: "number",
            description: "Liczba dostepnych skladnikow",
          },
          missingIngredients: {
            type: "array",
            items: { type: "string" },
            description: "Lista brakujacych skladnikow",
          },
          usingExpiringIngredients: {
            type: "array",
            items: { type: "string" },
            description: "Lista wykorzystywanych skladnikow z krotka data waznosci",
          },
          reasoning: {
            type: "string",
            description: "Krotkie uzasadnienie rekomendacji",
          },
        },
        required: [
          "recipeId",
          "matchScore",
          "matchLevel",
          "availableIngredients",
          "missingIngredients",
          "usingExpiringIngredients",
          "reasoning",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["recommendations"],
  additionalProperties: false,
};

// =============================================================================
// QUERY PARAMETERS
// =============================================================================

interface RecommendationsQueryParams {
  prioritizeExpiring: boolean;
}

function parseQueryParams(url: URL): RecommendationsQueryParams {
  const prioritizeExpiringStr = url.searchParams.get("prioritize_expiring");

  return {
    prioritizeExpiring: prioritizeExpiringStr === "true",
  };
}

// =============================================================================
// DUMMY DATA FILTERING (for fallback)
// =============================================================================

function filterDummyRecommendations(
  recommendations: AIRecipeRecommendationDTO[],
  params: RecommendationsQueryParams
): AIRecipeRecommendationDTO[] {
  const filtered = [...recommendations];

  // Only sort - filtering by category/maxMissing is done locally on frontend
  if (params.prioritizeExpiring) {
    filtered.sort((a, b) => b.usingExpiringIngredients.length - a.usingExpiringIngredients.length);
  } else {
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  }

  return filtered;
}

// =============================================================================
// AI PROMPT BUILDING
// =============================================================================

function buildSystemMessage(): string {
  return `Dopasuj przepisy do skladnikow uzytkownika.

matchScore: 0-1 (1=wszystko, 0.9+=brak opcjonalnych, 0.7-0.9=brak 1-2, <0.7=brak 3+)
matchLevel: "idealny"(>=0.9), "prawie idealny"(0.7-0.9), "wymaga dokupienia"(<0.7)

Priorytet: skladniki wygasajace. Uzyj TYLKO podanych ID przepisow. JSON only.`;
}

function buildUserMessage(
  userProducts: { name: string; daysUntilExpiry: number | null }[],
  recipes: { id: string; name: string; ingredients: string[] }[],
  params: RecommendationsQueryParams
): string {
  // Compact product list: name (days) or just name
  const products = userProducts
    .map((p) => (p.daysUntilExpiry !== null && p.daysUntilExpiry <= 5 ? `${p.name}(${p.daysUntilExpiry}d)` : p.name))
    .join(", ");

  // Compact recipe list: ID|name|ingredients
  const recipesStr = recipes.map((r) => `${r.id}|${r.name}|${r.ingredients.join(",")}`).join("\n");

  return `PRODUKTY: ${products || "brak"}

PRZEPISY:
${recipesStr || "brak"}
${params.prioritizeExpiring ? "\nPRIORYTET: wygasajace skladniki" : ""}`;
}

// =============================================================================
// OPENROUTER ERROR MAPPING
// =============================================================================

function mapOpenRouterToApiError(error: OpenRouterError): ApiError {
  switch (error.code) {
    case "RATE_LIMIT_ERROR":
      return new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Usluga AI chwilowo niedostepna. Sprobuj ponownie za chwile.",
        {
          retryAfter: error.getRetryAfter(),
        }
      );
    case "AUTHENTICATION_ERROR":
    case "QUOTA_EXCEEDED":
      return new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.SERVICE_UNAVAILABLE,
        "Blad konfiguracji uslugi AI. Skontaktuj sie z administratorem."
      );
    case "CONTEXT_LENGTH_EXCEEDED":
      return new ApiError(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        "Zbyt duzo danych do analizy. Sprobuj z mniejsza liczba produktow lub przepisow."
      );
    case "VALIDATION_ERROR":
    case "JSON_PARSE_ERROR":
      return new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Blad przetwarzania odpowiedzi AI. Sprobuj ponownie."
      );
    default:
      return new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Blad uslugi AI. Sprobuj ponownie pozniej."
      );
  }
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

/**
 * GET /api/recipes/recommendations
 *
 * AI-powered recipe recommendations based on user's ingredients.
 * Uses OpenRouter API for AI recommendations or falls back to dummy data.
 *
 * Feature flag (ENABLE_AI_RECOMMENDATIONS):
 * - "enabled"  : AI always enabled
 * - "disabled" : AI always disabled (dummy data)
 * - "not_demo" : AI enabled only for non-demo users (default)
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

    // Rate limiting
    const rateLimitResult = checkUserRateLimit(user);
    if (!rateLimitResult.allowed) {
      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded. Please try again later.",
        {
          retryAfter: rateLimitResult.headers["X-RateLimit-Reset-User"],
        }
      );
    }

    // Parse query parameters
    const params = parseQueryParams(url);

    // Get runtime env for Cloudflare Workers (non-PUBLIC env vars)
    const runtime = (locals as { runtime?: { env?: RuntimeEnv } }).runtime;
    const runtimeEnv = runtime?.env;

    // Determine if we should use AI
    const useAI = shouldUseAI(user.isDemo, runtimeEnv) && isOpenRouterConfigured(runtimeEnv);

    let recommendations: AIRecipeRecommendationDTO[];
    let aiTokensUsed = 0;

    if (useAI) {
      // === AI-POWERED RECOMMENDATIONS ===
      console.info("Recommendations: Using OpenRouter AI", {
        requestId,
        userId: user.id.substring(0, 8) + "...",
        isDemo: user.isDemo,
      });

      // Fetch ALL user products (needed for accurate matching)
      const userProductRepo = new UserProductRepository(locals.supabase);
      const userProducts = await userProductRepo.findByUserId(user.id, { limit: 200 });

      // Create a set of normalized product names for fast lookup
      const userProductNames = new Set(
        userProducts.map((p) =>
          p.name
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        )
      );

      // Calculate days until expiry for each product
      const productsWithExpiry = userProducts.map((p) => {
        let daysUntilExpiry: number | null = null;
        if (p.expires_at) {
          const expiryDate = new Date(p.expires_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);
          daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }
        return {
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          daysUntilExpiry,
        };
      });

      // Fetch ALL recipes with ingredients (no category filter - filtering done on frontend)
      const recipeRepo = new RecipeRepository(locals.supabase);
      const allRecipesWithIngredients = await recipeRepo.findAllWithIngredients({
        limit: 100,
      });

      // Pre-filter recipes: keep only those with at least 1 ingredient matching user products
      // This reduces the prompt size while keeping relevant recipes
      const relevantRecipes = allRecipesWithIngredients.filter((recipe) => {
        const matchCount = recipe.ingredients.filter((ing) => {
          const normalizedIngredient = ing.ingredient_name
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          // Check if any user product contains the ingredient or vice versa
          for (const productName of userProductNames) {
            if (productName.includes(normalizedIngredient) || normalizedIngredient.includes(productName)) {
              return true;
            }
            // Check first word match (e.g., "jajka" matches "jajka kurze L")
            const ingredientFirstWord = normalizedIngredient.split(" ")[0];
            const productFirstWord = productName.split(" ")[0];
            if (ingredientFirstWord === productFirstWord) {
              return true;
            }
          }
          return false;
        }).length;

        // Keep recipes with at least 1 matching ingredient
        return matchCount >= 1;
      });

      // Sort by match count and take 3 best from each category (12 total)
      const MEAL_CATEGORIES = ["śniadanie", "obiad", "kolacja", "przekąska"] as const;
      const recipesWithMatchCount = relevantRecipes.map((recipe) => {
        const matchCount = recipe.ingredients.filter((ing) => {
          const normalizedIngredient = ing.ingredient_name
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          for (const productName of userProductNames) {
            if (productName.includes(normalizedIngredient) || normalizedIngredient.includes(productName)) {
              return true;
            }
            const ingredientFirstWord = normalizedIngredient.split(" ")[0];
            const productFirstWord = productName.split(" ")[0];
            if (ingredientFirstWord === productFirstWord) {
              return true;
            }
          }
          return false;
        }).length;
        return { recipe, matchCount };
      });

      // Take 3 best recipes from each category
      const sortedRecipes: typeof relevantRecipes = [];
      for (const category of MEAL_CATEGORIES) {
        const categoryRecipes = recipesWithMatchCount
          .filter((r) => r.recipe.meal_category === category)
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, 3)
          .map((r) => r.recipe);
        sortedRecipes.push(...categoryRecipes);
      }

      console.info("Recommendations: Pre-filtered recipes", {
        requestId,
        totalRecipes: allRecipesWithIngredients.length,
        relevantRecipes: relevantRecipes.length,
        sentToAI: sortedRecipes.length,
        userProducts: userProducts.length,
      });

      // Transform for AI consumption
      const recipesWithIngredients = sortedRecipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        mealCategory: recipe.meal_category,
        prepTimeMinutes: recipe.prep_time_minutes,
        nutritionalValues: recipe.nutritional_values,
        ingredients: recipe.ingredients.map((i) => i.ingredient_name),
      }));

      // Call OpenRouter API
      const openRouter = getOpenRouterService(runtimeEnv);
      const systemMessage = buildSystemMessage();
      const userMessage = buildUserMessage(
        productsWithExpiry.map((p) => ({ name: p.name, daysUntilExpiry: p.daysUntilExpiry })),
        recipesWithIngredients.map((r) => ({ id: r.id, name: r.name, ingredients: r.ingredients })),
        params
      );

      const aiResult = await openRouter.chatCompletion<AIRecommendation>({
        systemMessage,
        userMessage,
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "recipe_recommendations",
            strict: true,
            schema: aiRecommendationJsonSchema,
          },
          validator: AIRecommendationSchema,
        },
        temperature: 0, // Deterministic for speed
        maxTokens: 1000, // 12 recipes need less tokens
        userId: user.id,
        timeout: 30000, // 30 seconds should be enough now
      });

      aiTokensUsed = aiResult.usage.totalTokens;

      // Map AI response to DTO - no filtering here, done locally on frontend
      recommendations = aiResult.content.recommendations.map((rec) => {
        const recipeData = recipesWithIngredients.find((r) => r.id === rec.recipeId);
        return {
          recipe: {
            id: rec.recipeId,
            name: recipeData?.name ?? "Unknown",
            mealCategory: (recipeData?.mealCategory ?? "obiad") as DatabaseEnums["meal_category"],
            prepTimeMinutes: recipeData?.prepTimeMinutes ?? 30,
            nutritionalValues: recipeData?.nutritionalValues
              ? {
                  calories: (recipeData.nutritionalValues as Record<string, number>).calories ?? 0,
                  protein: (recipeData.nutritionalValues as Record<string, number>).protein,
                  carbs: (recipeData.nutritionalValues as Record<string, number>).carbs,
                  fat: (recipeData.nutritionalValues as Record<string, number>).fat,
                }
              : null,
          },
          matchScore: rec.matchScore,
          matchLevel: rec.matchLevel as RecipeMatchLevel,
          availableIngredients: rec.availableIngredients,
          missingIngredients: rec.missingIngredients,
          usingExpiringIngredients: rec.usingExpiringIngredients,
        };
      });

      // Sort by match score or expiring priority
      if (params.prioritizeExpiring) {
        recommendations.sort((a, b) => b.usingExpiringIngredients.length - a.usingExpiringIngredients.length);
      } else {
        recommendations.sort((a, b) => b.matchScore - a.matchScore);
      }

      console.info("Recommendations: AI response processed", {
        requestId,
        recommendationCount: recommendations.length,
        tokensUsed: aiTokensUsed,
        latencyMs: aiResult.latencyMs,
      });
    } else {
      // === FALLBACK TO DUMMY DATA ===
      const isConfigured = isOpenRouterConfigured(runtimeEnv);
      const aiEnabled = shouldUseAI(user.isDemo, runtimeEnv);
      console.info("Recommendations: Using dummy data", {
        requestId,
        userId: user.id.substring(0, 8) + "...",
        isDemo: user.isDemo,
        isOpenRouterConfigured: isConfigured,
        shouldUseAI: aiEnabled,
        hasRuntimeEnv: !!runtimeEnv,
        reason: !isConfigured ? "API key not configured" : "feature flag disabled for demo",
      });

      recommendations = filterDummyRecommendations(DUMMY_RECOMMENDATIONS, params);
    }

    // Build response
    const response: AIRecipeRecommendationsResponse = {
      recommendations,
      cacheUsed: false,
      generatedAt: new Date().toISOString(),
    };

    const responseTime = Date.now() - startTime;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Response-Time": `${responseTime}ms`,
      "X-Request-ID": requestId,
      "X-AI-Enabled": useAI.toString(),
      ...rateLimitResult.headers,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    };

    if (aiTokensUsed > 0) {
      headers["X-AI-Tokens-Used"] = aiTokensUsed.toString();
    }

    return new Response(JSON.stringify(response), {
      status: HttpStatus.OK,
      headers,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Map OpenRouter errors to API errors
    if (error instanceof OpenRouterError) {
      console.error("Recommendations: OpenRouter error", {
        requestId,
        errorCode: error.code,
        errorMessage: error.message,
        statusCode: error.statusCode,
      });

      const apiError = mapOpenRouterToApiError(error);
      const errorResponse = createErrorResponse(apiError, requestId);
      errorResponse.headers.set("X-Response-Time", `${responseTime}ms`);
      return errorResponse;
    }

    const errorResponse = createErrorResponse(error, requestId);
    errorResponse.headers.set("X-Response-Time", `${responseTime}ms`);

    // Add Retry-After header for rate limit errors
    if (error instanceof ApiError && error.statusCode === HttpStatus.TOO_MANY_REQUESTS) {
      const retryAfter = error.details?.retryAfter;
      if (retryAfter) {
        errorResponse.headers.set("Retry-After", String(retryAfter));
      }
    }

    return errorResponse;
  }
};
