import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import { 
  createErrorResponse, 
  ApiError, 
  HttpStatus, 
  ErrorCode 
} from './errorHandler';

/**
 * Authenticated user context
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  isDemo: boolean;
  isEmailVerified: boolean;
}

/**
 * Authentication result
 */
export interface AuthenticationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * JWT payload structure from Supabase
 */
interface JWTPayload {
  sub: string;
  email?: string;
  user_metadata?: {
    is_demo?: boolean;
    email_verified?: boolean;
  };
  email_confirmed_at?: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
}

/**
 * Authentication service for JWT validation and user extraction
 */
export class AuthService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Extracts and validates JWT token from Authorization header
   * 
   * @param authHeader - Authorization header value
   * @returns Promise<AuthenticationResult> Authentication result with user data or error
   */
  async validateBearerToken(authHeader: string | null): Promise<AuthenticationResult> {
    try {
      if (!authHeader) {
        return {
          success: false,
          error: 'Authorization header is required'
        };
      }

      // Extract token from "Bearer <token>" format
      const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
      if (!tokenMatch) {
        return {
          success: false,
          error: 'Authorization header must be in format: Bearer <token>'
        };
      }

      const token = tokenMatch[1];

      // Validate token with Supabase
      const { data: userData, error: authError } = await this.supabase.auth.getUser(token);

      if (authError || !userData.user) {
        console.warn('AuthService: Token validation failed', {
          error: authError?.message,
          hasUser: !!userData.user
        });

        return {
          success: false,
          error: 'Invalid or expired authentication token'
        };
      }

      const user = userData.user;

      // Extract user information
      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        email: user.email || '',
        isDemo: user.user_metadata?.is_demo || false,
        isEmailVerified: !!user.email_confirmed_at
      };

      console.debug('AuthService: Token validated successfully', {
        userId: user.id.substring(0, 8) + '...',
        email: user.email,
        isDemo: authenticatedUser.isDemo,
        isEmailVerified: authenticatedUser.isEmailVerified
      });

      return {
        success: true,
        user: authenticatedUser
      };

    } catch (error) {
      console.error('AuthService: Unexpected error during token validation', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      return {
        success: false,
        error: 'Authentication service error'
      };
    }
  }

  /**
   * Validates that user has verified email (if required)
   * 
   * @param user - Authenticated user
   * @param requireVerified - Whether email verification is required
   * @returns boolean True if verification requirement is met
   */
  validateEmailVerification(user: AuthenticatedUser, requireVerified: boolean = true): boolean {
    if (!requireVerified) {
      return true;
    }

    // Demo users don't need email verification
    if (user.isDemo) {
      return true;
    }

    return user.isEmailVerified;
  }

  /**
   * Checks if user has demo limitations
   * 
   * @param user - Authenticated user
   * @returns boolean True if user is demo user with limitations
   */
  isDemoUser(user: AuthenticatedUser): boolean {
    return user.isDemo;
  }
}

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  requireEmailVerification?: boolean;
  allowDemoUsers?: boolean;
}

/**
 * Creates authentication middleware for API routes
 * 
 * @param supabase - Supabase client instance
 * @param options - Authentication options
 * @returns Authentication middleware function
 */
export function createAuthMiddleware(
  supabase: SupabaseClient<Database>,
  options: AuthMiddlewareOptions = {}
) {
  const authService = new AuthService(supabase);
  const {
    requireEmailVerification = true,
    allowDemoUsers = true
  } = options;

  return async function requireAuth(request: Request): Promise<{
    success: boolean;
    user?: AuthenticatedUser;
    response?: Response;
  }> {
    try {
      const requestId = crypto.randomUUID();
      
      console.info('AuthMiddleware: Processing authentication', {
        requestId,
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent')?.substring(0, 50)
      });

      // Extract authorization header
      const authHeader = request.headers.get('authorization');
      
      // Validate token
      const authResult = await authService.validateBearerToken(authHeader);

      if (!authResult.success || !authResult.user) {
        console.warn('AuthMiddleware: Authentication failed', {
          requestId,
          error: authResult.error,
          hasAuthHeader: !!authHeader
        });

        return {
          success: false,
          response: createErrorResponse(
            new ApiError(
              HttpStatus.UNAUTHORIZED,
              ErrorCode.UNAUTHORIZED,
              authResult.error || 'Authentication required'
            ),
            requestId
          )
        };
      }

      const user = authResult.user;

      // Check demo user restrictions
      if (!allowDemoUsers && user.isDemo) {
        console.warn('AuthMiddleware: Demo user access denied', {
          requestId,
          userId: user.id.substring(0, 8) + '...'
        });

        return {
          success: false,
          response: createErrorResponse(
            new ApiError(
              HttpStatus.FORBIDDEN,
              ErrorCode.FORBIDDEN,
              'Demo users are not allowed to access this resource'
            ),
            requestId
          )
        };
      }

      // Check email verification
      if (!authService.validateEmailVerification(user, requireEmailVerification)) {
        console.warn('AuthMiddleware: Email verification required', {
          requestId,
          userId: user.id.substring(0, 8) + '...',
          isEmailVerified: user.isEmailVerified
        });

        return {
          success: false,
          response: createErrorResponse(
            new ApiError(
              HttpStatus.FORBIDDEN,
              ErrorCode.FORBIDDEN,
              'Email verification required to access this resource',
              { requiresEmailVerification: true }
            ),
            requestId
          )
        };
      }

      console.debug('AuthMiddleware: Authentication successful', {
        requestId,
        userId: user.id.substring(0, 8) + '...',
        email: user.email,
        isDemo: user.isDemo
      });

      return {
        success: true,
        user
      };

    } catch (error) {
      const requestId = crypto.randomUUID();
      
      console.error('AuthMiddleware: Unexpected error', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      return {
        success: false,
        response: createErrorResponse(
          new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ErrorCode.INTERNAL_SERVER_ERROR,
            'Authentication service error'
          ),
          requestId
        )
      };
    }
  };
}

/**
 * Simple authentication helper for quick integration
 * 
 * @param request - Request object
 * @param supabase - Supabase client
 * @returns Promise<AuthenticatedUser> Authenticated user or throws ApiError
 */
export async function requireAuthentication(
  request: Request, 
  supabase: SupabaseClient<Database>
): Promise<AuthenticatedUser> {
  const authMiddleware = createAuthMiddleware(supabase);
  const result = await authMiddleware(request);

  if (!result.success || !result.user) {
    if (result.response) {
      // Extract error information from response
      throw new ApiError(
        result.response.status as HttpStatus,
        ErrorCode.UNAUTHORIZED,
        'Authentication failed'
      );
    }
    
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      'Authentication required'
    );
  }

  return result.user;
}

/**
 * Demo-friendly authentication that allows demo users
 */
export async function requireDemoFriendlyAuth(
  request: Request,
  supabase: SupabaseClient<Database>
): Promise<AuthenticatedUser> {
  const authMiddleware = createAuthMiddleware(supabase, {
    requireEmailVerification: false,
    allowDemoUsers: true
  });
  
  const result = await authMiddleware(request);

  if (!result.success || !result.user) {
    if (result.response) {
      throw new ApiError(
        result.response.status as HttpStatus,
        ErrorCode.UNAUTHORIZED,
        'Authentication failed'
      );
    }
    
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      'Authentication required'
    );
  }

  return result.user;
}

/**
 * Strict authentication that requires verified email
 */
export async function requireVerifiedAuth(
  request: Request,
  supabase: SupabaseClient<Database>
): Promise<AuthenticatedUser> {
  const authMiddleware = createAuthMiddleware(supabase, {
    requireEmailVerification: true,
    allowDemoUsers: false
  });
  
  const result = await authMiddleware(request);

  if (!result.success || !result.user) {
    if (result.response) {
      throw new ApiError(
        result.response.status as HttpStatus,
        ErrorCode.UNAUTHORIZED,
        'Authentication failed'
      );
    }
    
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      'Verified authentication required'
    );
  }

  return result.user;
}

/**
 * Rate limiting for authenticated users
 */
export interface UserRateLimit {
  userId: string;
  requestCount: number;
  windowStart: number;
  windowDurationMs: number;
  maxRequests: number;
}

/**
 * In-memory rate limit store for authenticated users
 */
class UserRateLimitStore {
  private store = new Map<string, UserRateLimit>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  checkRateLimit(userId: string, maxRequests: number, windowMs: number): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const current = this.store.get(userId);

    if (!current || (now - current.windowStart) >= windowMs) {
      // New window or user
      const rateLimit: UserRateLimit = {
        userId,
        requestCount: 1,
        windowStart: now,
        windowDurationMs: windowMs,
        maxRequests
      };
      
      this.store.set(userId, rateLimit);
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      };
    }

    // Increment request count
    current.requestCount++;
    this.store.set(userId, current);

    const remaining = Math.max(0, maxRequests - current.requestCount);
    const resetTime = current.windowStart + windowMs;

    return {
      allowed: current.requestCount <= maxRequests,
      remaining,
      resetTime
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [userId, rateLimit] of this.store.entries()) {
      if ((now - rateLimit.windowStart) >= rateLimit.windowDurationMs) {
        this.store.delete(userId);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limiter for authenticated users
const userRateLimiter = new UserRateLimitStore();

/**
 * Check rate limiting for authenticated users
 * 
 * @param user - Authenticated user
 * @param maxRequests - Maximum requests per window (default: 100)
 * @param windowMs - Window duration in milliseconds (default: 1 minute)
 * @returns Rate limit check result with headers
 */
export function checkUserRateLimit(
  user: AuthenticatedUser,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000
): {
  allowed: boolean;
  headers: Record<string, string>;
} {
  // Demo users might have different limits
  const adjustedMaxRequests = user.isDemo ? Math.min(maxRequests, 50) : maxRequests;
  
  const result = userRateLimiter.checkRateLimit(user.id, adjustedMaxRequests, windowMs);
  
  const resetTime = Math.ceil(result.resetTime / 1000);
  
  return {
    allowed: result.allowed,
    headers: {
      'X-RateLimit-Limit-User': adjustedMaxRequests.toString(),
      'X-RateLimit-Remaining-User': result.remaining.toString(),
      'X-RateLimit-Reset-User': resetTime.toString(),
      'X-User-Type': user.isDemo ? 'demo' : 'verified'
    }
  };
}