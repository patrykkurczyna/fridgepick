import React from 'react';
import { useProductForm } from '@/hooks/useProductForm';
import { useProductCategories } from '@/hooks/useProductCategories';
import { ProductForm } from './ProductForm';

interface ProductFormViewProps {
  mode: 'create' | 'edit';
  productId?: string;
}

/**
 * Główny container zarządzający stanem całego formularza
 */
export const ProductFormView: React.FC<ProductFormViewProps> = ({ 
  mode, 
  productId 
}) => {
  const {
    formData,
    validationErrors,
    loadingState,
    submitError,
    isFormValid,
    isSubmitEnabled,
    hasChanges,
    handleFieldChange,
    handleFieldBlur,
    submitForm,
    deleteProduct,
    resetForm
  } = useProductForm(mode, productId);

  const { categories, loading: categoriesLoading, error: categoriesError } = useProductCategories();

  // Handle form submission
  const handleSubmit = async (data: any) => {
    const success = await submitForm();
    if (success) {
      // Navigate back to fridge view
      window.location.href = '/fridge';
    }
  };

  // Handle cancel
  const handleCancel = () => {
    window.location.href = '/fridge';
  };

  // Handle delete
  const handleDelete = async () => {
    const success = await deleteProduct();
    if (success) {
      // Navigate back to fridge view
      window.location.href = '/fridge';
    }
  };

  // Show loading spinner when loading form data in edit mode
  if (loadingState.form) {
    return (
      <div className="product-form-view min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="ml-3 text-gray-600">Ładowanie danych produktu...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if categories failed to load
  if (categoriesError && !categoriesLoading) {
    return (
      <div className="product-form-view min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Błąd ładowania kategorii</h3>
              <p className="text-gray-600 mb-4">{categoriesError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Spróbuj ponownie
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-form-view min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="page-header mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800 mb-2 flex items-center"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Powrót do lodówki
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Dodaj nowy produkt' : 'Edytuj produkt'}
              </h1>
              <p className="text-gray-600 mt-1">
                {mode === 'create' 
                  ? 'Dodaj produkt do swojej lodówki aby móc go uwzględnić w planowaniu posiłków'
                  : 'Zaktualizuj informacje o produkcie w swojej lodówce'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* General Error Message */}
            {submitError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Wystąpił błąd
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {submitError}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Form */}
            <ProductForm
              formData={formData}
              errors={validationErrors}
              categories={categories}
              onFieldChange={handleFieldChange}
              onFieldBlur={handleFieldBlur}
              onSubmit={handleSubmit}
              loading={categoriesLoading || loadingState.submit}
              mode={mode}
              onCancel={handleCancel}
              onDelete={mode === 'edit' ? handleDelete : undefined}
              saveLoading={loadingState.submit}
              deleteLoading={loadingState.delete}
              disabled={!isSubmitEnabled || categoriesLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};