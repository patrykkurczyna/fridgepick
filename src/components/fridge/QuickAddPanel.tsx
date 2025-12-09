import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { QuickAddItem, ProductCategory } from '@/types/fridge';
import { QUICK_ADD_PRODUCTS, getPopularQuickAddProducts } from '@/data/quickAddProducts';
import { QuickAddModal } from './QuickAddModal';

interface QuickAddPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  onQuickAdd: (item: QuickAddItem) => Promise<void>;
  categories: ProductCategory[];
}

/**
 * Collapsible panel z predefiniowanymi popularnymi produktami do szybkiego dodania
 * Obsługuje: expand/collapse, click na item → modal z podstawowymi danymi
 */
export const QuickAddPanel: React.FC<QuickAddPanelProps> = ({
  isExpanded,
  onToggle,
  onQuickAdd,
  categories
}) => {
  const [selectedItem, setSelectedItem] = useState<QuickAddItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use popular products for better mobile experience
  const displayProducts = getPopularQuickAddProducts();

  /**
   * Handle quick add item click
   */
  const handleItemClick = (item: QuickAddItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  /**
   * Handle quick add submission from modal
   */
  const handleQuickAddSubmit = async (item: QuickAddItem, customData?: Partial<QuickAddItem>) => {
    try {
      setIsLoading(true);
      
      // Merge custom data with item defaults
      const finalItem = {
        ...item,
        ...customData
      };
      
      await onQuickAdd(finalItem);
      
      // Close modal on success
      setIsModalOpen(false);
      setSelectedItem(null);
      
    } catch (error) {
      // Error handling will be done by the modal
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleModalClose = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Toggle header */}
        <button
          onClick={onToggle}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Szybkie dodawanie</span>
            <span className="text-sm text-gray-500">
              ({displayProducts.length} produktów)
            </span>
          </div>
          
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Collapsible content */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600 mb-4">
              Kliknij na produkt aby szybko dodać go do lodówki
            </p>
            
            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {displayProducts.map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  onClick={() => handleItemClick(item)}
                  className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {item.icon || '📦'}
                  </div>
                  <span className="text-xs text-gray-700 text-center leading-tight">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {item.defaultQuantity} {item.defaultUnit}
                  </span>
                </button>
              ))}
            </div>

            {/* Show more products hint */}
            {QUICK_ADD_PRODUCTS.length > displayProducts.length && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Dostępne {QUICK_ADD_PRODUCTS.length} popularnych produktów
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick add modal */}
      {selectedItem && (
        <QuickAddModal
          isOpen={isModalOpen}
          item={selectedItem}
          onClose={handleModalClose}
          onSubmit={handleQuickAddSubmit}
          loading={isLoading}
          categories={categories}
        />
      )}
    </>
  );
};