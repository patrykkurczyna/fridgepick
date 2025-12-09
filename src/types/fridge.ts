import type { UserProductDTO, ProductCategoryDTO, DatabaseEnums, PaginationDTO } from '@/types';

// =============================================================================
// FRIDGE-SPECIFIC TYPES (zgodnie z planem implementacji)
// =============================================================================

/** Extended product DTO dla widoku lodówki - alias dla zachowania spójności z planem */
export interface ProductDTO extends UserProductDTO {}

/** Kategoria produktu - alias dla zachowania spójności z planem */
export interface ProductCategory extends ProductCategoryDTO {}

/** Response type dla listy produktów z pagination */
export interface ProductsListResponse {
  products: ProductDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

/** ViewModel dla całego widoku lodówki */
export interface ProductListViewModel {
  products: ProductDTO[];
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: SearchFilters;
  hasMore: boolean;
}

/** Filtry i wyszukiwanie */
export interface SearchFilters {
  query: string;
  categoryId?: number;
  sortBy: 'name' | 'expires_at' | 'created_at';
  sortDirection: 'asc' | 'desc';
  showExpired: boolean;
  expiringSoon?: number; // days
}

/** Enhanced pagination info */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  limit: number;
  total: number;
  offset: number;
}

/** Quick add items configuration */
export interface QuickAddItem {
  name: string;
  categoryId: number;
  categoryName: string;
  defaultUnit: DatabaseEnums['unit_type'];
  defaultQuantity: number;
  icon?: string;
}

/** Stan komponentu dla expiry indicators */
export type ExpiryStatus = 'fresh' | 'warning' | 'expired' | 'unknown';

/** Sort options */
export type SortOption = 'name' | 'expires_at' | 'created_at';
export type SortDirection = 'asc' | 'desc';

/** State management dla FridgeView */
export interface FridgeViewState {
  products: ProductDTO[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
  currentPage: number;
  quickAddExpanded: boolean;
  lastFetch: Date | null;
}

/** Query parameters dla produktów API */
export interface ProductsQueryParams {
  category?: number;
  expired?: boolean;
  expiring_soon?: number;
  sort?: 'name' | 'expires_at' | 'created_at';
  limit?: number;
  offset?: number;
  search?: string; // dodatkowy param dla nazwy
}

/** Quick add state */
export interface QuickAddState {
  isExpanded: boolean;
  isLoading: boolean;
  error: string | null;
}

/** Search state */
export interface SearchState {
  query: string;
  isSearching: boolean;
  hasSearched: boolean;
}

// =============================================================================
// EXPIRY CALCULATION HELPERS
// =============================================================================

/** Utility function do kalkulacji expiry status */
export const calculateExpiryStatus = (daysUntilExpiry: number | null): ExpiryStatus => {
  if (daysUntilExpiry === null) return 'unknown';
  if (daysUntilExpiry <= 0) return 'expired';
  if (daysUntilExpiry <= 3) return 'warning';
  return 'fresh';
};

/** Utility function do kalkulacji dni do wygaśnięcia */
export const calculateDaysUntilExpiry = (expiresAt: string | null): number | null => {
  if (!expiresAt) return null;
  
  const today = new Date();
  const expiryDate = new Date(expiresAt);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/** Walidacja search query */
export const validateSearchQuery = (query: string): { isValid: boolean; sanitized: string } => {
  const trimmed = query.trim();
  
  // Max length 100 characters
  if (trimmed.length > 100) {
    return { isValid: false, sanitized: trimmed.substring(0, 100) };
  }
  
  // Basic sanitization - remove special chars except spaces, letters, numbers
  const sanitized = trimmed.replace(/[^\w\s\u00C0-\u017F]/g, '');
  
  return { isValid: true, sanitized };
};

/** Walidacja sort options */
export const validateSortOption = (sortBy: string): sortBy is SortOption => {
  return ['name', 'expires_at', 'created_at'].includes(sortBy);
};

/** Walidacja pagination parameters */
export const validatePaginationParams = (page: number, totalPages: number) => {
  return {
    isValid: page >= 1 && page <= totalPages,
    normalizedPage: Math.max(1, Math.min(page, totalPages))
  };
};