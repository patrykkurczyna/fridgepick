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
  mealCategory: DatabaseEnums["meal_category"] | null;
  maxMissingIngredients: number;
  prioritizeExpiring: boolean;
  limit: number;
}

function parseQueryParams(url: URL): RecommendationsQueryParams {
  const mealCategory = url.searchParams.get("meal_category") as DatabaseEnums["meal_category"] | null;
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

// =============================================================================
// DUMMY DATA FILTERING (for fallback)
// =============================================================================

function filterDummyRecommendations(
  recommendations: AIRecipeRecommendationDTO[],
  params: RecommendationsQueryParams
): AIRecipeRecommendationDTO[] {
  let filtered = [...recommendations];

  if (params.mealCategory) {
    filtered = filtered.filter((r) => r.recipe.mealCategory === params.mealCategory);
  }

  filtered = filtered.filter((r) => r.missingIngredients.length <= params.maxMissingIngredients);

  if (params.prioritizeExpiring) {
    filtered.sort((a, b) => b.usingExpiringIngredients.length - a.usingExpiringIngredients.length);
  } else {
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  }

  return filtered.slice(0, params.limit);
}

// =============================================================================
// AI PROMPT BUILDING
// =============================================================================

function buildSystemMessage(): string {
  return `Jestes ekspertem kulinarnym AI. Twoim zadaniem jest analizowanie dostepnych skladnikow uzytkownika i dopasowywanie ich do przepisow z podanej listy.

ZASADY DOPASOWANIA:
1. matchScore: wartosc 0-1 okreslajaca jak dobrze przepis pasuje do dostepnych skladnikow
   - 1.0 = wszystkie skladniki dostepne
   - 0.9+ = brak tylko opcjonalnych skladnikow
   - 0.7-0.9 = brak 1-2 wymaganych skladnikow
   - 0.5-0.7 = brak 3+ wymaganych skladnikow
   - <0.5 = brakuje wiekszosci skladnikow

2. matchLevel:
   - "idealny": wszystkie wymagane skladniki dostepne (matchScore >= 0.9)
   - "prawie idealny": brak 1-2 wymaganych skladnikow (matchScore 0.7-0.9)
   - "wymaga dokupienia": brak 3+ wymaganych skladnikow (matchScore < 0.7)

3. PRIORYTETYZACJA:
   - Priorytetowo wybieraj przepisy wykorzystujace skladniki z KROTKA DATA WAZNOSCI
   - Preferuj przepisy gdzie mozna zastapic brakujace skladniki podobnymi dostepnymi

4. WAZNE:
   - Analizuj TYLKO przepisy z podanej listy (uzyj dokladnych ID)
   - Nie wymyslaj nowych przepisow
   - Odpowiadaj TYLKO w formacie JSON zgodnym ze schema`;
}

function buildUserMessage(
  userProducts: { name: string; quantity: number; unit: string; daysUntilExpiry: number | null }[],
  recipes: { id: string; name: string; ingredients: string[] }[],
  params: RecommendationsQueryParams
): string {
  const productsSection =
    userProducts.length > 0
      ? userProducts
          .map((p) => {
            const expiryInfo = p.daysUntilExpiry !== null ? ` (wygasa za ${p.daysUntilExpiry} dni)` : "";
            return `- ${p.name}: ${p.quantity} ${p.unit}${expiryInfo}`;
          })
          .join("\n")
      : "Brak produktow w lodowce";

  const recipesSection =
    recipes.length > 0
      ? recipes.map((r) => `- ID: "${r.id}", Nazwa: "${r.name}", Skladniki: ${r.ingredients.join(", ")}`).join("\n")
      : "Brak dostepnych przepisow";

  let constraints = `\nOGRANICZENIA:
- Maksymalna liczba brakujacych skladnikow: ${params.maxMissingIngredients}
- Maksymalna liczba rekomendacji: ${params.limit}`;

  if (params.mealCategory) {
    constraints += `\n- Filtruj tylko kategorie posilku: ${params.mealCategory}`;
  }

  if (params.prioritizeExpiring) {
    constraints += `\n- PRIORYTET: przepisy wykorzystujace skladniki wygasajace w ciagu 3 dni`;
  }

  return `PRODUKTY UZYTKOWNIKA:
${productsSection}

DOSTEPNE PRZEPISY:
${recipesSection}
${constraints}

Przeanalizuj produkty uzytkownika i dopasuj je do przepisow. Zwroc rekomendacje posortowane od najlepszego dopasowania.`;
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

    // Determine if we should use AI
    const useAI = shouldUseAI(user.isDemo) && isOpenRouterConfigured();

    let recommendations: AIRecipeRecommendationDTO[];
    let aiTokensUsed = 0;

    if (useAI) {
      // === AI-POWERED RECOMMENDATIONS ===
      console.info("Recommendations: Using OpenRouter AI", {
        requestId,
        userId: user.id.substring(0, 8) + "...",
        isDemo: user.isDemo,
      });

      // Fetch user products
      const userProductRepo = new UserProductRepository(locals.supabase);
      const userProducts = await userProductRepo.findByUserId(user.id, { limit: 100 });

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

      // Fetch recipes with ingredients
      const recipeRepo = new RecipeRepository(locals.supabase);
      const dbRecipes = await recipeRepo.findAll({
        meal_category: params.mealCategory ?? undefined,
        limit: 50,
      });

      // Build recipes with ingredients for AI
      const recipesWithIngredients = await Promise.all(
        dbRecipes.map(async (recipe) => {
          const fullRecipe = await recipeRepo.findById(recipe.id);
          return {
            id: recipe.id,
            name: recipe.name,
            mealCategory: recipe.meal_category,
            prepTimeMinutes: recipe.prep_time_minutes,
            nutritionalValues: recipe.nutritional_values,
            ingredients: fullRecipe?.ingredients.map((i) => i.ingredient_name) ?? [],
          };
        })
      );

      // Call OpenRouter API
      const openRouter = getOpenRouterService();
      const systemMessage = buildSystemMessage();
      const userMessage = buildUserMessage(
        productsWithExpiry,
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
        temperature: 0.3,
        maxTokens: 2048,
        userId: user.id,
      });

      aiTokensUsed = aiResult.usage.totalTokens;

      // Map AI response to DTO
      recommendations = aiResult.content.recommendations
        .filter((rec) => rec.missingIngredients.length <= params.maxMissingIngredients)
        .slice(0, params.limit)
        .map((rec) => {
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
      console.info("Recommendations: Using dummy data", {
        requestId,
        userId: user.id.substring(0, 8) + "...",
        isDemo: user.isDemo,
        reason: !isOpenRouterConfigured() ? "API key not configured" : "feature flag disabled for demo",
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
