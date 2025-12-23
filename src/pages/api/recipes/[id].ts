import type { APIRoute } from "astro";
import { RecipeRepository } from "../../../repositories/RecipeRepository";
import { UserProductRepository } from "../../../repositories/UserProductRepository";
import { RecipeService, RecipeServiceError } from "../../../services/RecipeService";
import { requireDemoFriendlyAuth, checkUserRateLimit } from "../../../middleware/auth";
import { HttpStatus, ErrorCode, ApiError, withTimeout, createErrorResponse } from "../../../middleware/errorHandler";

/**
 * GET /api/recipes/:id
 *
 * Retrieves a single recipe by ID with its ingredients.
 * Includes information about whether the user can cook the recipe
 * based on their inventory.
 *
 * Features:
 * - JWT authentication required
 * - Recipe ingredient list with user availability
 * - Inventory availability check against user's products
 * - Can-cook status based on ingredient availability
 * - Missing ingredients list
 */
export const GET: APIRoute = async ({ locals, request, params }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const recipeId = params.id;

  console.info("Recipe Detail API: GET request started", {
    requestId,
    url: request.url,
    method: request.method,
    recipeId,
  });

  try {
    // Validate recipe ID
    if (!recipeId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Recipe ID is required");
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(recipeId)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Invalid recipe ID format");
    }

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
      console.warn("Recipe Detail API: User rate limit exceeded", {
        requestId,
        userId: user.id.substring(0, 8) + "...",
      });

      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded for user. Please try again later.",
        { retryAfter: rateLimitResult.headers["X-RateLimit-Reset-User"] }
      );
    }

    // Get JWT token from Authorization header for RLS context
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Authorization token required");
    }

    // Create authenticated Supabase client with user's JWT token for RLS context
    const { createClient } = await import("@supabase/supabase-js");

    // Get env vars - support both Node.js and Cloudflare runtime
    const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
    const supabaseUrl =
      runtime?.env?.SUPABASE_URL || import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      runtime?.env?.SUPABASE_KEY || import.meta.env.SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_KEY || "";

    const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Initialize service layer with user product repository for inventory check
    const recipeRepository = new RecipeRepository(authenticatedSupabase);
    const userProductRepository = new UserProductRepository(authenticatedSupabase);
    const service = new RecipeService(recipeRepository, userProductRepository);

    // Get recipe with timeout protection
    // Pass user.id to enable inventory availability check
    const recipeResponse = await withTimeout(
      service.getRecipeById(recipeId, user.id),
      5000, // 5 seconds timeout
      "Recipe detail query timeout"
    );

    if (!recipeResponse) {
      throw new ApiError(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Recipe not found");
    }

    const responseTime = Date.now() - startTime;

    console.info("Recipe Detail API: GET request completed successfully", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      recipeId,
      ingredientCount: recipeResponse.recipe.ingredients.length,
      canCook: recipeResponse.recipe.canCook,
      responseTime: `${responseTime}ms`,
    });

    // Prepare response
    return new Response(JSON.stringify(recipeResponse), {
      status: HttpStatus.OK,
      headers: {
        "Content-Type": "application/json",
        // Performance headers
        "X-Response-Time": `${responseTime}ms`,
        "X-Request-ID": requestId,
        // Rate limiting headers
        ...rateLimitResult.headers,
        // Security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error("Recipe Detail API: GET request error", {
      requestId,
      recipeId,
      error: error instanceof Error ? error.message : String(error),
      errorType:
        error instanceof ApiError ? "ApiError" : error instanceof RecipeServiceError ? "ServiceError" : "UnknownError",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    });

    // Convert service errors to API errors
    const responseError =
      error instanceof RecipeServiceError
        ? new ApiError(error.statusCode as HttpStatus, error.code as ErrorCode, error.message, error.details)
        : error;

    const errorResponse = createErrorResponse(responseError, requestId);
    errorResponse.headers.set("X-Response-Time", `${responseTime}ms`);

    return errorResponse;
  }
};
