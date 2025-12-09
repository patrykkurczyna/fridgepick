import { useState, useEffect } from 'react';
import type { UserDTO } from '@/types';

// Placeholder useAuth hook - będzie zastąpiony prawdziwym podczas implementacji auth
interface AuthState {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Temporary useAuth hook for development
 * W prawdziwej implementacji będzie to pełnowartościowy hook autoryzacji
 */
export const useAuth = (): AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
} => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  });

  // Mock authentication check
  useEffect(() => {
    const checkAuth = () => {
      // For development, simulate authenticated user
      // In production, this would check JWT token, etc.
      const mockUser: UserDTO = {
        id: 'mock-user-id',
        email: 'user@example.com',
        isDemo: false,
        isEmailVerified: true,
        accessToken: 'mock-jwt-token-for-development'
      } as any;

      setState({
        user: mockUser,
        loading: false,
        isAuthenticated: true
      });
    };

    // Simulate loading time
    setTimeout(checkAuth, 100);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login implementation
    setState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: UserDTO = {
      id: 'mock-user-id',
      email,
      isDemo: false,
      isEmailVerified: true,
      accessToken: 'mock-jwt-token-for-development'
    } as any;

    setState({
      user: mockUser,
      loading: false,
      isAuthenticated: true
    });
  };

  const logout = () => {
    setState({
      user: null,
      loading: false,
      isAuthenticated: false
    });
  };

  const register = async (email: string, password: string) => {
    // Mock register implementation
    setState(prev => ({ ...prev, loading: true }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: UserDTO = {
      id: 'mock-user-id',
      email,
      isDemo: false,
      isEmailVerified: false, // Would need email verification
      accessToken: 'mock-jwt-token-for-development'
    } as any;

    setState({
      user: mockUser,
      loading: false,
      isAuthenticated: true
    });
  };

  return {
    ...state,
    login,
    logout,
    register
  };
};