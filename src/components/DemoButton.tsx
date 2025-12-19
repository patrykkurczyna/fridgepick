import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Demo button component for the landing page
 * Creates a demo user account and redirects to /fridge?demo=true
 */
export const DemoButton: React.FC = () => {
  const { createDemoUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createDemoUser();

      if (result.success) {
        // Redirect to fridge with demo mode parameter
        window.location.href = '/fridge?demo=true';
      } else {
        setError(result.error || 'Nie udało się utworzyć konta demo');
      }
    } catch (err) {
      setError('Wystąpił błąd połączenia');
      console.error('Demo user creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleDemoClick}
        disabled={isLoading}
        className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
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
            Tworzenie konta demo...
          </span>
        ) : (
          '🎭 Wypróbuj tryb Demo'
        )}
      </button>
      <p className="text-sm text-gray-500 text-center">
        Przetestuj aplikację bez rejestracji
      </p>
      {error && (
        <p className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
};
