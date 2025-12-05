# API Endpoint Implementation Plan: User Products (Fridge Inventory)

## 1. Przegląd punktu końcowego

System zarządzania inwentarzem produktów użytkownika (lodówka/spiżarnia) z pełnym CRUD API. Endpoints obsługują dodawanie, przeglądanie, aktualizowanie i usuwanie produktów z możliwością filtrowania, sortowania i paginacji. Każdy produkt ma przypisaną kategorię, ilość, jednostkę miary i opcjonalną datę ważności.

**Główne funkcjonalności:**
- Zarządzanie produktami użytkownika z kategoryzacją
- Filtrowanie po kategorii, statusie ważności i czasie dodania
- Sortowanie i paginacja wyników
- Automatyczne obliczanie dni do przeterminowania
- Kontrola dostępu - użytkownik może zarządzać tylko swoimi produktami

## 2. Szczegóły żądania

### GET /api/user-products
- **Metoda HTTP:** GET
- **Autoryzacja:** Wymagana (Bearer token)
- **Query Parameters:**
  - `category` (opcjonalny) - Integer, ID kategorii produktu
  - `expired` (opcjonalny) - Boolean, filtracja przeterminowanych produktów
  - `expiring_soon` (opcjonalny) - Integer, produkty kończące się w ciągu N dni
  - `sort` (opcjonalny) - String, sortowanie: "name", "expires_at", "created_at"
  - `limit` (opcjonalny) - Integer, limit paginacji (default: 50, max: 100)
  - `offset` (opcjonalny) - Integer, offset paginacji

### POST /api/user-products
- **Metoda HTTP:** POST
- **Autoryzacja:** Wymagana (Bearer token)
- **Request Body:**
```json
{
  "name": "string (required, 1-255 chars)",
  "categoryId": "number (required, must exist)",
  "quantity": "number (required, >=0, max 3 decimal places)",
  "unit": "enum (required, 'g'|'l'|'szt')",
  "expiresAt": "string (optional, ISO date, future or today)"
}
```

### PUT /api/user-products/:id
- **Metoda HTTP:** PUT
- **Autoryzacja:** Wymagana (Bearer token)
- **Path Parameters:** `id` - UUID produktu
- **Request Body:** Identyczny jak POST

### DELETE /api/user-products/:id
- **Metoda HTTP:** DELETE
- **Autoryzacja:** Wymagana (Bearer token)
- **Path Parameters:** `id` - UUID produktu

## 3. Wykorzystywane typy

### DTOs (Data Transfer Objects)
```typescript
UserProductDTO {
  id: string;
  name: string;
  categoryId: number;
  categoryName: string;    // computed field
  quantity: number;
  unit: 'g' | 'l' | 'szt';
  expiresAt: string | null;
  createdAt: string;
  isExpired: boolean;      // computed field
  daysUntilExpiry: number | null; // computed field
}

UserProductsResponse {
  products: UserProductDTO[];
  pagination: PaginationDTO;
}

UserProductResponse {
  success: boolean;
  product: UserProductDTO;
}
```

### Command Models
```typescript
CreateUserProductRequest {
  name: string;
  categoryId: number;
  quantity: number;
  unit: 'g' | 'l' | 'szt';
  expiresAt?: string;
}

UpdateUserProductRequest {
  name: string;
  categoryId: number;
  quantity: number;
  unit: 'g' | 'l' | 'szt';
  expiresAt?: string;
}

UserProductsQueryParams {
  category?: number;
  expired?: boolean;
  expiring_soon?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}
```

## 4. Szczegóły odpowiedzi

### Kody statusu
- **200 OK:** Successful GET/PUT operations
- **201 Created:** Successful POST operation
- **400 Bad Request:** Validation errors, invalid parameters
- **401 Unauthorized:** Missing or invalid authentication token
- **403 Forbidden:** User trying to access/modify other user's products
- **404 Not Found:** Product not found, invalid category ID
- **500 Internal Server Error:** Database errors, unexpected server errors

### Struktury odpowiedzi

**GET Success (200):**
```json
{
  "products": [UserProductDTO[]],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number
  }
}
```

**POST/PUT Success (201/200):**
```json
{
  "success": true,
  "product": UserProductDTO
}
```

**DELETE Success (200):**
```json
{
  "success": true,
  "message": "Product removed successfully"
}
```

**Error Response:**
```json
{
  "error": true,
  "message": "string",
  "code": "string",
  "details": {
    "field": "validation details"
  }
}
```

## 5. Przepływ danych

### GET /api/user-products
1. **Autoryzacja:** Walidacja JWT token → user_id extraction
2. **Query Processing:** Parse i walidacja query parameters
3. **Database Query:** 
   - JOIN user_products + product_categories
   - WHERE user_id = authenticated_user
   - Apply filters (category, expired, expiring_soon)
   - Apply sorting and pagination
4. **Data Transformation:** Database rows → UserProductDTO z computed fields
5. **Response:** UserProductsResponse z pagination metadata

### POST /api/user-products
1. **Autoryzacja:** JWT validation → user_id
2. **Input Validation:** Request body validation według schemas
3. **Category Validation:** Verify categoryId exists w product_categories
4. **Database Insert:** 
   - user_products.insert({...data, user_id})
   - Return created record with category name
5. **Response:** UserProductResponse z created product

### PUT /api/user-products/:id
1. **Autoryzacja:** JWT validation → user_id
2. **Ownership Validation:** Verify product belongs to authenticated user
3. **Input Validation:** Request body validation
4. **Category Validation:** Verify new categoryId exists
5. **Database Update:** user_products.update(id, data)
6. **Response:** UserProductResponse z updated product

### DELETE /api/user-products/:id
1. **Autoryzacja:** JWT validation → user_id
2. **Ownership Validation:** Verify product belongs to authenticated user
3. **Database Delete:** user_products.delete(id)
4. **Response:** Success message

## 6. Względy bezpieczeństwa

### Autoryzacja i Uwierzytelnianie
- **JWT Bearer Token:** Wymagany w Authorization header
- **User ID Extraction:** Z verified JWT payload
- **Scope:** User może zarządzać tylko swoimi produktami

### Row Level Security (RLS)
```sql
-- Automatic RLS policy na user_products table
CREATE POLICY user_products_policy ON user_products
  FOR ALL USING (auth.uid() = user_id);
```

### Input Validation i Sanitization
- **SQL Injection:** Parametryzowane queries przez Supabase ORM
- **XSS Protection:** Input sanitization dla string fields
- **Type Safety:** TypeScript compile-time validation
- **Runtime Validation:** Zod schemas dla request validation

### Rate Limiting
- **Authenticated Endpoints:** 100 requests/minute per user
- **Global Limits:** 1000 requests/hour per IP

### Data Privacy
- **User Isolation:** Strict user_id filtering
- **No Data Leakage:** Explicit field selection w queries
- **Audit Logging:** Created_at, updated_at timestamps

## 7. Obsługa błędów

### Validation Errors (400)
```json
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "name": "Name is required and must be 1-255 characters",
    "quantity": "Quantity must be >= 0",
    "unit": "Unit must be one of: g, l, szt",
    "categoryId": "Invalid category ID",
    "expiresAt": "Date must be today or in the future"
  }
}
```

### Authentication Errors (401)
```json
{
  "error": true,
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### Authorization Errors (403)
```json
{
  "error": true,
  "message": "Access denied - product belongs to another user",
  "code": "FORBIDDEN"
}
```

### Not Found Errors (404)
```json
{
  "error": true,
  "message": "Product not found",
  "code": "NOT_FOUND"
}
```

### Database Errors (500)
```json
{
  "error": true,
  "message": "Internal server error",
  "code": "DATABASE_ERROR"
}
```

### Scenariusze błędów
1. **Invalid Category ID:** Verify category exists przed insert/update
2. **Ownership Violation:** Check user_id podczas access
3. **Invalid Units:** Validate against ENUM values
4. **Date Validation:** Prevent past expiration dates
5. **Quantity Overflow:** Prevent negative quantities lub precision overflow
6. **Rate Limiting:** Track requests per user/IP
7. **Database Connection:** Graceful handling of connection failures

## 8. Wydajność

### Database Optimization
- **Indexes:** 
  - Primary: user_id (existing: idx_user_products_user_id)
  - Expiration: expires_at (existing: idx_user_products_expires_at)
  - Composite: user_id + expires_at (existing: idx_user_products_user_expires)
  - Category: category_id dla JOIN optimization

### Query Optimization
- **Efficient JOINs:** LEFT JOIN product_categories dla category names
- **Selective Fields:** Explicit column selection zamiast SELECT *
- **Pagination:** LIMIT/OFFSET optimization z proper indexes
- **Computed Fields:** Calculate in application layer, nie w database

### Caching Strategy
- **Category Names:** In-memory cache dla category_id → name mapping
- **User Sessions:** JWT payload caching w middleware
- **Database Connections:** Connection pooling przez Supabase

### Response Time Targets
- **GET queries:** < 100ms dla < 100 records
- **POST/PUT operations:** < 200ms
- **DELETE operations:** < 50ms
- **Pagination:** < 150ms dla any page size ≤ 100

## 9. Kroki implementacji

### Krok 1: Repository Layer - UserProductRepository.ts
1. Create interface IUserProductRepository
2. Implement database access methods:
   - `findByUserId(userId, filters, pagination)`
   - `create(userId, productData)`
   - `findById(id, userId)` - z ownership validation
   - `update(id, userId, productData)`
   - `delete(id, userId)`
3. Add error handling for database operations
4. Write unit tests dla repository methods

### Krok 2: Service Layer - UserProductService.ts
1. Create interface IUserProductService
2. Implement business logic:
   - `getUserProducts(userId, queryParams)` - z filtering i pagination
   - `createProduct(userId, productData)` - z validation
   - `updateProduct(userId, productId, productData)`
   - `deleteProduct(userId, productId)`
3. Add data transformation (DB → DTO):
   - Calculate `isExpired` field
   - Calculate `daysUntilExpiry` field
   - Join category names
4. Add comprehensive validation using Zod schemas
5. Write unit tests dla service methods

### Krok 3: Validation Schemas - validation/userProducts.ts
1. Create Zod schemas:
   - `CreateUserProductSchema`
   - `UpdateUserProductSchema`
   - `UserProductsQuerySchema`
2. Add custom validators:
   - Unit enum validation
   - Date format validation
   - Quantity precision validation
3. Export validation functions

### Krok 4: Authentication Middleware
1. Extract JWT validation logic
2. Create `requireAuth` middleware function
3. Add user ID extraction and injection do request context
4. Handle authentication errors uniformly

### Krok 5: API Endpoints Implementation
1. **GET /api/user-products.ts:**
   - Parse i validate query parameters
   - Call service.getUserProducts()
   - Transform response z pagination
   - Add performance headers

2. **POST /api/user-products.ts:**
   - Validate request body
   - Call service.createProduct()
   - Return 201 z created product

3. **PUT /api/user-products/[id].ts:**
   - Extract i validate product ID
   - Validate request body
   - Call service.updateProduct()
   - Return 200 z updated product

4. **DELETE /api/user-products/[id].ts:**
   - Extract i validate product ID
   - Call service.deleteProduct()
   - Return 200 z success message

### Krok 6: Error Handling Enhancement
1. Create standardized error response builder
2. Add specific error handlers dla:
   - Validation errors
   - Authentication/authorization errors
   - Database constraint violations
   - Not found scenarios
3. Add request logging i monitoring
4. Implement graceful error recovery

### Krok 7: Testing i Validation
1. **Unit Tests:**
   - Repository methods z mocked database
   - Service methods z mocked repository
   - Validation schemas z various inputs
   - Computed fields calculation

2. **Integration Tests:**
   - Full API endpoints z test database
   - Authentication flow testing
   - Error scenario testing
   - Pagination and filtering testing

3. **Performance Tests:**
   - Load testing z concurrent requests
   - Database query performance analysis
   - Memory usage monitoring

### Krok 8: Documentation i Monitoring
1. Add OpenAPI/Swagger documentation
2. Create API usage examples
3. Add performance monitoring:
   - Request duration tracking
   - Error rate monitoring
   - Database query performance
4. Set up alerting dla high error rates lub slow responses

### Krok 9: Security Review i Hardening
1. Security audit dla input validation
2. Test authentication i authorization edge cases
3. Review dla potential data leakage
4. Add additional rate limiting jeśli needed
5. Validate RLS policies w database

### Krok 10: Production Deployment
1. Environment-specific configuration
2. Database migration scripts
3. Monitoring setup w production
4. Performance baseline establishment
5. Gradual rollout z feature flags