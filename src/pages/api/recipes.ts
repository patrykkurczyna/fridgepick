import type { APIRoute } from "astro";
import { RecipeRepository } from "../../repositories/RecipeRepository";
import { RecipeService, RecipeServiceError } from "../../services/RecipeService";
import { requireDemoFriendlyAuth, checkUserRateLimit } from "../../middleware/auth";
import { validateRecipesQuery, formatValidationErrors } from "../../validation/recipes";
import { HttpStatus, ErrorCode, ApiError, withTimeout, createErrorResponse } from "../../middleware/errorHandler";

/**
 * GET /api/recipes
 *
 * Retrieves recipes with filtering, sorting, and pagination.
 * Supports filtering by meal category, protein type, and search.
 *
 * Features:
 * - JWT authentication required
 * - Query parameter validation
 * - Comprehensive filtering options
 * - Pagination with metadata
 * - Rate limiting per user
 */
export const GET: APIRoute = async ({ locals, request, url }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.info("Recipes API: GET request started", {
    requestId,
    url: request.url,
    method: request.method,
    queryParams: Object.fromEntries(url.searchParams),
  });

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
      console.warn("Recipes API: User rate limit exceeded", {
        requestId,
        userId: user.id.substring(0, 8) + "...",
        userType: user.isDemo ? "demo" : "verified",
      });

      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded for user. Please try again later.",
        { retryAfter: rateLimitResult.headers["X-RateLimit-Reset-User"] }
      );
    }

    // Parse and validate query parameters
    const queryParamsObject = Object.fromEntries(url.searchParams);
    const queryValidation = validateRecipesQuery(queryParamsObject);

    if (!queryValidation.success) {
      console.warn("Recipes API: Query parameter validation failed", {
        requestId,
        errors: queryValidation.errors,
        queryParams: queryParamsObject,
      });

      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        "Invalid query parameters",
        formatValidationErrors(queryValidation.errors)
      );
    }

    const queryParams = queryValidation.data;

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

    // Initialize service layer with user-authenticated Supabase client
    const repository = new RecipeRepository(authenticatedSupabase);
    const service = new RecipeService(repository);

    // Get recipes with timeout protection
    const recipesResponse = await withTimeout(
      service.getRecipes(queryParams),
      10000, // 10 seconds timeout
      "Recipes query timeout"
    );

    const responseTime = Date.now() - startTime;

    console.info("Recipes API: GET request completed successfully", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      recipeCount: recipesResponse.recipes.length,
      totalCount: recipesResponse.pagination.total,
      responseTime: `${responseTime}ms`,
      queryParams,
    });

    // Prepare response
    return new Response(JSON.stringify(recipesResponse), {
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
        // Pagination headers for easy access
        "X-Total-Count": recipesResponse.pagination.total.toString(),
        "X-Page-Limit": recipesResponse.pagination.limit.toString(),
        "X-Page-Offset": recipesResponse.pagination.offset.toString(),
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error("Recipes API: GET request error", {
      requestId,
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
