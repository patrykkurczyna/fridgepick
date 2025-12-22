import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { UserMenu } from "./UserMenu";

interface FridgeHeaderProps {
  onAddProduct: () => void;
}

/**
 * Header sekcji lodówki z tytułem i floating action button
 */
export const FridgeHeader: React.FC<FridgeHeaderProps> = ({ onAddProduct }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl truncate">Moja Lodówka</h1>
            <p className="mt-0.5 text-xs text-gray-500 md:text-sm">Zarządzaj produktami w swojej lodówce i spiżarni</p>
          </div>

          {/* User Menu */}
          <UserMenu />

          {/* Desktop Add Button */}
          <button
            onClick={onAddProduct}
            className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            Dodaj produkt
          </button>
        </div>
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
