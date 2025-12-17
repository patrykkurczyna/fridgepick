import React from 'react';
import type { FormActionsProps } from '@/types/product-form';

/**
 * Container z akcjami formularza (Save, Cancel, Delete)
 */
export const FormActions: React.FC<FormActionsProps> = ({
  mode,
  onCancel,
  onDelete,
  saveLoading,
  deleteLoading,
  disabled
}) => {
  const handleDeleteClick = () => {
    if (onDelete && window.confirm('Czy na pewno chcesz usunąć ten produkt?')) {
      onDelete();
    }
  };

  return (
    <div className="form-actions flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
      {/* Save Button */}
      <button
        type="submit"
        disabled={disabled || saveLoading}
        className={`
          flex-1 px-4 py-2 rounded-md font-medium transition-colors
          ${disabled || saveLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer'
          }
        `}
      >
        {saveLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {mode === 'create' ? 'Dodawanie...' : 'Zapisywanie...'}
          </span>
        ) : (
          mode === 'create' ? 'Dodaj produkt' : 'Zapisz zmiany'
        )}
      </button>

      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={saveLoading || deleteLoading}
        className={`
          flex-1 px-4 py-2 rounded-md font-medium transition-colors border
          ${saveLoading || deleteLoading
            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer'
          }
        `}
      >
        Anuluj
      </button>

      {/* Delete Button (only in edit mode) */}
      {mode === 'edit' && onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={saveLoading || deleteLoading}
          className={`
            px-4 py-2 rounded-md font-medium transition-colors
            ${saveLoading || deleteLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer'
            }
          `}
        >
          {deleteLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Usuwanie...
            </span>
          ) : (
            'Usuń produkt'
          )}
        </button>
      )}
    </div>
  );
};