# Plan implementacji widoku Formularza Produktu

## 1. Przegląd

Widok formularza produktu umożliwia użytkownikom dodawanie nowych produktów do lodówki oraz edycję istniejących produktów. Formularz obsługuje wszystkie wymagane pola produktu z progresywną walidacją w czasie rzeczywistym. Widok jest responsywny, dostępny i zintegrowany z API backend poprzez JWT autoryzację.

**Uwaga implementacyjna:** Funkcjonalność dodawania produktów już częściowo istnieje w widoku FridgeView przez "QuickAddPanel" (przycisk Szybkie dodawanie), jednak brak tam możliwości ustawienia daty ważności. Ten dedykowany widok formularza będzie oferował pełną funkcjonalność z wszystkimi polami, w tym z datą ważności.

## 2. Routing widoku

**Dodawanie nowego produktu:**
- **Ścieżka:** `/fridge/add`
- **Method:** GET
- **Auth required:** Tak (JWT token)

**Edycja istniejącego produktu:**
- **Ścieżka:** `/fridge/edit/:id`
- **Method:** GET  
- **Auth required:** Tak (JWT token)
- **Parametr:** `id` - UUID produktu

## 3. Struktura komponentów

```
ProductFormView (główny container)
├── PageHeader
│   ├── BackButton
│   └── PageTitle
├── LoadingSpinner (podczas ładowania danych w trybie edycji)
├── ProductForm
│   ├── FormField (name)
│   │   ├── Label
│   │   ├── TextInput  
│   │   └── ValidationMessage
│   ├── FormField (category)
│   │   ├── Label
│   │   ├── CategoryDropdown
│   │   └── ValidationMessage
│   ├── FormField (quantity)
│   │   ├── Label
│   │   ├── NumberInput
│   │   └── ValidationMessage
│   ├── FormField (unit)
│   │   ├── Label
│   │   ├── UnitSelector
│   │   └── ValidationMessage
│   └── FormField (expiresAt)
│       ├── Label
│       ├── DatePicker
│       └── ValidationMessage
├── FormActions
│   ├── CancelButton
│   ├── SaveButton
│   └── DeleteButton (tylko tryb edycji)
└── ErrorMessage (ogólne błędy formularza)
```

## 4. Szczegóły komponentów

### ProductFormView
- **Opis komponentu:** Główny container zarządzający stanem całego formularza, określa tryb (create/edit) na podstawie route params
- **Główne elementy:** `<div className="product-form-view">` z PageHeader, conditional loading state, ProductForm i FormActions
- **Obsługiwane interakcje:** Initial data loading (edit mode), form submission, navigation handling, error management
- **Obsługiwana walidacja:** Ogólna walidacja formularza przed submit, sprawdzenie autoryzacji użytkownika
- **Typy:** `ProductFormViewModel`, `ProductFormData`, `ValidationErrors`
- **Propsy:** Brak (route level component, pobiera id z useParams())

### ProductForm
- **Opis komponentu:** Główny formularz zawierający wszystkie pola produktu z real-time validation
- **Główne elementy:** `<form>` element z FormField components dla każdego pola produktu
- **Obsługiwane interakcje:** onChange dla wszystkich pól, onBlur dla validacji, onSubmit z preventDefault
- **Obsługiwana walidacja:** Real-time walidacja na onBlur, walidacja całego formularza przed submit, wyświetlanie błędów walidacji
- **Typy:** `ProductFormData`, `ValidationErrors`, `ProductCategoryDTO[]`
- **Propsy:** `{ formData: ProductFormData, errors: ValidationErrors, categories: ProductCategoryDTO[], onFieldChange: (field, value) => void, onSubmit: (data) => void, loading: boolean }`

### FormField
- **Opis komponentu:** Reusable wrapper dla pól formularza z label, input i error message
- **Główne elementy:** `<div className="form-field">` z Label, input component i conditional ValidationMessage
- **Obsługiwane interakcje:** Przekazywanie zdarzeń do parent component, focus management
- **Obsługiwana walidacja:** Wyświetlanie błędów walidacji, visual feedback dla niepoprawnych pól
- **Typy:** `FieldError`, generic input value type
- **Propsy:** `{ label: string, error?: string, required?: boolean, children: ReactNode }`

### CategoryDropdown
- **Opis komponentu:** Select dropdown z kategoriami produktów pobranimi z API
- **Główne elementy:** `<select>` z opcjami mapowanymi z ProductCategoryDTO array
- **Obsługiwane interakcje:** onChange selection, keyboard navigation, focus handling
- **Obsługiwana walidacja:** Sprawdzenie czy wybrana kategoria istnieje w dostępnych opcjach, wymagane pole
- **Typy:** `ProductCategoryDTO[]`, `number` (categoryId)
- **Propsy:** `{ categories: ProductCategoryDTO[], value: number | null, onChange: (categoryId: number) => void, error?: string }`

### UnitSelector
- **Opis komponentu:** Select dropdown z jednostkami miary zdefiniowanymi w unit_type enum
- **Główne elementy:** `<select>` z hardcoded opcjami z UNIT_TYPES constant
- **Obsługiwane interakcje:** onChange selection, keyboard navigation
- **Obsługiwana walidacja:** Sprawdzenie czy jednostka jest z dozwolonej listy (g, l, szt), wymagane pole
- **Typy:** `unit_type` enum z types.ts
- **Propsy:** `{ value: unit_type | null, onChange: (unit: unit_type) => void, error?: string }`

### DatePicker  
- **Opis komponentu:** Accessible date input dla daty ważności produktu
- **Główne elementy:** Native `<input type="date">` z accessibility attributes
- **Obsługiwane interakcje:** Date selection, keyboard input, calendar popup
- **Obsługiwana walidacja:** Data nie może być w przeszłości (dziś lub przyszłość), format daty YYYY-MM-DD
- **Typy:** `string` (ISO date format) lub `null`
- **Propsy:** `{ value: string | null, onChange: (date: string | null) => void, error?: string, placeholder?: string }`

### FormActions
- **Opis komponentu:** Container z akcjami formularza (Save, Cancel, Delete)
- **Główne elementy:** `<div className="form-actions">` z button elementami
- **Obsługiwane interakcje:** Save (submit form), Cancel (navigate back), Delete (confirmation modal + API call)
- **Obsługiwana walidacja:** Disable save button gdy formularz jest niepoprawny lub loading
- **Typy:** Boolean flags dla loading states
- **Propsy:** `{ mode: 'create' | 'edit', onCancel: () => void, onDelete?: () => void, saveLoading: boolean, deleteLoading: boolean }`

## 5. Typy

```typescript
// ViewModel dla całego widoku formularza
interface ProductFormViewModel {
  mode: 'create' | 'edit';
  productId?: string;
  formData: ProductFormData;
  validationErrors: ValidationErrors;
  loading: boolean;
  submitError: string | null;
  categories: ProductCategoryDTO[];
}

// Dane formularza produktu
interface ProductFormData {
  name: string;
  categoryId: number | null;
  quantity: number | null;
  unit: unit_type | null;
  expiresAt: string | null; // ISO date string format
}

// Błędy walidacji dla każdego pola
interface ValidationErrors {
  name?: string;
  categoryId?: string;
  quantity?: string;
  unit?: string;
  expiresAt?: string;
  general?: string; // Ogólne błędy formularza/API
}

// Stan loading dla różnych operacji
interface LoadingState {
  form: boolean;        // Ładowanie danych w trybie edycji
  submit: boolean;      // Zapisywanie formularza
  delete: boolean;      // Usuwanie produktu
  categories: boolean;  // Ładowanie kategorii
}

// Typ dla validation result
interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}
```

## 6. Zarządzanie stanem

**Custom hook: `useProductForm`**
- Zarządza stanem formularza (formData, errors, loading)
- Obsługuje walidację pól w czasie rzeczywistym
- Wykonuje API calls dla create/update/delete
- Nawigację po zakończeniu operacji
- Optimistic updates gdzie możliwe

**Custom hook: `useProductCategories`**
- Fetch i cache kategorii produktów
- Long-term cache z invalidation logic
- Error handling dla kategorii

**Struktura state:**
```typescript
const [formData, setFormData] = useState<ProductFormData>(initialFormData);
const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
const [loadingState, setLoadingState] = useState<LoadingState>({...});
const [submitError, setSubmitError] = useState<string | null>(null);
```

## 7. Integracja API

**GET /api/product-categories**
- **Request type:** Brak body (GET)
- **Response type:** `ProductCategoriesResponse`
- **Usage:** Initial load + cache dla dropdown options
- **Error handling:** Fallback do podstawowego widoku, retry mechanism

**GET /api/user-products/:id (tylko edit mode)**
- **Request type:** URL path parameter z produktId
- **Response type:** `UserProductResponse`
- **Usage:** Pre-fill formularza w trybie edycji
- **Error handling:** 404 → redirect do fridge, 403 → authorization error

**POST /api/user-products (create mode)**
- **Request type:** `CreateUserProductRequest` w body
- **Response type:** `UserProductResponse`
- **Usage:** Tworzenie nowego produktu
- **Headers:** Authorization Bearer token, Content-Type application/json

**PUT /api/user-products/:id (edit mode)**
- **Request type:** `UpdateUserProductRequest` w body + productId w path
- **Response type:** `UserProductResponse`  
- **Usage:** Aktualizacja istniejącego produktu
- **Headers:** Authorization Bearer token, Content-Type application/json

## 8. Interakcje użytkownika

1. **Nawigacja do formularza:**
   - Create mode: User klik "Dodaj produkt" → navigate to /fridge/add
   - Edit mode: User klik edit button na ProductCard → navigate to /fridge/edit/:id

2. **Ładowanie danych (edit mode):**
   - Fetch product data by ID
   - Show loading spinner podczas fetch
   - Pre-fill wszystkich pól formularza
   - Handle błędy (produkt nie istnieje, brak dostępu)

3. **Wypełnianie formularza:**
   - Real-time validation na onBlur dla każdego pola
   - Visual feedback dla błędów (czerwone border, error message)
   - Auto-format dla quantity field (decimal places)
   - Date picker z calendar popup

4. **Submit formularza:**
   - Client-side validation całego formularza
   - Disable submit button podczas API call
   - Show loading spinner na submit button
   - Success: navigate back to /fridge z success message
   - Error: display error message, enable retry

5. **Anulowanie:**
   - Cancel button → navigate back to /fridge bez zapisywania
   - Dirty form warning (optional) jeśli użytkownik wprowadził zmiany

6. **Usuwanie (edit mode only):**
   - Delete button → show confirmation modal
   - Confirm → API call + loading state
   - Success → navigate to /fridge z success message

## 9. Warunki i walidacja

**Client-side walidacja (real-time):**
- **name:** Required, 1-255 znaków, trim whitespace
- **categoryId:** Required, musi być liczbą > 0, musi istnieć w dostępnych kategoriach
- **quantity:** Required, >= 0, max 3 miejsca po przecinku, format numeryczny
- **unit:** Required, musi być jednym z: 'g', 'l', 'szt'
- **expiresAt:** Optional, jeśli podane: format YYYY-MM-DD, data dzisiejsza lub przyszła

**API validation handling:**
- 400 validation errors → map do ValidationErrors i wyświetl przy polach
- 404 kategoria nie istnieje → error message i fallback
- 401/403 authorization → redirect to login
- 500 server error → generic error message z retry option

**Form state validation:**
- Form valid = wszystkie required pola wypełnione + brak validation errors
- Submit button disabled jeśli form invalid lub loading
- Visual indicators dla required fields (*) i validation errors

## 10. Obsługa błędów

**Network errors:**
- Connection timeout → retry button z exponential backoff
- Offline detection → show offline message, enable retry gdy online
- API unavailable → generic error message z contact support

**Validation errors:**
- Real-time field validation z debounce (300ms)
- Server validation errors mapped do odpowiednich pól
- General form errors wyświetlane na górze formularza

**Authorization errors:**
- 401 Unauthorized → clear local auth state, redirect to /login
- 403 Forbidden → "Nie masz uprawnień" message
- Token refresh handling transparent dla użytkownika

**Data errors:**
- Malformed API responses → fallback UI z error boundary
- Missing product (edit mode) → redirect to /fridge z "Produkt nie znaleziony"
- Missing categories → show form bez kategorii + error message

**Edge cases:**
- Concurrent edits → conflict detection i resolution
- Network loss during submit → local storage backup i retry
- Browser back button → unsaved changes warning

## 11. Kroki implementacji

1. **Setup podstawowej struktury**
   - Stwórz `/pages/fridge/add.astro` i `/pages/fridge/edit/[id].astro`
   - Dodaj routing w Astro config
   - Setup podstawowych typów TypeScript dla formularza
   - **Uwaga:** Wykorzystaj istniejącą logikę z QuickAddPanel jako reference, ale rozszerz o brakującą funkcjonalność daty ważności

2. **Implementuj custom hooks**
   - `useProductForm` hook z state management
   - `useProductCategories` hook z caching
   - Error handling i loading states

3. **Zbuduj core komponenty**
   - `ProductFormView` jako główny container
   - `ProductForm` z podstawowymi polami
   - `FormField` jako reusable wrapper

4. **Implementuj form controls**
   - `CategoryDropdown` z API integration
   - `UnitSelector` z enum values
   - `DatePicker` z accessibility
   - Real-time validation logic

5. **Dodaj API integration**
   - Create/Update API calls z JWT authorization (wzoruj się na implementacji w handleQuickAdd z FridgeView)
   - Error mapping i handling
   - Success/failure feedback
   - **Uwaga:** API endpoint POST /api/user-products już działa - potrzeba tylko dodać obsługę pola expiresAt w request body

6. **Implementuj form actions**
   - Save/Cancel navigation logic
   - Delete confirmation modal (edit mode)
   - Loading states i disable logic

7. **Polish UX/UI**
   - Responsive design testing
   - Accessibility validation (WCAG)
   - Touch-friendly controls
   - Loading skeletons i transitions

8. **Error handling i edge cases**
   - Network error scenarios
   - Validation error display
   - Authorization error handling
   - Form state persistence (optional)

9. **Testing i optimization**
   - Unit tests dla validation logic
   - Integration tests dla API calls
   - E2E tests dla user flows
   - Performance optimization (debouncing, caching)

10. **Documentation i final polish**
    - Code comments dla complex logic
    - Component documentation
    - User acceptance testing
    - Performance monitoring setup