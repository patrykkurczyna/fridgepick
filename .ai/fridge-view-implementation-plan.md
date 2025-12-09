# Plan implementacji widoku Lodówka

## 1. Przegląd

Widok Lodówka stanowi główny interfejs do zarządzania produktami spożywczymi użytkownika. Umożliwia przeglądanie, wyszukiwanie, sortowanie i podstawowe operacje CRUD na produktach w lodówce/spiżarni. Widok wspiera zarządzanie inventory z wizualnymi wskaźnikami dat ważności, quick-add panel dla popularnych produktów oraz responsywny design zoptymalizowany pod urządzenia mobilne.

## 2. Routing widoku

**Ścieżka:** `/fridge`  
**Method:** GET  
**Auth required:** Tak (JWT token)  
**Layout:** Główny layout aplikacji z bottom navigation (mobile) / top navigation (desktop)

## 3. Struktura komponentów

```
FridgeView (główny container)
├── FridgeHeader
│   ├── PageTitle ("Moja Lodówka")
│   └── AddProductButton (floating action)
├── FridgeFilters  
│   ├── SearchBar
│   └── SortControls
├── QuickAddPanel (collapsible)
│   └── QuickAddItems[]
├── ProductsSection
│   ├── ProductsList (when has products)
│   │   └── ProductCard[] (multiple items)
│   ├── LoadingSkeleton (when loading)
│   └── EmptyState (when no products)
└── Pagination (when needed)
```

## 4. Szczegóły komponentów

### FridgeView
- **Opis komponentu:** Główny container widoku zarządzający stanem produktów, filtrowaniem i paginacją
- **Główne elementy:** `<div className="fridge-view">` zawierający wszystkie podkomponenty z responsive grid layout
- **Obsługiwane interakcje:** Initial data loading, refresh action, navigation to add/edit forms
- **Obsługiwana walidacja:** Session validation, authorization check przed renderowaniem
- **Typy:** `ProductListViewModel`, `FridgeViewState`, `SearchFilters`
- **Propsy:** Brak (route level component)

### FridgeHeader  
- **Opis komponentu:** Header sekcji z tytułem i głównymi akcjami
- **Główne elementy:** `<header>` z h1 title i floating AddProductButton
- **Obsługiwane interakcje:** Click na AddProductButton → navigate to /fridge/add
- **Obsługiwana walidacja:** Sprawdzenie uprawnień do dodawania produktów
- **Typy:** Brak specjalnych typów
- **Propsy:** `{ onAddProduct: () => void }`

### SearchBar
- **Opis komponentu:** Input do wyszukiwania produktów po nazwie z debounced search
- **Główne elementy:** `<input type="search">` z search icon i clear button
- **Obsługiwane interakcje:** onChange z debounce (300ms), onClear, onSubmit (Enter key)
- **Obsługiwana walidacja:** Input sanitization, maksymalna długość query (100 znaków)
- **Typy:** `SearchQuery` (string), `SearchState`
- **Propsy:** `{ query: string, onSearch: (query: string) => void, placeholder?: string }`

### SortControls
- **Opis komponentu:** Dropdown/select do wyboru opcji sortowania produktów
- **Główne elementy:** `<select>` z opcjami lub custom dropdown component
- **Obsługiwane interakcje:** onChange selection, reset to default (expires_at)
- **Obsługiwana walidacja:** Sprawdzenie czy wybrana opcja jest dozwolona (name, expires_at, created_at)
- **Typy:** `SortOption`, `SortDirection`
- **Propsy:** `{ sortBy: SortOption, onSortChange: (option: SortOption) => void }`

### QuickAddPanel
- **Opis komponentu:** Collapsible panel z predefiniowanymi popularnymi produktami do szybkiego dodania
- **Główne elementy:** `<section>` z toggle button i grid popularnych produktów (mleko, chleb, jajka, itp.)
- **Obsługiwane interakcje:** Expand/collapse panel, click na quick add item → modal z podstawowymi danymi
- **Obsługiwana walidacja:** Sprawdzenie czy produkt już nie istnieje, podstawowa walidacja przed dodaniem
- **Typy:** `QuickAddItem`, `QuickAddState`
- **Propsy:** `{ onQuickAdd: (item: QuickAddItem) => Promise<void>, isExpanded: boolean, onToggle: () => void }`

### ProductsList
- **Opis komponentu:** Lista/grid produktów z responsive layout i virtual scrolling dla dużych list
- **Główne elementy:** `<div className="products-grid">` z mapowanymi ProductCard components
- **Obsługiwane interakcje:** Scroll loading (infinite scroll), refresh pull-down (mobile)
- **Obsługiwana walidacja:** Sprawdzenie czy lista nie jest pusta, handling empty results
- **Typy:** `ProductDTO[]`, `PaginationInfo`
- **Propsy:** `{ products: ProductDTO[], loading: boolean, onEdit: (id: string) => void, onDelete: (id: string) => void }`

### ProductCard
- **Opis komponentu:** Karta pojedynczego produktu z informacjami i akcjami
- **Główne elementy:** `<div className="product-card">` z nazwą, kategorią, ilością, datą ważności i action buttons
- **Obsługiwane interakcje:** Click → edit mode, delete button → confirmation, quantity quick edit
- **Obsługiwana walidacja:** Sprawdzenie dat ważności, kalkulacja daysUntilExpiry dla visual indicators
- **Typy:** `ProductDTO`, `ExpiryStatus`
- **Propsy:** `{ product: ProductDTO, onEdit: (id: string) => void, onDelete: (id: string) => void, variant?: 'default' | 'compact' }`

### LoadingSkeleton
- **Opis komponentu:** Placeholder podczas ładowania listy produktów
- **Główne elementy:** Multiple `<div>` z shimmer effect w layout podobnym do ProductCard
- **Obsługiwane interakcje:** Brak (tylko visual feedback)
- **Obsługiwana walidacja:** Brak
- **Typy:** Brak
- **Propsy:** `{ count?: number, variant?: 'card' | 'list' }`

### EmptyState
- **Opis komponentu:** Komponent wyświetlany gdy brak produktów w lodówce
- **Główne elementy:** `<div>` z illustration, heading, description i CTA button do dodania pierwszego produktu
- **Obsługiwane interakcje:** Click CTA → navigate to add product
- **Obsługiwana walidacja:** Sprawdzenie czy rzeczywiście lista jest pusta (nie loading)
- **Typy:** Brak
- **Propsy:** `{ onAddFirst: () => void, variant?: 'empty' | 'no-results' }`

### Pagination
- **Opis komponentu:** Kontrolki paginacji dla dużej liczby produktów
- **Główne elementy:** Previous/Next buttons, page numbers, total count info
- **Obsługiwane interakcje:** Page navigation, previous/next, jump to first/last
- **Obsługiwana walidacja:** Sprawdzenie bounds (min 1, max based on total), disabled states
- **Typy:** `PaginationInfo`, `PaginationControls`
- **Propsy:** `{ currentPage: number, totalPages: number, onPageChange: (page: number) => void, totalItems: number }`

## 5. Typy

```typescript
// Podstawowe typy produktów
interface ProductDTO {
  id: string;
  name: string;
  categoryId: number;
  categoryName: string;
  quantity: number;
  unit: 'g' | 'l' | 'szt';
  expiresAt: string; // ISO date string
  createdAt: string;
  isExpired: boolean;
  daysUntilExpiry: number;
}

// Response type dla listy produktów
interface ProductsListResponse {
  products: ProductDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Kategoria produktu
interface ProductCategory {
  id: number;
  name: string;
  description: string;
}

// ViewModel dla całego widoku
interface ProductListViewModel {
  products: ProductDTO[];
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: SearchFilters;
  hasMore: boolean;
}

// Filtry i wyszukiwanie
interface SearchFilters {
  query: string;
  categoryId?: number;
  sortBy: 'name' | 'expires_at' | 'created_at';
  sortDirection: 'asc' | 'desc';
  showExpired: boolean;
  expiringSoon?: number; // days
}

// Paginacja
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  limit: number;
  total: number;
  offset: number;
}

// Quick add items
interface QuickAddItem {
  name: string;
  categoryId: number;
  categoryName: string;
  defaultUnit: 'g' | 'l' | 'szt';
  defaultQuantity: number;
  icon?: string;
}

// Stan komponentu dla expiry
type ExpiryStatus = 'fresh' | 'warning' | 'expired' | 'unknown';

// Sort options
type SortOption = 'name' | 'expires_at' | 'created_at';
type SortDirection = 'asc' | 'desc';

// State management
interface FridgeViewState {
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
```

## 6. Zarządzanie stanem

**Custom hook: `useFridgeProducts`**
- Zarządza stanem produktów, loading, error handling
- Obsługuje fetch z automatycznym retry
- Cache management z invalidation
- Debounced search functionality
- Optimistic updates dla quick actions

**Custom hook: `usePagination`**
- Zarządza stanem paginacji i infinite scroll
- Kalkulacje total pages, bounds checking
- Integration z API pagination parameters

**Custom hook: `useProductCategories`**
- Fetch i cache kategorii produktów
- Static data z długim cache TTL

**Context/State structure:**
- React Query dla server state management
- useState dla UI state (expanded panels, modals)
- useReducer dla complex search filters state

## 7. Integracja API

**GET /api/product-categories**
- Request type: Brak body (GET)
- Response type: `{ categories: ProductCategory[] }`
- Usage: Initial load + cache dla category names
- Error handling: Fallback do basic view bez category names

**GET /api/user-products**  
- Request type: URL query parameters
  ```typescript
  interface ProductsQueryParams {
    category?: number;
    expired?: boolean;
    expiring_soon?: number;
    sort?: 'name' | 'expires_at' | 'created_at';
    limit?: number;
    offset?: number;
    search?: string; // dodatkowy param dla nazwy
  }
  ```
- Response type: `ProductsListResponse`
- Usage: Initial load, filtering, sorting, pagination, search
- Error handling: Retry logic, fallback UI, cache invalidation

## 8. Interakcje użytkownika

1. **Initial page load:**
   - Fetch categories w tle
   - Fetch products z default sort (expires_at)
   - Show loading skeleton
   - Handle loading errors

2. **Search produktów:**
   - User type w search bar → debounced API call (300ms)
   - Update URL query params
   - Show loading state tylko dla search results area
   - Clear search → reset do full list

3. **Sort change:**
   - User select z dropdown → immediate API call z nowym sort
   - Update produkty list z loading indicator
   - Persist sort preference w localStorage

4. **Quick add interaction:**
   - User click quick add panel toggle → expand/collapse
   - User click quick add item → modal z pre-filled data
   - Submit → optimistic update + API call
   - Success → refresh list, close modal
   - Error → rollback optimistic update, show error

5. **Product card interactions:**
   - Click card → navigate to edit (/fridge/edit/:id)
   - Click delete → confirmation modal
   - Confirm delete → optimistic remove + API call
   - Delete success → remove from list permanently
   - Delete error → restore item, show error message

6. **Pagination:**
   - Click page number → API call z nowym offset
   - Next/Previous buttons → increment/decrement page
   - Infinite scroll (mobile) → load more na scroll bottom

## 9. Warunki i walidacja

**ProductCard expiry validation:**
- `daysUntilExpiry <= 0` → red warning, "Wygasł" status
- `daysUntilExpiry <= 3` → yellow warning, "Wygasa wkrótce" 
- `daysUntilExpiry > 3` → normal green status
- `daysUntilExpiry` calculation w real-time na frontend

**Search validation:**
- Max length 100 characters
- Input sanitization (trim, no special chars)
- Minimum 2 characters dla API call trigger

**Pagination validation:**
- Current page >= 1
- Current page <= totalPages
- Disabled states dla first/last pages
- Loading states podczas page change

**Authorization validation:**
- JWT token presence check przed API calls
- Token expiry handling → redirect to login
- 403 responses → show unauthorized message

**Data validation:**
- Product list not null before rendering
- Category ID validation against available categories
- Date parsing validation dla expiresAt fields

## 10. Obsługa błędów

**Network errors:**
- Retry button dla failed requests
- Offline indicator gdy network niedostępny
- Cache fallback gdy available
- Generic error message z contact support link

**API errors:**
- 401 Unauthorized → redirect do login page
- 403 Forbidden → show access denied message
- 404 Not Found → empty state z suggestion do add products
- 422 Validation → show specific validation errors
- 500 Server Error → generic error z retry option

**Loading timeouts:**
- Request timeout po 30 seconds
- Show timeout message z retry option
- Cancel pending requests przy navigation away

**Data errors:**
- Malformed product data → skip invalid items, log error
- Missing category names → show category ID jako fallback
- Invalid date formats → show "Data nieznana"

**UI error states:**
- Error boundary dla component crashes
- Fallback UI dla partial failures
- Toast notifications dla non-critical errors
- Modal dla critical errors requiring action

## 11. Kroki implementacji

1. **Setup podstawowej struktury**
   - Stwórz `/pages/fridge.tsx` z podstawowym layoutem
   - Dodaj routing w Next.js
   - Setup podstawowych typów TypeScript

2. **Implementuj API integration**
   - Stwórz custom hooks `useFridgeProducts`, `useProductCategories`
   - Setup React Query configuration
   - Dodaj error boundaries i loading states

3. **Zbuduj core komponenty**
   - `FridgeView` jako główny container
   - `ProductCard` z basic display i actions
   - `ProductsList` z responsive grid
   - `LoadingSkeleton` dla loading states

4. **Dodaj search i filtering**
   - `SearchBar` z debounced input
   - `SortControls` z API integration
   - URL state management dla filters
   - Update API calls z query parameters

5. **Implementuj QuickAddPanel**
   - Zdefiniuj popular products template
   - Collapsible panel behavior
   - Quick add modal z pre-filled form
   - Integration z add product API

6. **Dodaj pagination**
   - `Pagination` component z page controls
   - Infinite scroll dla mobile
   - URL state dla current page
   - Loading states dla page changes

7. **Polish UI/UX**
   - Expiry indicators styling
   - Responsive design testing
   - Touch-friendly controls
   - Animations i transitions

8. **Error handling i edge cases**
   - Empty states implementation
   - Error boundary setup
   - Network error handling
   - Loading timeout handling

9. **Testing i optimization**
   - Unit tests dla key components
   - Integration tests dla API calls
   - Performance optimization
   - Accessibility testing

10. **Documentation i final polish**
    - Add code comments
    - Update component documentation
    - Final UX testing
    - Performance monitoring setup