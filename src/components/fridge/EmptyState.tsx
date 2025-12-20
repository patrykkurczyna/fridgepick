import React from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  onAddFirst: () => void;
  variant?: "empty" | "no-results";
}

/**
 * Komponent wyświetlany gdy brak produktów w lodówce
 * Obsługuje dwa warianty: empty (brak produktów) i no-results (brak wyników wyszukiwania)
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ onAddFirst, variant = "empty" }) => {
  const isEmptyState = variant === "empty";
  const isNoResults = variant === "no-results";

  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Illustration */}
        <div className="mb-6">
          {isEmptyState && <div className="text-6xl mb-4">🏠</div>}
          {isNoResults && <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />}
        </div>

        {/* Heading */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isEmptyState && "Twoja lodówka jest pusta"}
          {isNoResults && "Nie znaleziono produktów"}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {isEmptyState && (
            <>
              Dodaj swoje pierwsze produkty, aby zacząć zarządzać lodówką i planować posiłki na podstawie dostępnych
              składników.
            </>
          )}
          {isNoResults && <>Spróbuj zmienić kryteria wyszukiwania lub dodaj nowe produkty do swojej lodówki.</>}
        </p>

        {/* Call to action */}
        <div className="space-y-3">
          <button
            onClick={onAddFirst}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            {isEmptyState ? "Dodaj pierwszy produkt" : "Dodaj nowy produkt"}
          </button>

          {isEmptyState && (
            <div className="text-sm text-gray-500">
              <p>Możesz również wypróbować:</p>
              <ul className="mt-2 space-y-1">
                <li>• Szybkie dodawanie popularnych produktów</li>
                <li>• Przeglądanie dostępnych przepisów</li>
                <li>• Generowanie jadłospisu tygodniowego</li>
              </ul>
            </div>
          )}
        </div>

        {/* Tips for better experience */}
        {isEmptyState && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Wskazówka</h4>
            <p className="text-sm text-blue-800">
              Dodawaj produkty z datami ważności, aby aplikacja mogła lepiej rekomendować przepisy i pomagać w
              zarządzaniu żywnością.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
