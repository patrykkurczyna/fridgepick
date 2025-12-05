import type { ApiErrorResponse } from '../types';
import { 
  ApiError, 
  HttpStatus, 
  ErrorCode, 
  createErrorResponse 
} from './errorHandler';
import { UserProductServiceError } from '../services/UserProductService';
import { DatabaseError } from '../repositories/ProductCategoryRepository';
import { ValidationError } from '../validation/userProducts';

/**
 * Enhanced error handler specifically for user products endpoints
 * Provides specialized error handling for common user product scenarios
 */
export class UserProductsErrorHandler {
  
  /**
   * Converts various error types to standardized API errors for user products
   * 
   * @param error - Original error from service/repository/validation layer
   * @param requestId - Request ID for tracking
   * @param context - Additional context for error handling
   * @returns Response with standardized error format
   */
  static handleError(
    error: unknown, 
    requestId: string,
    context: {
      operation: 'GET' | 'POST' | 'PUT' | 'DELETE';
      userId?: string;
      productId?: string;
      endpoint: string;
    }
  ): Response {
    const { operation, userId, productId, endpoint } = context;
    
    console.error('UserProductsErrorHandler: Processing error', {
      requestId,
      operation,
      endpoint,
      userId: userId?.substring(0, 8) + '...',
      productId,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    // Handle different error types with specific logic
    let apiError: ApiError;

    if (error instanceof UserProductServiceError) {
      apiError = this.handleServiceError(error, operation, productId);
    } else if (error instanceof DatabaseError) {
      apiError = this.handleDatabaseError(error, operation, productId);
    } else if (error instanceof ApiError) {
      apiError = error; // Already properly formatted
    } else if (error instanceof Error) {
      // Generic Error handling
      if (error.message.includes('timeout')) {
        apiError = new ApiError(
          HttpStatus.GATEWAY_TIMEOUT,
          ErrorCode.TIMEOUT_ERROR,
          `${operation} operation timed out. Please try again.`,
          { operation, endpoint }
        );
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        apiError = new ApiError(
          HttpStatus.SERVICE_UNAVAILABLE,
          ErrorCode.SERVICE_UNAVAILABLE,
          'Service temporarily unavailable. Please try again later.',
          { operation, endpoint }
        );
      } else {
        apiError = new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCode.INTERNAL_SERVER_ERROR,
          'An unexpected error occurred while processing your request.',
          { operation, endpoint }
        );
      }
    } else {
      // Non-Error objects
      apiError = new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred.',
        { operation, endpoint }
      );
    }

    return createErrorResponse(apiError, requestId);
  }

  /**
   * Handles UserProductServiceError with operation-specific messages
   */
  private static handleServiceError(
    error: UserProductServiceError, 
    operation: string, 
    productId?: string
  ): ApiError {
    switch (error.code) {
      case 'INVALID_CATEGORY':
        return new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          'The specified product category does not exist. Please select a valid category.',
          { 
            field: 'categoryId',
            availableCategories: '/api/product-categories',
            ...error.details
          }
        );

      case 'INVALID_EXPIRY_DATE':
        return new ApiError(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          'Expiration date cannot be in the past. Please enter today\'s date or a future date.',
          { 
            field: 'expiresAt',
            minimumDate: new Date().toISOString().split('T')[0],
            ...error.details
          }
        );

      case 'PRODUCT_NOT_FOUND':
        if (operation === 'GET') {
          return new ApiError(
            HttpStatus.NOT_FOUND,
            ErrorCode.NOT_FOUND,
            'The requested product was not found in your inventory.',
            { productId, suggestion: 'Check your product list at /api/user-products' }
          );
        } else if (operation === 'PUT') {
          return new ApiError(
            HttpStatus.NOT_FOUND,
            ErrorCode.NOT_FOUND,
            'Cannot update product: product not found or you don\'t have permission to modify it.',
            { productId }
          );
        } else if (operation === 'DELETE') {
          return new ApiError(
            HttpStatus.NOT_FOUND,
            ErrorCode.NOT_FOUND,
            'Cannot delete product: product not found or you don\'t have permission to delete it.',
            { productId }
          );
        }
        break;

      case 'DATABASE_ERROR':
        return new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCode.DATABASE_ERROR,
          'A database error occurred while processing your request. Please try again.',
          { operation, retryable: true }
        );

      default:
        return new ApiError(
          error.statusCode as HttpStatus,
          error.code as ErrorCode,
          error.message,
          error.details
        );
    }

    return new ApiError(
      error.statusCode as HttpStatus,
      error.code as ErrorCode,
      error.message,
      error.details
    );
  }

  /**
   * Handles DatabaseError with operation-specific recovery suggestions
   */
  private static handleDatabaseError(
    error: DatabaseError, 
    operation: string, 
    productId?: string
  ): ApiError {
    // Check for specific database error codes
    if (error.originalError?.code) {
      switch (error.originalError.code) {
        case '23503': // Foreign key constraint violation
          if (error.originalError.constraint?.includes('category')) {
            return new ApiError(
              HttpStatus.BAD_REQUEST,
              ErrorCode.VALIDATION_ERROR,
              'Invalid category: The selected category does not exist.',
              { 
                field: 'categoryId',
                constraint: 'foreign_key',
                availableCategories: '/api/product-categories'
              }
            );
          }
          break;

        case '23505': // Unique constraint violation
          return new ApiError(
            HttpStatus.CONFLICT,
            ErrorCode.VALIDATION_ERROR,
            'A product with this information already exists in your inventory.',
            { 
              operation,
              constraint: 'unique',
              suggestion: 'Update the existing product instead of creating a new one'
            }
          );

        case '42501': // Permission denied
          return new ApiError(
            HttpStatus.FORBIDDEN,
            ErrorCode.FORBIDDEN,
            'You don\'t have permission to access this product.',
            { productId }
          );

        case 'PGRST116': // No rows returned from PostgREST
          if (operation === 'PUT' || operation === 'DELETE') {
            return new ApiError(
              HttpStatus.NOT_FOUND,
              ErrorCode.NOT_FOUND,
              'Product not found or access denied.',
              { productId }
            );
          }
          break;
      }
    }

    // Check for network/connection issues
    if (error.message.includes('connection') || error.message.includes('network')) {
      return new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.SERVICE_UNAVAILABLE,
        'Database connection lost. Please try again in a moment.',
        { operation, retryable: true, retryAfter: '30' }
      );
    }

    // Check for timeout issues
    if (error.message.includes('timeout')) {
      return new ApiError(
        HttpStatus.GATEWAY_TIMEOUT,
        ErrorCode.TIMEOUT_ERROR,
        'Database operation timed out. Please try again with a simpler query.',
        { operation, retryable: true }
      );
    }

    // Generic database error
    return new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DATABASE_ERROR,
      'A database error occurred. Please try again.',
      { 
        operation, 
        retryable: true,
        originalError: error.code
      }
    );
  }

  /**
   * Creates user-friendly error messages for common validation scenarios
   */
  static createValidationErrorResponse(
    errors: ValidationError[],
    requestId: string,
    operation: string
  ): Response {
    const userFriendlyMessages: Record<string, string> = {
      'name': 'Product name must be between 1 and 255 characters.',
      'categoryId': 'Please select a valid product category.',
      'quantity': 'Quantity must be a positive number with at most 3 decimal places.',
      'unit': 'Unit must be one of: grams (g), liters (l), or pieces (szt).',
      'expiresAt': 'Expiration date must be today or in the future (YYYY-MM-DD format).',
      'id': 'Invalid product ID format.',
      'category': 'Category filter must be a valid category ID.',
      'expired': 'Expired filter must be true or false.',
      'expiring_soon': 'Expiring soon filter must be a number between 1 and 365 days.',
      'sort': 'Sort must be one of: name, expires_at, or created_at.',
      'limit': 'Limit must be a number between 1 and 100.',
      'offset': 'Offset must be a non-negative number.'
    };

    // Build user-friendly error details
    const details: Record<string, string> = {};
    for (const error of errors) {
      details[error.field] = userFriendlyMessages[error.field] || error.message;
    }

    const apiError = new ApiError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      operation === 'GET' 
        ? 'Invalid request parameters. Please check your query and try again.'
        : 'Invalid product data. Please check the highlighted fields and try again.',
      details
    );

    return createErrorResponse(apiError, requestId);
  }

  /**
   * Handles rate limiting errors with helpful retry information
   */
  static createRateLimitErrorResponse(
    requestId: string,
    retryAfter: string,
    userType: 'demo' | 'verified'
  ): Response {
    const message = userType === 'demo'
      ? 'Rate limit exceeded for demo users. Please wait before making more requests.'
      : 'Rate limit exceeded. Please wait before making more requests.';

    const apiError = new ApiError(
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      message,
      {
        retryAfter: parseInt(retryAfter),
        userType,
        suggestion: userType === 'demo' 
          ? 'Consider creating a full account for higher rate limits.'
          : 'Try reducing the frequency of your requests.'
      }
    );

    const response = createErrorResponse(apiError, requestId);
    response.headers.set('Retry-After', retryAfter);
    
    return response;
  }

  /**
   * Handles authentication errors with helpful guidance
   */
  static createAuthenticationErrorResponse(
    requestId: string,
    errorType: 'missing' | 'invalid' | 'expired' | 'unverified'
  ): Response {
    let message: string;
    let details: Record<string, any> = {};

    switch (errorType) {
      case 'missing':
        message = 'Authentication required. Please provide a valid Bearer token.';
        details = {
          requiredHeader: 'Authorization: Bearer <token>',
          loginEndpoint: '/api/auth/login'
        };
        break;
      case 'invalid':
        message = 'Invalid authentication token. Please log in again.';
        details = {
          loginEndpoint: '/api/auth/login',
          suggestion: 'Your token may be malformed or corrupted.'
        };
        break;
      case 'expired':
        message = 'Authentication token has expired. Please log in again.';
        details = {
          loginEndpoint: '/api/auth/login',
          refreshEndpoint: '/api/auth/refresh'
        };
        break;
      case 'unverified':
        message = 'Email verification required to access this resource.';
        details = {
          verificationEndpoint: '/api/auth/verify-email',
          suggestion: 'Check your email for a verification link.'
        };
        break;
      default:
        message = 'Authentication failed. Please log in again.';
        details = { loginEndpoint: '/api/auth/login' };
    }

    const apiError = new ApiError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      message,
      details
    );

    return createErrorResponse(apiError, requestId);
  }

  /**
   * Logs error context for monitoring and debugging
   */
  static logErrorContext(
    error: unknown,
    context: {
      requestId: string;
      operation: string;
      userId?: string;
      productId?: string;
      requestUrl: string;
      userAgent?: string;
      responseTime: number;
    }
  ): void {
    const errorLog = {
      requestId: context.requestId,
      operation: context.operation,
      endpoint: context.requestUrl,
      userId: context.userId?.substring(0, 8) + '...',
      productId: context.productId,
      userAgent: context.userAgent?.substring(0, 100),
      responseTime: `${context.responseTime}ms`,
      error: {
        type: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        code: error instanceof ApiError ? error.code : 
              error instanceof UserProductServiceError ? error.code :
              error instanceof DatabaseError ? error.code : 'UNKNOWN',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined
      },
      severity: this.determineErrorSeverity(error),
      retryable: this.isRetryableError(error)
    };

    // Log with appropriate level based on severity
    if (errorLog.severity === 'high') {
      console.error('UserProductsErrorHandler: High severity error', errorLog);
    } else if (errorLog.severity === 'medium') {
      console.warn('UserProductsErrorHandler: Medium severity error', errorLog);
    } else {
      console.info('UserProductsErrorHandler: Low severity error', errorLog);
    }
  }

  /**
   * Determines the severity of an error for monitoring purposes
   */
  private static determineErrorSeverity(error: unknown): 'low' | 'medium' | 'high' {
    if (error instanceof ApiError) {
      if (error.statusCode >= 500) return 'high';
      if (error.statusCode === 429) return 'medium'; // Rate limiting
      if (error.statusCode >= 400) return 'low';
    }

    if (error instanceof DatabaseError) return 'high';
    if (error instanceof UserProductServiceError) {
      return error.statusCode >= 500 ? 'high' : 'low';
    }

    return 'medium'; // Unknown errors
  }

  /**
   * Determines if an error is retryable
   */
  private static isRetryableError(error: unknown): boolean {
    if (error instanceof ApiError) {
      return [
        HttpStatus.SERVICE_UNAVAILABLE,
        HttpStatus.GATEWAY_TIMEOUT,
        HttpStatus.TOO_MANY_REQUESTS
      ].includes(error.statusCode);
    }

    if (error instanceof DatabaseError) {
      return error.message.includes('timeout') || 
             error.message.includes('connection') ||
             error.message.includes('network');
    }

    return false;
  }
}