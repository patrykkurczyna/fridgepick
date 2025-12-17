import type { ProductCategoryDTO, CreateUserProductRequest, UpdateUserProductRequest, UserProductDTO, DatabaseEnums } from './index';

// ViewModel dla całego widoku formularza
export interface ProductFormViewModel {
  mode: 'create' | 'edit';
  productId?: string;
  formData: ProductFormData;
  validationErrors: ValidationErrors;
  loading: boolean;
  submitError: string | null;
  categories: ProductCategoryDTO[];
}

// Dane formularza produktu
export interface ProductFormData {
  name: string;
  categoryId: number | null;
  quantity: number | null;
  unit: DatabaseEnums['unit_type'] | null;
  expiresAt: string | null; // ISO date string format
}

// Błędy walidacji dla każdego pola
export interface ValidationErrors {
  name?: string;
  categoryId?: string;
  quantity?: string;
  unit?: string;
  expiresAt?: string;
  general?: string; // Ogólne błędy formularza/API
}

// Stan loading dla różnych operacji
export interface LoadingState {
  form: boolean;        // Ładowanie danych w trybie edycji
  submit: boolean;      // Zapisywanie formularza
  delete: boolean;      // Usuwanie produktu
  categories: boolean;  // Ładowanie kategorii
}

// Typ dla validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Props dla głównych komponentów
export interface ProductFormProps {
  formData: ProductFormData;
  errors: ValidationErrors;
  categories: ProductCategoryDTO[];
  onFieldChange: (field: keyof ProductFormData, value: any) => void;
  onFieldBlur: (field: keyof ProductFormData) => void;
  onSubmit: (data: ProductFormData) => void;
  loading: boolean;
  // Form actions props
  mode: 'create' | 'edit';
  onCancel: () => void;
  onDelete?: () => void;
  saveLoading: boolean;
  deleteLoading: boolean;
  disabled: boolean;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export interface CategoryDropdownProps {
  categories: ProductCategoryDTO[];
  value: number | null;
  onChange: (categoryId: number) => void;
  error?: string;
}

export interface UnitSelectorProps {
  value: DatabaseEnums['unit_type'] | null;
  onChange: (unit: DatabaseEnums['unit_type']) => void;
  error?: string;
}

export interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  error?: string;
  placeholder?: string;
}

export interface FormActionsProps {
  mode: 'create' | 'edit';
  onCancel: () => void;
  onDelete?: () => void;
  saveLoading: boolean;
  deleteLoading: boolean;
  disabled: boolean;
}