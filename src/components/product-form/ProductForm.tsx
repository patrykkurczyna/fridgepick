import React from 'react';
import type { ProductFormProps } from '@/types/product-form';
import { FormField } from './FormField';
import { CategoryDropdown } from './CategoryDropdown';
import { UnitSelector } from './UnitSelector';
import { DatePicker } from './DatePicker';
import { FormActions } from './FormActions';

/**
 * Główny formularz zawierający wszystkie pola produktu z real-time validation
 */
export const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  errors,
  categories,
  onFieldChange,
  onFieldBlur,
  onSubmit,
  loading,
  mode,
  onCancel,
  onDelete,
  saveLoading,
  deleteLoading,
  disabled
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Get appropriate step and placeholder based on unit
  const getQuantitySettings = () => {
    switch (formData.unit) {
      case 'g':
        return { step: '1', placeholder: '500', label: 'gramy' };
      case 'l':
        return { step: '0.1', placeholder: '1.5', label: 'litry' };
      case 'szt':
        return { step: '1', placeholder: '2', label: 'sztuki' };
      default:
        return { step: '0.1', placeholder: '1', label: '' };
    }
  };

  const quantitySettings = getQuantitySettings();

  return (
    <form onSubmit={handleSubmit} className="product-form space-y-6">
      {/* Name Field */}
      <FormField
        label="Nazwa produktu"
        error={errors.name}
        required
      >
        <input
          type="text"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          onBlur={() => onFieldBlur('name')}
          placeholder="np. Mleko 2%"
          disabled={loading}
          maxLength={255}
        />
      </FormField>

      {/* Category Field */}
      <FormField
        label="Kategoria"
        error={errors.categoryId}
        required
      >
        <CategoryDropdown
          categories={categories}
          value={formData.categoryId}
          onChange={(categoryId) => {
            onFieldChange('categoryId', categoryId);
            onFieldBlur('categoryId', categoryId);
          }}
          error={errors.categoryId}
        />
      </FormField>

      {/* Quantity and Unit Fields - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Ilość"
          error={errors.quantity}
          required
        >
          <input
            type="number"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.quantity ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.quantity || ''}
            onChange={(e) => {
              const value = e.target.value;
              onFieldChange('quantity', value === '' ? null : parseFloat(value));
            }}
            onBlur={() => onFieldBlur('quantity')}
            placeholder={quantitySettings.placeholder}
            min="0"
            step={quantitySettings.step}
            disabled={loading}
          />
        </FormField>

        <FormField
          label="Jednostka"
          error={errors.unit}
          required
        >
          <UnitSelector
            value={formData.unit}
            onChange={(unit) => {
              onFieldChange('unit', unit);
              onFieldBlur('unit', unit);
            }}
            error={errors.unit}
          />
        </FormField>
      </div>

      {/* Expiry Date Field */}
      <FormField
        label="Data ważności"
        error={errors.expiresAt}
      >
        <DatePicker
          value={formData.expiresAt}
          onChange={(date) => {
            onFieldChange('expiresAt', date);
            if (date) onFieldBlur('expiresAt', date);
          }}
          error={errors.expiresAt}
          placeholder="Opcjonalna data ważności"
        />
      </FormField>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Wskazówki dotyczące formularza
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Wszystkie pola oznaczone * są wymagane</li>
                <li>Data ważności jest opcjonalna - pozostaw pustą jeśli nie znasz</li>
                <li>Ilość: liczby całkowite dla gramów i sztuk, dziesiętne dla litrów</li>
                <li>Wybierz odpowiednią jednostkę: gramy (g), litry (l) lub sztuki (szt)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <FormActions
        mode={mode}
        onCancel={onCancel}
        onDelete={mode === 'edit' ? onDelete : undefined}
        saveLoading={saveLoading}
        deleteLoading={deleteLoading}
        disabled={disabled}
      />
    </form>
  );
};