import type { APIRoute } from "astro";
import type { ProductCategoriesResponse } from "../../types";
import { ProductCategoryRepository } from "../../repositories/ProductCategoryRepository";
import { ProductCategoryService } from "../../services/ProductCategoryService";
import {
  checkRateLimit,
  checkETag,
  withTimeout,
  HttpStatus,
  ErrorCode,
  ApiError,
  createErrorResponse,
} from "../../middleware/errorHandler";

/**
 * GET /api/product-categories
 *
 * Returns a list of all available product categories for the application.
 * This is a public endpoint that doesn't require authentication.
 * Used primarily for populating dropdown menus in the user interface.
 *
 * Features:
 * - In-memory caching with 30-minute TTL
 * - Graceful fallback to static data on database errors
 * - Proper HTTP caching headers
 * - Comprehensive error handling
 * - Performance monitoring via logging
 */
export const GET: APIRoute = async ({ locals, request }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.info("ProductCategories API: Request started", {
    requestId,
    url: request.url,
    method: request.method,
    userAgent: request.headers.get("user-agent"),
  });

  try {
    // Rate limiting check
    const rateLimitResult = checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      console.warn("ProductCategories API: Rate limit exceeded", {
        requestId,
        remaining: rateLimitResult.remaining,
      });

      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded. Please try again later.",
        { retryAfter: rateLimitResult.headers["X-RateLimit-Reset"] }
      );
    }

    // Initialize dependencies with timeout
    if (!locals.supabase) {
      throw new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.DATABASE_UNAVAILABLE,
        "Database connection not available"
      );
    }

    // Create service instances
    const repository = new ProductCategoryRepository(locals.supabase);
    const service = new ProductCategoryService(repository);

    // Fetch categories through service layer with timeout (5 seconds)
    const categories = await withTimeout(service.getAllCategories(), 5000, "Database query timeout");

    // Log cache statistics for monitoring
    const cacheStats = service.getCacheStats();
    console.debug("ProductCategories API: Cache statistics", {
      requestId,
      ...cacheStats,
    });

    // Check ETag for conditional requests (304 Not Modified)
    const etag = generateETag(categories);
    if (checkETag(request, etag)) {
      console.debug("ProductCategories API: ETag match, returning 304", { requestId, etag });
      return new Response(null, {
        status: HttpStatus.NOT_MODIFIED,
        headers: {
          ETag: `"${etag}"`,
          "Cache-Control": "public, max-age=3600",
          ...rateLimitResult.headers,
        },
      });
    }

    // Prepare successful response
    const responseData: ProductCategoriesResponse = {
      categories,
    };

    const responseTime = Date.now() - startTime;

    console.info("ProductCategories API: Request completed successfully", {
      requestId,
      responseTime: `${responseTime}ms`,
      categoryCount: categories.length,
      cacheHit: cacheStats.isValid,
    });

    // Return response with proper caching headers
    return new Response(JSON.stringify(responseData), {
      status: HttpStatus.OK,
      headers: {
        "Content-Type": "application/json",
        // Cache for 1 hour in browsers and CDNs
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
        // ETag for conditional requests
        ETag: `"${etag}"`,
        // CORS headers for frontend
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        // Security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        // Performance monitoring
        "X-Response-Time": `${responseTime}ms`,
        "X-Cache-Status": cacheStats.isValid ? "HIT" : "MISS",
        // Rate limiting headers
        ...rateLimitResult.headers,
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error("ProductCategories API: Error occurred", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof ApiError ? "ApiError" : "UnknownError",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    });

    // Use standardized error response helper
    const errorResponse = createErrorResponse(error, requestId);

    // Add response time header to error responses
    errorResponse.headers.set("X-Response-Time", `${responseTime}ms`);

    return errorResponse;
  }
};

/**
 * Generates a simple ETag based on categories data
 * Used for conditional requests and cache validation
 *
 * @param categories Array of product categories
 * @returns ETag string
 */
function generateETag(categories: ProductCategoriesResponse["categories"]): string {
  // Simple hash based on content - in production, use a proper hash function
  const content = JSON.stringify(categories.map((c) => ({ id: c.id, name: c.name })));
  let hash = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}
