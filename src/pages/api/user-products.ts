import type { APIRoute } from "astro";
import { UserProductRepository } from "../../repositories/UserProductRepository";
import { UserProductService, UserProductServiceError } from "../../services/UserProductService";
import { requireDemoFriendlyAuth, checkUserRateLimit } from "../../middleware/auth";
import {
  validateUserProductsQuery,
  validateCreateUserProductWithBusinessRules,
  formatValidationErrors,
} from "../../validation/userProducts";
import { HttpStatus, withTimeout } from "../../middleware/errorHandler";

/**
 * GET /api/user-products
 *
 * Retrieves user's product inventory with filtering, sorting, and pagination.
 * Supports filtering by category, expiration status, and time-based queries.
 * Returns computed fields like isExpired and daysUntilExpiry.
 *
 * Features:
 * - JWT authentication required
 * - Query parameter validation
 * - Comprehensive filtering options
 * - Pagination with metadata
 * - Rate limiting per user
 * - Performance monitoring
 */
export const GET: APIRoute = async ({ locals, request, url }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.info("UserProducts API: GET request started", {
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
      console.warn("UserProducts API: User rate limit exceeded", {
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
    const queryValidation = validateUserProductsQuery(queryParamsObject);

    if (!queryValidation.success) {
      console.warn("UserProducts API: Query parameter validation failed", {
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
    const authenticatedSupabase = createClient(
      import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || "",
      import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY || "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Initialize service layer with user-authenticated Supabase client
    const repository = new UserProductRepository(authenticatedSupabase);
    const service = new UserProductService(repository);

    // Get user products with timeout protection
    const userProducts = await withTimeout(
      service.getUserProducts(user.id, queryParams),
      10000, // 10 seconds timeout for complex queries
      "User products query timeout"
    );

    const responseTime = Date.now() - startTime;

    console.info("UserProducts API: GET request completed successfully", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      productCount: userProducts.products.length,
      totalCount: userProducts.pagination.total,
      responseTime: `${responseTime}ms`,
      queryParams,
    });

    // Prepare response
    return new Response(JSON.stringify(userProducts), {
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
        "X-Total-Count": userProducts.pagination.total.toString(),
        "X-Page-Limit": userProducts.pagination.limit.toString(),
        "X-Page-Offset": userProducts.pagination.offset.toString(),
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error("UserProducts API: GET request error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      errorType:
        error instanceof ApiError
          ? "ApiError"
          : error instanceof UserProductServiceError
            ? "ServiceError"
            : "UnknownError",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    });

    // Convert service errors to API errors
    const responseError =
      error instanceof UserProductServiceError
        ? new ApiError(error.statusCode as HttpStatus, error.code as ErrorCode, error.message, error.details)
        : error;

    const errorResponse = createErrorResponse(responseError, requestId);
    errorResponse.headers.set("X-Response-Time", `${responseTime}ms`);

    return errorResponse;
  }
};

/**
 * POST /api/user-products
 *
 * Creates a new product in user's inventory.
 * Validates product data, category existence, and business rules.
 * Returns the created product with computed fields.
 *
 * Features:
 * - JWT authentication required
 * - Request body validation with business rules
 * - Category existence validation
 * - Automatic computed field calculation
 * - Comprehensive error handling
 */
export const POST: APIRoute = async ({ locals, request }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.info("UserProducts API: POST request started", {
    requestId,
    url: request.url,
    method: request.method,
    contentType: request.headers.get("content-type"),
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
      console.warn("UserProducts API: User rate limit exceeded", {
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

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      throw new ApiError(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Invalid JSON in request body");
    }

    // Validate request body
    const bodyValidation = validateCreateUserProductWithBusinessRules(requestBody);
    if (!bodyValidation.success) {
      console.warn("UserProducts API: Request body validation failed", {
        requestId,
        errors: bodyValidation.errors,
        requestBody,
      });

      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        "Invalid product data",
        formatValidationErrors(bodyValidation.errors)
      );
    }

    const productData = bodyValidation.data;

    // Get JWT token from Authorization header for RLS context
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Authorization token required");
    }

    // Create authenticated Supabase client with user's JWT token for RLS context
    const { createClient } = await import("@supabase/supabase-js");
    const authenticatedSupabase = createClient(
      import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || "",
      import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY || "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Initialize service layer
    const repository = new UserProductRepository(authenticatedSupabase);
    const service = new UserProductService(repository);

    // Create product with timeout protection
    const createResult = await withTimeout(
      service.createProduct(user.id, productData),
      5000, // 5 seconds timeout for create operation
      "Product creation timeout"
    );

    const responseTime = Date.now() - startTime;

    console.info("UserProducts API: POST request completed successfully", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      productId: createResult.product.id,
      productName: createResult.product.name,
      responseTime: `${responseTime}ms`,
    });

    return new Response(JSON.stringify(createResult), {
      status: HttpStatus.CREATED,
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
        // Resource location
        Location: `/api/user-products/${createResult.product.id}`,
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error("UserProducts API: POST request error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      errorType:
        error instanceof ApiError
          ? "ApiError"
          : error instanceof UserProductServiceError
            ? "ServiceError"
            : "UnknownError",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    });

    // Convert service errors to API errors
    const responseError =
      error instanceof UserProductServiceError
        ? new ApiError(error.statusCode as HttpStatus, error.code as ErrorCode, error.message, error.details)
        : error;

    const errorResponse = createErrorResponse(responseError, requestId);
    errorResponse.headers.set("X-Response-Time", `${responseTime}ms`);

    return errorResponse;
  }
};
