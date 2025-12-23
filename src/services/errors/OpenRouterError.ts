import type { OpenRouterErrorCode } from "@/types/openrouter";

/**
 * Custom error class for OpenRouter service errors.
 * Provides structured error information including error code, HTTP status,
 * and additional details for debugging and error handling.
 */
export class OpenRouterError extends Error {
  /** Error code identifying the type of error */
  public readonly code: OpenRouterErrorCode;

  /** HTTP status code associated with this error */
  public readonly statusCode: number;

  /** Additional error details (e.g., Zod validation errors, retry info) */
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: OpenRouterErrorCode, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "OpenRouterError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpenRouterError);
    }
  }

  /**
   * Returns a JSON-serializable representation of the error.
   * Useful for logging and API responses.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }

  /**
   * Checks if this error is retryable (server errors or rate limits).
   */
  isRetryable(): boolean {
    return this.statusCode >= 500 || this.statusCode === 429;
  }

  /**
   * Gets retry delay in seconds if available from details.
   */
  getRetryAfter(): number | null {
    if (this.details?.retryAfter && typeof this.details.retryAfter === "number") {
      return this.details.retryAfter;
    }
    return null;
  }
}
