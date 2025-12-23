import React, { useState } from "react";
import { PlusIcon, SparklesIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getAccessToken } from "@/hooks/useAuth";

interface FridgeHeaderProps {
  onAddProduct: () => void;
  onProductsGenerated?: () => void;
  onClearFridge?: () => void;
}

/**
 * Header sekcji lodówki z tytułem i akcjami
 */
export const FridgeHeader: React.FC<FridgeHeaderProps> = ({ onAddProduct, onProductsGenerated, onClearFridge }) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /**
   * Handle generating sample products
   */
  const handleSeedProducts = async () => {
    setIsSeeding(true);
    setSeedMessage(null);

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
        setSeedMessage({ type: "success", text: data.message });
        // Refresh the page or call callback after a short delay
        setTimeout(() => {
          if (onProductsGenerated) {
            onProductsGenerated();
          } else {
            window.location.reload();
          }
        }, 1500);
      } else {
        setSeedMessage({ type: "error", text: data.error || "Nie udało się wygenerować produktów." });
      }
    } catch {
      setSeedMessage({ type: "error", text: "Wystąpił błąd podczas generowania produktów." });
    } finally {
      setIsSeeding(false);
    }
  };

  /**
   * Handle clearing fridge
   */
  const handleClearFridge = () => {
    if (onClearFridge) {
      onClearFridge();
    } else {
      // TODO: Implement clear fridge functionality
      alert("Funkcja wyczyść lodówkę - do zaimplementowania");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl truncate">Moja Lodówka</h1>
            <p className="mt-0.5 text-xs text-gray-500 md:text-sm">Zarządzaj produktami w swojej lodówce i spiżarni</p>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Clear Fridge Button */}
            <button
              onClick={handleClearFridge}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
            >
              <TrashIcon className="w-5 h-5" />
              Wyczyść lodówkę
            </button>

            {/* Generate Button */}
            <button
              onClick={handleSeedProducts}
              disabled={isSeeding}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeeding ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Wygeneruj lodówkę
                </>
              )}
            </button>

            {/* Add Button */}
            <button
              onClick={onAddProduct}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
            >
              <PlusIcon className="w-5 h-5" />
              Dodaj produkt
            </button>
          </div>
        </div>

        {/* Seed message */}
        {seedMessage && (
          <div
            className={`mt-3 text-sm rounded-lg px-3 py-2 ${
              seedMessage.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {seedMessage.type === "success" ? "✅ " : "❌ "}
            {seedMessage.text}
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <button
        onClick={onAddProduct}
        className="fixed bottom-6 right-6 z-50 md:hidden bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl flex items-center justify-center cursor-pointer"
        aria-label="Dodaj produkt"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </header>
  );
};
