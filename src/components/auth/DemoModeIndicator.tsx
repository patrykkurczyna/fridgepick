import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/**
 * Baner informacyjny dla trybu demo
 * Wyświetlany jako sticky top banner na chronionych stronach
 * Informuje użytkownika o ograniczeniach demo i zachęca do rejestracji
 */
export const DemoModeIndicator: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-100 to-yellow-50 border-b border-yellow-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          {/* Ikona i Informacja */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex-shrink-0">
              <span className="text-2xl" role="img" aria-label="Demo mode">
                🎭
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-900">Tryb Demo</p>
              <p className="text-xs text-yellow-800">
                Twoje dane będą usunięte po 7 dniach. Zarejestruj się, aby zapisać je na stałe.
              </p>
            </div>
          </div>

          {/* Przyciski akcji */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm cursor-pointer">
              <a href="/auth/register">Zarejestruj się</a>
            </Button>

            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="border-yellow-400 text-yellow-900 hover:bg-yellow-100 cursor-pointer"
            >
              Wyjdź
            </Button>
          </div>
        </div>

        {/* Dodatkowe informacje (opcjonalne, na większych ekranach) */}
        <div className="hidden lg:block pb-2">
          <div className="flex items-center gap-4 text-xs text-yellow-700">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Dane usuwane po 7 dniach</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Pełna funkcjonalność dostępna</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Rejestracja bezpłatna</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
