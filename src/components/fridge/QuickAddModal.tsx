import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { QuickAddItem, ProductCategory } from '@/types/fridge';
import type { DatabaseEnums } from '@/types';

interface QuickAddModalProps {
  isOpen: boolean;
  item: QuickAddItem;
  onClose: () => void;
  onSubmit: (item: QuickAddItem, customData?: Partial<QuickAddItem>) => Promise<void>;
  loading: boolean;
  categories: ProductCategory[];
}

/**
 * Modal do szybkiego dodawania produktu z możliwością edycji podstawowych danych
 * Pre-filled z danymi z QuickAddItem, ale umożliwia customization
 */
export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  item,
  onClose,
  onSubmit,
  loading,
  categories
}) => {
  const [formData, setFormData] = useState({
    name: item.name,
    categoryId: item.categoryId,
    quantity: item.defaultQuantity,
    unit: item.defaultUnit as DatabaseEnums['unit_type'],
    expiresAt: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Reset form when item changes
  useEffect(() => {
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      quantity: item.defaultQuantity,
      unit: item.defaultUnit as DatabaseEnums['unit_type'],
      expiresAt: ''
    });
    setError(null);
  }, [item]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  /**
   * Handle form field changes
   */
  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Nazwa produktu jest wymagana');
      return;
    }
    
    if (formData.quantity <= 0) {
      setError('Ilość musi być większa od zera');
      return;
    }

    try {
      await onSubmit(item, {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        defaultQuantity: formData.quantity,
        defaultUnit: formData.unit
      });
    } catch (error) {
      setError('Nie udało się dodać produktu. Spróbuj ponownie.');
    }
  };

  /**
   * Get default expiry date (7 days from now)
   */
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon || '📦'}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Szybkie dodawanie
                </h3>
                <p className="text-sm text-gray-500">
                  Dodaj {item.name} do lodówki
                </p>
              </div>
            </div>
            
            {!loading && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Product name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa produktu
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                maxLength={100}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategoria
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <p className="mt-1 text-xs text-gray-500">
                  {selectedCategory.description}
                </p>
              )}
            </div>

            {/* Quantity and unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ilość
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jednostka
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value as DatabaseEnums['unit_type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="szt">szt</option>
                </select>
              </div>
            </div>

            {/* Expiry date (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data ważności (opcjonalne)
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleInputChange('expiresAt', getDefaultExpiryDate())}
                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                disabled={loading}
              >
                Ustaw na +7 dni
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Dodawanie...' : 'Dodaj produkt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};