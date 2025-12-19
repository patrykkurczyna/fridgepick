import React, { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Walidacja formularza rejestracji
 */
const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string
): string | null => {
  if (!email) {
    return 'Email jest wymagany';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Nieprawidłowy format email';
  }
  if (!password) {
    return 'Hasło jest wymagane';
  }
  if (password.length < 8) {
    return 'Hasło musi mieć minimum 8 znaków';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Hasło musi zawierać małe i wielkie litery oraz cyfrę';
  }
  if (password !== confirmPassword) {
    return 'Hasła muszą być identyczne';
  }
  return null;
};

/**
 * Sprawdza siłę hasła i zwraca wskaźnik
 */
const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  label: string;
  color: string;
} => {
  if (password.length < 8) {
    return { strength: 'weak', label: 'Słabe', color: 'bg-red-500' };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (criteriaCount >= 4 && password.length >= 12) {
    return { strength: 'strong', label: 'Silne', color: 'bg-green-500' };
  }
  if (criteriaCount >= 3 && password.length >= 8) {
    return { strength: 'medium', label: 'Średnie', color: 'bg-yellow-500' };
  }
  return { strength: 'weak', label: 'Słabe', color: 'bg-red-500' };
};

/**
 * Formularz rejestracji użytkownika
 * Obsługuje walidację client-side i wywołanie API rejestracji
 */
export const RegisterForm: React.FC = () => {
  const [formState, setFormState] = useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    error: null,
    success: false
  });

  const passwordStrength = formState.password
    ? getPasswordStrength(formState.password)
    : null;

  const handleInputChange = (field: 'email' | 'password' | 'confirmPassword') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormState(prev => ({
      ...prev,
      [field]: e.target.value,
      error: null
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Walidacja client-side
    const validationError = validateRegisterForm(
      formState.email,
      formState.password,
      formState.confirmPassword
    );

    if (validationError) {
      setFormState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Rejestracja nie powiodła się');
      }

      console.log('Registration successful:', {
        email: formState.email,
        requiresEmailVerification: data.requiresEmailVerification
      });

      // If email verification is NOT required (auto-login), redirect to fridge
      if (!data.requiresEmailVerification) {
        // Store session data if provided
        if (data.session) {
          localStorage.setItem('sb-access-token', data.session.access_token);
          localStorage.setItem('sb-refresh-token', data.session.refresh_token);
        }

        // Redirect to fridge
        window.location.href = '/fridge';
        return;
      }

      // Otherwise, show success message with email verification instructions
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        success: true
      }));

    } catch (err) {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd'
      }));
    }
  };

  // Widok sukcesu - po pomyślnej rejestracji
  if (formState.success) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Rejestracja przebiegła pomyślnie!
          </h3>
          <p className="text-sm text-green-800 mb-4">
            Sprawdź swoją skrzynkę email <strong>{formState.email}</strong> i kliknij link
            aktywacyjny, aby zweryfikować swoje konto.
          </p>
          <p className="text-xs text-green-700">
            Jeśli nie widzisz emaila, sprawdź folder spam.
          </p>
        </div>

        <div className="text-center">
          <a
            href="/auth/login"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
          >
            Przejdź do logowania
          </a>
        </div>
      </div>
    );
  }

  // Formularz rejestracji
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Komunikat błędu */}
      {formState.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{formState.error}</p>
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={formState.email}
          onChange={handleInputChange('email')}
          disabled={formState.isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                     transition-colors"
          placeholder="twoj@email.com"
        />
      </div>

      {/* Hasło */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Hasło
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={formState.password}
          onChange={handleInputChange('password')}
          disabled={formState.isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                     transition-colors"
          placeholder="••••••••"
        />

        {/* Wskaźnik siły hasła */}
        {passwordStrength && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Siła hasła:</span>
              <span className="text-xs font-medium text-gray-700">
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${passwordStrength.color}`}
                style={{
                  width:
                    passwordStrength.strength === 'weak'
                      ? '33%'
                      : passwordStrength.strength === 'medium'
                      ? '66%'
                      : '100%'
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Wymagania hasła */}
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <p>Hasło musi zawierać:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li className={formState.password.length >= 8 ? 'text-green-600' : ''}>
              Minimum 8 znaków
            </li>
            <li className={/[a-z]/.test(formState.password) ? 'text-green-600' : ''}>
              Małą literę
            </li>
            <li className={/[A-Z]/.test(formState.password) ? 'text-green-600' : ''}>
              Wielką literę
            </li>
            <li className={/\d/.test(formState.password) ? 'text-green-600' : ''}>
              Cyfrę
            </li>
          </ul>
        </div>
      </div>

      {/* Potwierdzenie hasła */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Potwierdź hasło
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={formState.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          disabled={formState.isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                     transition-colors"
          placeholder="••••••••"
        />
        {formState.confirmPassword && formState.password !== formState.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">Hasła nie są identyczne</p>
        )}
      </div>

      {/* Przycisk rejestracji */}
      <Button
        type="submit"
        disabled={formState.isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        size="lg"
      >
        {formState.isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Rejestracja...
          </span>
        ) : (
          'Zarejestruj się'
        )}
      </Button>

      {/* Link do logowania */}
      <div className="text-center text-sm text-gray-600">
        Masz już konto?{' '}
        <a
          href="/auth/login"
          className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          Zaloguj się
        </a>
      </div>
    </form>
  );
};
