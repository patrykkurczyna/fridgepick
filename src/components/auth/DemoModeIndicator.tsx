import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, getAccessToken } from "@/hooks/useAuth";

/**
 * Baner informacyjny dla trybu demo
 * Wyświetlany jako sticky top banner na chronionych stronach
 * Informuje użytkownika o ograniczeniach demo i zachęca do rejestracji
 */
export const DemoModeIndicator: React.FC = () => {
  const { logout } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  const handleSeedProducts = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    setSeedError(null);

    try {
      const token = getAccessToken();
      const response = await fetch("/api/demo/seed-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (data.success) {
        setSeedMessage(data.message);
        // Refresh the page after a short delay to show the new products
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSeedError(data.error || "Nie udało się wygenerować produktów.");
      }
    } catch (error) {
      console.error("Error seeding products:", error);
      setSeedError("Wystąpił błąd podczas generowania produktów.");
    } finally {
      setIsSeeding(false);
    }
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
            <Button
              onClick={handleSeedProducts}
              disabled={isSeeding}
              size="sm"
              variant="outline"
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
            >
              {isSeeding ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generuję...
                </span>
              ) : (
                <>🥗 Wygeneruj lodówkę</>
              )}
            </Button>

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

        {/* Komunikaty sukcesu/błędu */}
        {(seedMessage || seedError) && (
          <div className="pb-2">
            {seedMessage && (
              <div className="text-sm text-emerald-700 bg-emerald-50 rounded px-3 py-1 inline-block">
                ✅ {seedMessage}
              </div>
            )}
            {seedError && (
              <div className="text-sm text-red-700 bg-red-50 rounded px-3 py-1 inline-block">{seedError}</div>
            )}
          </div>
        )}

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
