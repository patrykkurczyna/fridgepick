# Implementation Plan: GET /api/product-categories

## 1. Endpoint Analysis

### 1.1 API Specification
- **Method**: GET
- **URL**: `/api/product-categories`
- **Authentication**: No authentication required (public data)
- **Purpose**: Return static dictionary of product categories for user inventory management

### 1.2 Response Contract
```typescript
{
  categories: ProductCategoryDTO[]
}

interface ProductCategoryDTO {
  id: number;
  name: string;
  description: string | null;
}
```

### 1.3 Expected Response Examples
```json
{
  "categories": [
    {
      "id": 1,
      "name": "nabiał",
      "description": "Produkty mleczne i nabiałowe"
    },
    {
      "id": 2,
      "name": "mięso", 
      "description": "Mięso i produkty mięsne"
    },
    {
      "id": 3,
      "name": "pieczywo",
      "description": "Pieczywo i wypieki"
    },
    {
      "id": 4,
      "name": "warzywa",
      "description": "Warzywa świeże i przetworzone"
    },
    {
      "id": 5,
      "name": "owoce",
      "description": "Owoce świeże i suszone"
    }
  ]
}
```

## 2. Database Resources

### 2.1 Target Table
```sql
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Data Mapping
```typescript
// Database Row -> DTO mapping
const mapToDTO = (row: Tables['product_categories']['Row']): ProductCategoryDTO => ({
  id: row.id,
  name: row.name,
  description: row.description
});
```

### 2.3 Query Strategy
- Simple `SELECT id, name, description FROM product_categories ORDER BY name`
- No pagination needed (limited dataset ~5-15 categories)
- No filtering/search needed for MVP
- Consider caching due to static nature of data

## 3. Type Safety Requirements

### 3.1 Input Types
- **Query Parameters**: None required
- **Path Parameters**: None required
- **Request Body**: None (GET request)

### 3.2 Output Types
- **Success Response**: `ProductCategoriesResponse` from `src/types.ts:72`
- **Error Response**: `ApiErrorResponse` from `src/types.ts:415`

### 3.3 Database Types
- **Table Row**: `Tables['product_categories']['Row']` from database types
- **Query Result**: Array of rows with selected fields only

## 4. Architecture Design

### 4.1 File Structure
```
src/
├── pages/api/
│   └── product-categories.ts         # Astro API endpoint
├── services/
│   └── ProductCategoryService.ts     # Business logic layer
├── repositories/
│   └── ProductCategoryRepository.ts  # Data access layer
└── types.ts                          # Already exists
```

### 4.2 Service Layer Architecture
```typescript
// ProductCategoryService.ts
export class ProductCategoryService {
  constructor(private repository: ProductCategoryRepository) {}
  
  async getAllCategories(): Promise<ProductCategoryDTO[]> {
    const rows = await this.repository.findAll();
    return rows.map(this.mapToDTO);
  }
  
  private mapToDTO(row: Tables['product_categories']['Row']): ProductCategoryDTO {
    return {
      id: row.id,
      name: row.name,
      description: row.description
    };
  }
}
```

### 4.3 Repository Layer
```typescript
// ProductCategoryRepository.ts
export class ProductCategoryRepository {
  constructor(private supabase: SupabaseClient<Database>) {}
  
  async findAll(): Promise<Tables['product_categories']['Row'][]> {
    const { data, error } = await this.supabase
      .from('product_categories')
      .select('id, name, description')
      .order('name');
    
    if (error) throw new DatabaseError('Failed to fetch categories', error);
    return data || [];
  }
}
```

## 5. Security Considerations

### 5.1 Authentication
- **Level**: Public endpoint (no authentication required)
- **Rationale**: Product categories are static reference data needed for UI dropdowns before login

### 5.2 Authorization
- **Level**: None required
- **Data Sensitivity**: Low (public product category names)

### 5.3 Rate Limiting
- **Strategy**: Standard rate limiting (1000 req/hour per IP)
- **Caching**: Aggressive caching recommended (1 hour+ TTL)
- **CDN**: Consider CDN caching for production

### 5.4 Input Validation
- **Query Parameters**: None to validate
- **Sanitization**: Not required (no user input)
- **CORS**: Allow from configured frontend domains

## 6. Error Handling Strategy

### 6.1 Error Types
```typescript
// Possible errors and HTTP status codes
DatabaseError        -> 500 Internal Server Error
ValidationError      -> 400 Bad Request (unlikely for this endpoint)
NetworkTimeout       -> 504 Gateway Timeout
UnknownError         -> 500 Internal Server Error
```

### 6.2 Error Response Format
```typescript
// Error response follows ApiErrorResponse interface
{
  error: true,
  message: "Failed to retrieve product categories",
  code: "DATABASE_ERROR",
  details?: {
    timestamp: "2024-12-05T10:00:00Z",
    requestId: "req-123456"
  }
}
```

### 6.3 Fallback Strategy
```typescript
// Graceful degradation with static fallback
const FALLBACK_CATEGORIES: ProductCategoryDTO[] = [
  { id: 1, name: "nabiał", description: "Produkty mleczne i nabiałowe" },
  { id: 2, name: "mięso", description: "Mięso i produkty mięsne" },
  { id: 3, name: "pieczywo", description: "Pieczywo i wypieki" },
  { id: 4, name: "warzywa", description: "Warzywa świeże i przetworzone" },
  { id: 5, name: "owoce", description: "Owoce świeże i suszone" }
];
```

## 7. Performance Considerations

### 7.1 Caching Strategy
- **Level 1**: In-memory cache (30 minutes TTL)
- **Level 2**: Redis cache (1 hour TTL) - for future scaling
- **Level 3**: HTTP cache headers (Cache-Control: public, max-age=3600)

### 7.2 Database Optimization
- **Query**: Simple indexed query (primary key ordering)
- **Connection Pooling**: Use Supabase connection pooling
- **Result Size**: Small dataset (~5-15 rows, ~500 bytes)

### 7.3 Response Optimization
- **Compression**: Enable gzip compression
- **ETag**: Generate ETag based on data hash for conditional requests
- **CDN**: Serve from CDN in production

## 8. Monitoring and Observability

### 8.1 Metrics to Track
- **Response Time**: Target <100ms (p95)
- **Error Rate**: Target <0.1%
- **Cache Hit Rate**: Target >95%
- **Database Query Time**: Target <50ms

### 8.2 Logging Strategy
```typescript
// Log levels and events
INFO:  "ProductCategories request started"
DEBUG: "Database query executed", { queryTime: "45ms", rowCount: 5 }
INFO:  "ProductCategories response sent", { responseTime: "78ms" }
ERROR: "Database error occurred", { error: details, requestId: "123" }
```

### 8.3 Health Checks
- **Database Connectivity**: Test categories table access
- **Response Format**: Validate response schema
- **Performance**: Assert response time <200ms

## 9. Implementation Steps

### 9.1 Step 1: Setup Repository Layer
```typescript
// Create: src/repositories/ProductCategoryRepository.ts
1. Define repository interface
2. Implement Supabase data access
3. Add error handling and logging
4. Write unit tests for repository
```

### 9.2 Step 2: Create Service Layer  
```typescript
// Create: src/services/ProductCategoryService.ts
1. Implement business logic (minimal for this endpoint)
2. Add data transformation (DB row -> DTO)
3. Add caching logic
4. Write unit tests for service
```

### 9.3 Step 3: Implement API Endpoint
```typescript
// Create: src/pages/api/product-categories.ts
1. Setup Astro API endpoint
2. Add request/response handling
3. Integrate service layer
4. Add error handling middleware
5. Add response headers (caching, CORS)
```

### 9.4 Step 4: Add Caching Layer
```typescript
// Enhance service with caching
1. Implement in-memory cache
2. Add cache invalidation strategy
3. Add cache metrics
4. Test cache behavior
```

### 9.5 Step 5: Testing & Validation
```typescript
// Comprehensive testing
1. Unit tests (repository, service, endpoint)
2. Integration tests (database connectivity)
3. Performance tests (response time, load)
4. Error scenario tests (database down, network timeout)
```

### 9.6 Step 6: Documentation & Deployment
```typescript
// Finalize implementation
1. Add OpenAPI documentation
2. Update API documentation
3. Configure monitoring alerts
4. Deploy with feature flags
```

## 10. Acceptance Criteria

### 10.1 Functional Requirements
✅ **Returns all product categories** - Endpoint returns complete list of categories from database
✅ **Correct data format** - Response matches ProductCategoriesResponse interface exactly
✅ **Proper HTTP status** - Returns 200 OK for successful requests, appropriate error codes for failures
✅ **No authentication required** - Endpoint accessible without authentication headers

### 10.2 Non-Functional Requirements
✅ **Performance** - Response time <100ms (p95) under normal load
✅ **Reliability** - 99.9% uptime, handles database failures gracefully
✅ **Security** - No data exposure, proper CORS configuration
✅ **Cacheability** - Implements proper HTTP caching headers

### 10.3 Error Handling
✅ **Database errors** - Returns 500 with proper error message when database unavailable
✅ **Network timeouts** - Returns 504 when database query times out
✅ **Fallback data** - Returns static categories when database fails (optional)
✅ **Consistent format** - All errors follow ApiErrorResponse interface

### 10.4 Integration Requirements
✅ **Type safety** - Full TypeScript support with proper type inference
✅ **Supabase integration** - Uses existing Supabase client and middleware
✅ **Astro compatibility** - Works within Astro 5 API route system
✅ **Frontend ready** - Response format ready for immediate frontend consumption

## 11. Testing Strategy

### 11.1 Unit Tests
```typescript
// Repository tests
describe('ProductCategoryRepository', () => {
  test('should fetch all categories with correct query');
  test('should handle database errors gracefully');
  test('should return empty array when no categories exist');
});

// Service tests  
describe('ProductCategoryService', () => {
  test('should transform database rows to DTOs correctly');
  test('should handle repository errors');
  test('should maintain data integrity');
});
```

### 11.2 Integration Tests
```typescript
// API endpoint tests
describe('GET /api/product-categories', () => {
  test('should return 200 with categories list');
  test('should return proper cache headers');
  test('should handle database connection failure');
  test('should validate response schema');
});
```

### 11.3 Performance Tests
```typescript
// Load testing scenarios
1. Normal load: 100 concurrent requests, <100ms response time
2. High load: 500 concurrent requests, <200ms response time  
3. Cache effectiveness: 95% cache hit rate under load
4. Database failure: Graceful degradation with fallback data
```

This implementation plan provides a comprehensive roadmap for implementing the GET /api/product-categories endpoint with production-ready quality, proper error handling, caching, and monitoring.