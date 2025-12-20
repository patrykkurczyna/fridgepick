import type { ApiErrorResponse } from "../types";

/**
 * HTTP status codes enum for better type safety
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Error codes for consistent error handling
 */
export enum ErrorCode {
  DATABASE_ERROR = "DATABASE_ERROR",
  DATABASE_UNAVAILABLE = "DATABASE_UNAVAILABLE",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
}

/**
 * Standardized API error response builder
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: HttpStatus,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Converts ApiError to standardized response format
   */
  toResponse(requestId?: string): ApiErrorResponse {
    return {
      error: true,
      message: this.message,
      code: this.code,
      details: {
        ...this.details,
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
      },
    };
  }
}

/**
 * Rate limiting store (simple in-memory implementation)
 */
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const current = this.store.get(key);

    if (!current || current.resetTime <= now) {
      const resetTime = now + windowMs;
      const entry = { count: 1, resetTime };
      this.store.set(key, entry);
      return entry;
    }

    current.count++;
    this.store.set(key, current);
    return current;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

/**
 * Global rate limiter instance
 */
const rateLimiter = new RateLimitStore();

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
}

/**
 * Default rate limit configuration for public endpoints
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000, // 1000 requests per hour
  keyGenerator: (request) => {
    // Use X-Forwarded-For header or fallback to a default
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    return `rate_limit:${ip}`;
  },
};

/**
 * Rate limiting middleware function
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): { allowed: boolean; headers: Record<string, string>; remaining?: number } {
  const key = config.keyGenerator
    ? config.keyGenerator(request)
    : DEFAULT_RATE_LIMIT_CONFIG.keyGenerator
      ? DEFAULT_RATE_LIMIT_CONFIG.keyGenerator(request)
      : "";
  const result = rateLimiter.increment(key, config.windowMs);

  const remaining = Math.max(0, config.maxRequests - result.count);
  const resetTime = Math.ceil(result.resetTime / 1000);

  const headers = {
    "X-RateLimit-Limit": config.maxRequests.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetTime.toString(),
  };

  return {
    allowed: result.count <= config.maxRequests,
    headers,
    remaining,
  };
}

/**
 * ETag validation helper
 */
export function checkETag(request: Request, currentETag: string): boolean {
  const ifNoneMatch = request.headers.get("if-none-match");
  return ifNoneMatch === `"${currentETag}"`;
}

/**
 * Request timeout wrapper
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = "Request timeout"
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new ApiError(HttpStatus.GATEWAY_TIMEOUT, ErrorCode.TIMEOUT_ERROR, timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Standard error response helper
 */
export function createErrorResponse(
  error: unknown,
  requestId?: string,
  defaultMessage = "An unexpected error occurred"
): Response {
  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message || defaultMessage
    );
  } else {
    apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR, defaultMessage);
  }

  return new Response(JSON.stringify(apiError.toResponse(requestId)), {
    status: apiError.statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
