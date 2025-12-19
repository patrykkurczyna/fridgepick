import React, { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { createSupabaseClientInstance } from '@/db/supabase.client';

interface ResetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Walidacja hasła
 */
const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Hasło jest wymagane';
  }
  if (password.length < 8) {
    return 'Hasło musi mieć minimum 8 znaków';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Hasło musi zawierać małe i wielkie litery oraz cyfrę';
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
 * Formularz resetowania hasła
 * Umożliwia ustawienie nowego hasła po kliknięciu w link z emaila
 * Supabase automatycznie loguje użytkownika z linku, więc używamy aktualnej sesji
 */
export const ResetPasswordForm: React.FC = () => {
  const [formState, setFormState] = useState<ResetPasswordFormState>({
    newPassword: '',
    confirmPassword: '',
    isLoading: false,
    error: null,
    success: false
  });

  const passwordStrength = formState.newPassword
    ? getPasswordStrength(formState.newPassword)
    : null;

  const handleInputChange = (field: 'newPassword' | 'confirmPassword') => (
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
    const passwordError = validatePassword(formState.newPassword);
    if (passwordError) {
      setFormState(prev => ({ ...prev, error: passwordError }));
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      setFormState(prev => ({ ...prev, error: 'Hasła muszą być identyczne' }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call the reset password API
      // Note: Supabase automatically validates the token from the session
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: formState.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Resetowanie hasła nie powiodło się');
      }

      console.log('Password reset successful');

      // Show success message
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        success: true
      }));

      // Logout user (clear recovery session) and redirect to login after 2 seconds
      setTimeout(async () => {
        try {
          // Use Supabase client to sign out immediately (clears session)
          const supabase = createSupabaseClientInstance();
          await supabase.auth.signOut();

          // Also call the logout API to clear server-side cookies
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          console.error('Logout error:', e);
        }

        // Force redirect to login page with logged_out param
        window.location.href = '/auth/login?logged_out=true';
      }, 2000);

    } catch (err) {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd'
      }));
    }
  };

  // Widok sukcesu - po pomyślnym resecie hasła
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
            Hasło zostało zmienione!
          </h3>
          <p className="text-sm text-green-800 mb-4">
            Twoje hasło zostało pomyślnie zaktualizowane. Za chwilę zostaniesz przekierowany na stronę logowania.
          </p>
          <p className="text-xs text-green-700">
            Zaloguj się używając nowego hasła.
          </p>
        </div>

        <div className="text-center">
          <Button
            asChild
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            <a href="/auth/login">Przejdź do logowania</a>
          </Button>
        </div>
      </div>
    );
  }

  // Formularz resetowania hasła
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Komunikat błędu */}
      {formState.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{formState.error}</p>
        </div>
      )}

      {/* Nowe hasło */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nowe hasło
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          required
          value={formState.newPassword}
          onChange={handleInputChange('newPassword')}
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
            <li className={formState.newPassword.length >= 8 ? 'text-green-600' : ''}>
              Minimum 8 znaków
            </li>
            <li className={/[a-z]/.test(formState.newPassword) ? 'text-green-600' : ''}>
              Małą literę
            </li>
            <li className={/[A-Z]/.test(formState.newPassword) ? 'text-green-600' : ''}>
              Wielką literę
            </li>
            <li className={/\d/.test(formState.newPassword) ? 'text-green-600' : ''}>
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
          Potwierdź nowe hasło
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
        {formState.confirmPassword &&
          formState.newPassword !== formState.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Hasła nie są identyczne</p>
          )}
      </div>

      {/* Przycisk resetowania */}
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
            Resetowanie...
          </span>
        ) : (
          'Ustaw nowe hasło'
        )}
      </Button>
    </form>
  );
};
