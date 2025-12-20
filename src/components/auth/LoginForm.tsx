import React, { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  redirectTo?: string | null;
}

interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Walidacja formularza logowania
 */
const validateLoginForm = (email: string, password: string): string | null => {
  if (!email) {
    return "Email jest wymagany";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Nieprawidłowy format email";
  }
  if (!password) {
    return "Hasło jest wymagane";
  }
  if (password.length < 8) {
    return "Hasło musi mieć minimum 8 znaków";
  }
  return null;
};

/**
 * Formularz logowania użytkownika
 * Obsługuje walidację client-side i wywołanie API logowania
 */
export const LoginForm: React.FC<LoginFormProps> = ({ redirectTo }) => {
  const { login } = useAuth();
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    rememberMe: false,
    isLoading: false,
    error: null,
  });

  const handleInputChange = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      [field]: e.target.value,
      error: null, // Wyczyść błąd przy zmianie wartości
    }));
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      rememberMe: e.target.checked,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Walidacja client-side
    const validationError = validateLoginForm(formState.email, formState.password);
    if (validationError) {
      setFormState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Wywołanie API logowania przez useAuth hook
      const result = await login(formState.email, formState.password, formState.rememberMe);

      if (result.success) {
        // Sukces - przekieruj użytkownika
        const destination = redirectTo || "/fridge";
        window.location.href = destination;
      } else {
        // Błąd - wyświetl komunikat
        setFormState((prev) => ({
          ...prev,
          error: result.error || "Logowanie nie powiodło się",
        }));
      }
    } catch (err) {
      setFormState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd",
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={formState.email}
          onChange={handleInputChange("email")}
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
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Hasło
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={formState.password}
          onChange={handleInputChange("password")}
          disabled={formState.isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                     transition-colors"
          placeholder="••••••••"
        />
      </div>

      {/* Remember me i Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={formState.rememberMe}
            onChange={handleRememberMeChange}
            disabled={formState.isLoading}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded
                       disabled:cursor-not-allowed"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Zapamiętaj mnie
          </label>
        </div>

        <div className="text-sm">
          <a
            href="/auth/forgot-password"
            className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
          >
            Zapomniałeś hasła?
          </a>
        </div>
      </div>

      {/* Przycisk logowania */}
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Logowanie...
          </span>
        ) : (
          "Zaloguj się"
        )}
      </Button>

      {/* Link do rejestracji */}
      <div className="text-center text-sm text-gray-600">
        Nie masz konta?{" "}
        <a
          href="/auth/register"
          className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          Zarejestruj się
        </a>
      </div>
    </form>
  );
};
