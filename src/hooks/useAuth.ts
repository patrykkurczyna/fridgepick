import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClientInstance } from '../db/supabase.client.ts';
import type { UserDTO } from '@/types';

// localStorage keys
const ACCESS_TOKEN_KEY = 'fridgepick_access_token';
const USER_KEY = 'fridgepick_user';
const DEMO_CREDENTIALS_KEY = 'fridgepick_demo_credentials';

interface AuthState {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    isDemo: boolean;
    isEmailVerified: boolean;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    isDemo: boolean;
    isEmailVerified: boolean;
  };
  requiresEmailVerification?: boolean;
  message?: string;
  error?: string;
}

interface DemoResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    isDemo: boolean;
    isEmailVerified: boolean;
  };
  demoEmail?: string;
  expiresIn?: string;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  message?: string;
  error?: string;
}

interface LogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Helper function to get the current access token from localStorage
 * @returns Access token string or null if not available
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Real useAuth hook with Supabase integration
 * Manages authentication state, session sync, and token caching
 */
export const useAuth = (): AuthState & {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  createDemoUser: () => Promise<{ success: boolean; error?: string; demoEmail?: string }>;
  getAccessToken: () => string | null;
} => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  // Initialize Supabase client
  const supabase = createSupabaseClientInstance();

  /**
   * Load user from localStorage cache (fast initial load)
   */
  const loadUserFromCache = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const cachedUser = localStorage.getItem(USER_KEY);
    const cachedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (cachedUser && cachedToken) {
      try {
        return JSON.parse(cachedUser) as UserDTO;
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        return null;
      }
    }

    return null;
  }, []);

  /**
   * Save user and token to localStorage
   */
  const saveToCache = useCallback((user: UserDTO, accessToken: string) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }, []);

  /**
   * Clear user and token from localStorage
   */
  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }, []);

  /**
   * Check authentication status and load session
   */
  const checkAuth = useCallback(async () => {
    try {
      // First, try to load from cache (instant)
      const cachedUser = loadUserFromCache();
      if (cachedUser) {
        setState({
          user: cachedUser,
          loading: true, // Still loading to verify with server
          isAuthenticated: true,
        });
      }

      // Then verify with Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user: UserDTO = {
          id: session.user.id,
          email: session.user.email!,
          isDemo: session.user.user_metadata?.is_demo ?? false,
          isEmailVerified: session.user.email_confirmed_at !== null,
        };

        // Update cache
        saveToCache(user, session.access_token);

        setState({
          user,
          loading: false,
          isAuthenticated: true,
        });
      } else {
        // No session - clear cache
        clearCache();

        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearCache();

      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  }, [supabase, loadUserFromCache, saveToCache, clearCache]);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean = false
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setState((prev) => ({ ...prev, loading: true }));

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe }),
        });

        const data: LoginResponse = await response.json();

        if (data.success && data.user && data.session) {
          const user: UserDTO = {
            id: data.user.id,
            email: data.user.email,
            isDemo: data.user.isDemo,
            isEmailVerified: data.user.isEmailVerified,
          };

          // Save to cache
          saveToCache(user, data.session.access_token);

          setState({
            user,
            loading: false,
            isAuthenticated: true,
          });

          return { success: true };
        } else {
          setState((prev) => ({ ...prev, loading: false }));
          return { success: false, error: data.error || 'Logowanie nie powiodło się' };
        }
      } catch (error) {
        console.error('Login error:', error);
        setState((prev) => ({ ...prev, loading: false }));
        return { success: false, error: 'Wystąpił błąd połączenia' };
      }
    },
    [saveToCache]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }> => {
      try {
        setState((prev) => ({ ...prev, loading: true }));

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data: RegisterResponse = await response.json();

        if (data.success && data.user) {
          // If email verification is required, don't save to cache yet
          if (data.requiresEmailVerification) {
            setState((prev) => ({ ...prev, loading: false }));
            return {
              success: true,
              requiresEmailVerification: true,
            };
          }

          // User is auto-confirmed, can log in immediately
          const user: UserDTO = {
            id: data.user.id,
            email: data.user.email,
            isDemo: data.user.isDemo,
            isEmailVerified: data.user.isEmailVerified,
          };

          setState({
            user,
            loading: false,
            isAuthenticated: true,
          });

          return { success: true, requiresEmailVerification: false };
        } else {
          setState((prev) => ({ ...prev, loading: false }));
          return { success: false, error: data.error || 'Rejestracja nie powiodła się' };
        }
      } catch (error) {
        console.error('Register error:', error);
        setState((prev) => ({ ...prev, loading: false }));
        return { success: false, error: 'Wystąpił błąd połączenia' };
      }
    },
    []
  );

  /**
   * Create demo user account or reuse existing demo user
   * This function checks localStorage for existing demo credentials
   * and logs in with them if available, otherwise creates a new demo user
   */
  const createDemoUser = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
    demoEmail?: string;
  }> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Check if we have existing demo credentials in localStorage
      const storedCredentials = typeof window !== 'undefined'
        ? localStorage.getItem(DEMO_CREDENTIALS_KEY)
        : null;

      if (storedCredentials) {
        try {
          const { email, password } = JSON.parse(storedCredentials);

          // Try to login with existing demo credentials
          const loginResult = await login(email, password, false);

          if (loginResult.success) {
            console.log('Logged in with existing demo user:', email);
            setState((prev) => ({ ...prev, loading: false }));
            return {
              success: true,
              demoEmail: email
            };
          } else {
            // Login failed (user might have been deleted), remove invalid credentials
            console.log('Existing demo credentials invalid, creating new demo user');
            localStorage.removeItem(DEMO_CREDENTIALS_KEY);
          }
        } catch (parseError) {
          console.error('Error parsing demo credentials:', parseError);
          localStorage.removeItem(DEMO_CREDENTIALS_KEY);
        }
      }

      // No existing credentials or login failed - create new demo user
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data: DemoResponse = await response.json();

      if (data.success && data.user && data.session) {
        const user: UserDTO = {
          id: data.user.id,
          email: data.user.email,
          isDemo: true,
          isEmailVerified: true,
        };

        // Save to cache
        saveToCache(user, data.session.access_token);

        // Save demo credentials to localStorage for future use
        // Note: We need to get the password from the response
        // The API should return demoPassword for this purpose
        if (data.demoEmail && (data as any).demoPassword) {
          localStorage.setItem(
            DEMO_CREDENTIALS_KEY,
            JSON.stringify({
              email: data.demoEmail,
              password: (data as any).demoPassword,
            })
          );
        }

        setState({
          user,
          loading: false,
          isAuthenticated: true,
        });

        return { success: true, demoEmail: data.demoEmail };
      } else {
        setState((prev) => ({ ...prev, loading: false }));
        return { success: false, error: data.error || 'Nie udało się utworzyć konta demo' };
      }
    } catch (error) {
      console.error('Demo user creation error:', error);
      setState((prev) => ({ ...prev, loading: false }));
      return { success: false, error: 'Wystąpił błąd połączenia' };
    }
  }, [saveToCache, login]);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Clear cache
      clearCache();

      // Update state
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      // Redirect to landing page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local state
      clearCache();
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
      window.location.href = '/';
    }
  }, [clearCache]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    checkAuth();

    // Subscribe to auth state changes (cross-tab sync, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: UserDTO = {
          id: session.user.id,
          email: session.user.email!,
          isDemo: session.user.user_metadata?.is_demo ?? false,
          isEmailVerified: session.user.email_confirmed_at !== null,
        };

        saveToCache(user, session.access_token);

        setState({
          user,
          loading: false,
          isAuthenticated: true,
        });
      } else {
        clearCache();

        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, checkAuth, saveToCache, clearCache]);

  return {
    ...state,
    login,
    logout,
    register,
    createDemoUser,
    getAccessToken,
  };
};
