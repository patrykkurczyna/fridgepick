import React, { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';

interface ForgotPasswordFormState {
  email: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Walidacja emaila
 */
const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email jest wymagany';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Nieprawidłowy format email';
  }
  return null;
};

/**
 * Formularz żądania resetu hasła
 * Wysyła link resetujący na podany email
 */
export const ForgotPasswordForm: React.FC = () => {
  const [formState, setFormState] = useState<ForgotPasswordFormState>({
    email: '',
    isLoading: false,
    error: null,
    success: false
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      email: e.target.value,
      error: null
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Walidacja client-side
    const validationError = validateEmail(formState.email);
    if (validationError) {
      setFormState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call the forgot password API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Wysłanie linku nie powiodło się');
      }

      console.log('Password reset email sent:', {
        email: formState.email
      });

      // Show success message
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

  // Widok sukcesu - po wysłaniu linku
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Link został wysłany!
          </h3>
          <p className="text-sm text-green-800 mb-4">
            Jeśli konto z adresem <strong>{formState.email}</strong> istnieje w systemie,
            otrzymasz wiadomość email z linkiem do resetowania hasła.
          </p>
          <p className="text-xs text-green-700">
            Sprawdź swoją skrzynkę odbiorczą i folder spam.
          </p>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Pamiętasz hasło?{' '}
            <a
              href="/auth/login"
              className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
            >
              Zaloguj się
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Formularz żądania resetu hasła
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informacja */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          Podaj adres email przypisany do Twojego konta. Wyślemy Ci link do zresetowania
          hasła.
        </p>
      </div>

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
          onChange={handleEmailChange}
          disabled={formState.isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                     transition-colors"
          placeholder="twoj@email.com"
        />
      </div>

      {/* Przycisk wysyłania */}
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
            Wysyłanie...
          </span>
        ) : (
          'Wyślij link resetujący'
        )}
      </Button>

      {/* Link powrotu */}
      <div className="text-center text-sm text-gray-600">
        <a
          href="/auth/login"
          className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          ← Powrót do logowania
        </a>
      </div>
    </form>
  );
};
