import type { APIRoute } from "astro";
import type { UserProductResponse } from "../../../types";
import { UserProductRepository } from "../../../repositories/UserProductRepository";
import { UserProductService, UserProductServiceError } from "../../../services/UserProductService";
import { requireDemoFriendlyAuth, checkUserRateLimit } from "../../../middleware/auth";
import {
  validateProductId,
  validateUpdateUserProductWithBusinessRules,
  formatValidationErrors,
} from "../../../validation/userProducts";
import { HttpStatus, ErrorCode, ApiError, withTimeout, createErrorResponse } from "../../../middleware/errorHandler";

/**
 * PUT /api/user-products/:id
 *
 * Updates an existing product in user's inventory.
 * Validates ownership, product data, and category existence.
 * Returns the updated product with computed fields.
 *
 * Features:
 * - JWT authentication required
 * - Ownership validation
 * - Request body validation with business rules
 * - Category existence validation
 * - Automatic computed field calculation
 */
export const PUT: APIRoute = async ({ locals, request, params }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.info("UserProducts API: PUT request started", {
    requestId,
    url: request.url,
    method: request.method,
    productId: params.id,
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
        productId: params.id,
      });

      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded for user. Please try again later.",
        { retryAfter: rateLimitResult.headers["X-RateLimit-Reset-User"] }
      );
    }

    // Validate product ID parameter
    const paramsValidation = validateProductId(params);
    if (!paramsValidation.success) {
      console.warn("UserProducts API: Invalid product ID parameter", {
        requestId,
        errors: paramsValidation.errors,
        productId: params.id,
      });

      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        "Invalid product ID",
        formatValidationErrors(paramsValidation.errors)
      );
    }

    const { id: productId } = paramsValidation.data;

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      throw new ApiError(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Invalid JSON in request body");
    }

    // Validate request body
    const bodyValidation = validateUpdateUserProductWithBusinessRules(requestBody);
    if (!bodyValidation.success) {
      console.warn("UserProducts API: Request body validation failed", {
        requestId,
        productId,
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
    const repository = new UserProductRepository(authenticatedSupabase);
    const service = new UserProductService(repository);

    // Update product with timeout protection
    const updateResult = await withTimeout(
      service.updateProduct(user.id, productId, productData),
      5000, // 5 seconds timeout for update operation
      "Product update timeout"
    );

    const responseTime = Date.now() - startTime;

    console.info("UserProducts API: PUT request completed successfully", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      productId,
      productName: updateResult.product.name,
      responseTime: `${responseTime}ms`,
    });

    return new Response(JSON.stringify(updateResult), {
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

    console.error("UserProducts API: PUT request error", {
      requestId,
      productId: params.id,
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
 * DELETE /api/user-products/:id
 *
 * Deletes a product from user's inventory.
 * Validates ownership before deletion.
 * Returns success confirmation.
 *
 * Features:
 * - JWT authentication required
 * - Ownership validation
 * - Product ID validation
 * - Comprehensive error handling
 */
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.info("UserProducts API: DELETE request started", {
    requestId,
    url: request.url,
    method: request.method,
    productId: params.id,
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
        productId: params.id,
      });

      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded for user. Please try again later.",
        { retryAfter: rateLimitResult.headers["X-RateLimit-Reset-User"] }
      );
    }

    // Validate product ID parameter
    const paramsValidation = validateProductId(params);
    if (!paramsValidation.success) {
      console.warn("UserProducts API: Invalid product ID parameter", {
        requestId,
        errors: paramsValidation.errors,
        productId: params.id,
      });

      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        "Invalid product ID",
        formatValidationErrors(paramsValidation.errors)
      );
    }

    const { id: productId } = paramsValidation.data;

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
    const repository = new UserProductRepository(authenticatedSupabase);
    const service = new UserProductService(repository);

    // Delete product with timeout protection
    const deleteResult = await withTimeout(
      service.deleteProduct(user.id, productId),
      3000, // 3 seconds timeout for delete operation
      "Product deletion timeout"
    );

    const responseTime = Date.now() - startTime;

    console.info("UserProducts API: DELETE request completed successfully", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      productId,
      responseTime: `${responseTime}ms`,
    });

    return new Response(JSON.stringify(deleteResult), {
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

    console.error("UserProducts API: DELETE request error", {
      requestId,
      productId: params.id,
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
 * GET /api/user-products/:id
 *
 * Retrieves a single product from user's inventory.
 * Validates ownership and returns product with computed fields.
 *
 * Features:
 * - JWT authentication required
 * - Ownership validation
 * - Product ID validation
 * - Computed fields calculation
 */
export const GET: APIRoute = async ({ locals, request, params }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  console.info("UserProducts API: GET single product request started", {
    requestId,
    url: request.url,
    method: request.method,
    productId: params.id,
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
        productId: params.id,
      });

      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded for user. Please try again later.",
        { retryAfter: rateLimitResult.headers["X-RateLimit-Reset-User"] }
      );
    }

    // Validate product ID parameter
    const paramsValidation = validateProductId(params);
    if (!paramsValidation.success) {
      console.warn("UserProducts API: Invalid product ID parameter", {
        requestId,
        errors: paramsValidation.errors,
        productId: params.id,
      });

      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        "Invalid product ID",
        formatValidationErrors(paramsValidation.errors)
      );
    }

    const { id: productId } = paramsValidation.data;

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
    const repository = new UserProductRepository(authenticatedSupabase);
    const service = new UserProductService(repository);

    // Get product with timeout protection
    const product = await withTimeout(
      service.getProductById(user.id, productId),
      3000, // 3 seconds timeout for single product fetch
      "Product fetch timeout"
    );

    if (!product) {
      throw new ApiError(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Product not found or access denied", {
        productId,
      });
    }

    const responseTime = Date.now() - startTime;

    console.info("UserProducts API: GET single product request completed successfully", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      productId,
      productName: product.name,
      responseTime: `${responseTime}ms`,
    });

    const response: UserProductResponse = {
      success: true,
      product,
    };

    return new Response(JSON.stringify(response), {
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
        // Cache headers for single product
        "Cache-Control": "private, max-age=300", // 5 minutes private cache
        ETag: `"${product.id}-${product.createdAt}"`,
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error("UserProducts API: GET single product request error", {
      requestId,
      productId: params.id,
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
