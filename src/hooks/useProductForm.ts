import { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '@/hooks/useAuth';
import type {
  ProductFormData,
  ValidationErrors,
  LoadingState,
  ValidationResult
} from '@/types/product-form';
import type {
  CreateUserProductRequest,
  UpdateUserProductRequest,
  UserProductResponse,
  DatabaseEnums
} from '@/types';
import { UNIT_TYPES } from '@/types';

/**
 * Custom hook for managing product form state and validation
 */
export const useProductForm = (mode: 'create' | 'edit', productId?: string) => {
  // Initial form data
  const initialFormData: ProductFormData = {
    name: '',
    categoryId: null,
    quantity: null,
    unit: null,
    expiresAt: null
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [originalData, setOriginalData] = useState<ProductFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof ProductFormData>>(new Set());
  const [loadingState, setLoadingState] = useState<LoadingState>({
    form: false,
    submit: false,
    delete: false,
    categories: false
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validate individual field
   */
  const validateField = useCallback((field: keyof ProductFormData, value: any): string | undefined => {
    switch (field) {
      case 'name':
        const trimmedName = String(value || '').trim();
        if (!trimmedName) return 'Nazwa produktu jest wymagana';
        if (trimmedName.length > 255) return 'Nazwa nie może być dłuższa niż 255 znaków';
        break;
        
      case 'categoryId':
        if (!value || typeof value !== 'number' || value <= 0) {
          return 'Wybór kategorii jest wymagany';
        }
        break;
        
      case 'quantity':
        if (value === null || value === undefined || value === '') {
          return 'Ilość jest wymagana';
        }
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0) {
          return 'Ilość musi być liczbą większą lub równą 0';
        }
        // Check max 3 decimal places
        if (numValue.toString().split('.')[1]?.length > 3) {
          return 'Ilość może mieć maksymalnie 3 miejsca po przecinku';
        }
        break;
        
      case 'unit':
        if (!value) return 'Jednostka miary jest wymagana';
        if (!UNIT_TYPES.includes(value as any)) {
          return 'Nieprawidłowa jednostka miary';
        }
        break;
        
      case 'expiresAt':
        if (value) {
          const expiryDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (expiryDate < today) {
            return 'Data ważności nie może być w przeszłości';
          }
        }
        break;
    }
    
    return undefined;
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): ValidationResult => {
    const errors: ValidationErrors = {};
    
    Object.keys(formData).forEach((key) => {
      const field = key as keyof ProductFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    const isValid = Object.keys(errors).length === 0;
    
    return { isValid, errors };
  }, [formData, validateField]);

  /**
   * Handle field blur (validate when user leaves field)
   */
  const handleFieldBlur = useCallback((field: keyof ProductFormData, value?: any) => {
    setTouchedFields(prev => new Set([...prev, field]));
    
    // Use provided value or current form data
    const fieldValue = value !== undefined ? value : formData[field];
    const error = validateField(field, fieldValue);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, [validateField, formData]);

  /**
   * Handle field change without immediate validation
   */
  const handleFieldChange = useCallback((field: keyof ProductFormData, value: any) => {
    // Update form data
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
    
    // Only validate if field was already touched
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [validateField, submitError, touchedFields]);

  /**
   * Load product data for edit mode
   */
  const loadProduct = useCallback(async () => {
    if (mode !== 'edit' || !productId) return;

    setLoadingState(prev => ({ ...prev, form: true }));

    try {
      const jwtToken = getAccessToken();
      if (!jwtToken) {
        throw new Error('Brak autoryzacji. Zaloguj się ponownie.');
      }

      const response = await fetch(`/api/user-products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Produkt nie został znaleziony');
        } else if (response.status === 403) {
          throw new Error('Nie masz uprawnień do edycji tego produktu');
        }
        throw new Error('Błąd podczas ładowania produktu');
      }

      const data: UserProductResponse = await response.json();
      const product = data.product;

      const productData = {
        name: product.name,
        categoryId: product.categoryId,
        quantity: product.quantity,
        unit: product.unit,
        expiresAt: product.expiresAt
      };

      setFormData(productData);
      setOriginalData(productData);
      setValidationErrors({});
      setSubmitError(null);
      
    } catch (error) {
      console.error('Error loading product:', error);
      setSubmitError(error instanceof Error ? error.message : 'Błąd podczas ładowania produktu');
    } finally {
      setLoadingState(prev => ({ ...prev, form: false }));
    }
  }, [mode, productId]);

  /**
   * Submit form (create or update)
   */
  const submitForm = useCallback(async (): Promise<boolean> => {
    const validation = validateForm();

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return false;
    }

    setLoadingState(prev => ({ ...prev, submit: true }));
    setSubmitError(null);

    try {
      const jwtToken = getAccessToken();
      if (!jwtToken) {
        setSubmitError('Brak autoryzacji. Zaloguj się ponownie.');
        return false;
      }

      const requestData: CreateUserProductRequest | UpdateUserProductRequest = {
        name: formData.name.trim(),
        categoryId: formData.categoryId!,
        quantity: formData.quantity!,
        unit: formData.unit!,
        expiresAt: formData.expiresAt || undefined
      };

      const url = mode === 'create' 
        ? '/api/user-products' 
        : `/api/user-products/${productId}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        if (response.status === 400) {
          // Try to parse validation errors from API
          const errorData = await response.json();
          if (errorData.details) {
            setValidationErrors(errorData.details);
          } else {
            setSubmitError('Nieprawidłowe dane formularza');
          }
          return false;
        }
        throw new Error('Błąd podczas zapisywania produktu');
      }

      return true;
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Błąd podczas zapisywania');
      return false;
    } finally {
      setLoadingState(prev => ({ ...prev, submit: false }));
    }
  }, [formData, validateForm, mode, productId]);

  /**
   * Delete product (edit mode only)
   */
  const deleteProduct = useCallback(async (): Promise<boolean> => {
    if (mode !== 'edit' || !productId) return false;

    setLoadingState(prev => ({ ...prev, delete: true }));

    try {
      const jwtToken = getAccessToken();
      if (!jwtToken) {
        setSubmitError('Brak autoryzacji. Zaloguj się ponownie.');
        return false;
      }

      const response = await fetch(`/api/user-products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania produktu');
      }

      return true;
      
    } catch (error) {
      console.error('Error deleting product:', error);
      setSubmitError(error instanceof Error ? error.message : 'Błąd podczas usuwania');
      return false;
    } finally {
      setLoadingState(prev => ({ ...prev, delete: false }));
    }
  }, [mode, productId]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setValidationErrors({});
    setSubmitError(null);
  }, []);

  // Load product data on mount for edit mode
  useEffect(() => {
    if (mode === 'edit' && productId) {
      loadProduct();
    }
  }, [mode, productId, loadProduct]);

  // Check if data has changed (for edit mode)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
  
  // Check if form is valid
  const isFormValid = formData.name.trim() !== '' &&
                     formData.categoryId !== null &&
                     formData.quantity !== null &&
                     formData.unit !== null &&
                     Object.keys(validationErrors).filter(key => validationErrors[key as keyof ValidationErrors]).length === 0;
  
  // In edit mode, button should be active only if there are changes and form is valid
  // In create mode, button should be active if form is valid
  const isSubmitEnabled = mode === 'create' ? isFormValid : (isFormValid && hasChanges);

  return {
    // State
    formData,
    validationErrors,
    loadingState,
    submitError,
    isFormValid,
    isSubmitEnabled,
    hasChanges,
    
    // Actions
    handleFieldChange,
    handleFieldBlur: handleFieldBlur as (field: keyof ProductFormData, value?: any) => void,
    submitForm,
    deleteProduct,
    resetForm,
    validateForm
  };
};