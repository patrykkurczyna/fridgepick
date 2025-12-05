# API Testing Guide - FridgePick API

This guide provides curl commands to test all FridgePick API endpoints including product categories and user products (fridge inventory).

## Prerequisites

1. **Start your Astro development server:**
   ```bash
   npm run dev
   ```

2. **Seed the database with test data:**
   - Open Supabase Dashboard → SQL Editor
   - Run the SQL from `scripts/seed-product-categories.sql`
   - Or use psql: `psql -h <host> -U <user> -d <database> -f scripts/seed-product-categories.sql`

3. **Verify your `.env` has proper Supabase credentials:**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

## API Endpoint Tests

### 1. Basic GET Request - Fetch All Categories

```bash
curl -X GET "http://localhost:3000/api/product-categories" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Response (200 OK):**
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
    }
    // ... more categories
  ]
}
```

### 2. Test Caching - Multiple Requests

```bash
# First request (cache MISS)
echo "=== First request (should be cache MISS) ==="
curl -X GET "http://localhost:3000/api/product-categories" \
  -H "Content-Type: application/json" \
  -w "\nResponse Time: %{time_total}s\n" \
  -s -D headers1.txt

echo "\n=== Response Headers ==="
cat headers1.txt | grep -E "(X-Cache-Status|X-Response-Time|ETag)"

# Second request (cache HIT)
echo "\n=== Second request (should be cache HIT) ==="
curl -X GET "http://localhost:3000/api/product-categories" \
  -H "Content-Type: application/json" \
  -w "\nResponse Time: %{time_total}s\n" \
  -s -D headers2.txt

echo "\n=== Response Headers ==="
cat headers2.txt | grep -E "(X-Cache-Status|X-Response-Time|ETag)"

# Clean up
rm headers1.txt headers2.txt 2>/dev/null
```

### 3. Test ETag Conditional Requests (304 Not Modified)

```bash
# First, get the ETag
echo "=== Getting ETag ==="
ETAG=$(curl -X GET "http://localhost:3000/api/product-categories" \
  -H "Content-Type: application/json" \
  -s -I | grep -i etag | cut -d' ' -f2 | tr -d '\r\n')

echo "ETag: $ETAG"

# Now make conditional request with If-None-Match
echo -e "\n=== Conditional request with ETag (should return 304) ==="
curl -X GET "http://localhost:3000/api/product-categories" \
  -H "Content-Type: application/json" \
  -H "If-None-Match: $ETAG" \
  -v
```

### 4. Test Rate Limiting

```bash
# Test rate limiting by making many requests quickly
echo "=== Testing rate limiting (making 10 requests quickly) ==="
for i in {1..10}; do
  echo "Request $i:"
  curl -X GET "http://localhost:3000/api/product-categories" \
    -H "Content-Type: application/json" \
    -w "Status: %{http_code}, Time: %{time_total}s\n" \
    -s -o /dev/null \
    -D /dev/stdout | grep -E "(X-RateLimit|HTTP)"
  echo "---"
done
```

### 5. Test Different User Agents

```bash
# Test with different User-Agent headers
echo "=== Request with curl user agent ==="
curl -X GET "http://localhost:3000/api/product-categories" \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl/7.68.0" \
  -s -D /dev/stdout | head -10

echo -e "\n=== Request with browser user agent ==="
curl -X GET "http://localhost:3000/api/product-categories" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -s -D /dev/stdout | head -10
```

### 6. Test Health Check Endpoint

```bash
# Test health check endpoint
echo "=== Health check (GET) ==="
curl -X GET "http://localhost:3000/api/health" \
  -H "Content-Type: application/json" \
  -v

echo -e "\n=== Health check (HEAD) - for load balancers ==="
curl -X HEAD "http://localhost:3000/api/health" \
  -v
```

### 7. Test Error Scenarios

```bash
# Test with invalid method
echo "=== Testing POST method (should return 405) ==="
curl -X POST "http://localhost:3000/api/product-categories" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -v

# Test with malformed headers
echo -e "\n=== Testing with invalid Accept header ==="
curl -X GET "http://localhost:3000/api/product-categories" \
  -H "Accept: invalid/type" \
  -v
```

## Performance Testing

### 8. Load Testing with Multiple Concurrent Requests

```bash
# Simple load test (requires GNU parallel)
echo "=== Load testing with 5 concurrent requests ==="
seq 1 5 | parallel -j5 'curl -X GET "http://localhost:3000/api/product-categories" -w "Request {}: %{http_code} in %{time_total}s\n" -s -o /dev/null'
```

### 9. Measure Response Times

```bash
# Detailed timing information
echo "=== Detailed timing analysis ==="
curl -X GET "http://localhost:3000/api/product-categories" \
  -w "DNS Lookup: %{time_namelookup}s\nConnect: %{time_connect}s\nApp Connect: %{time_appconnect}s\nPre Transfer: %{time_pretransfer}s\nRedirect: %{time_redirect}s\nStart Transfer: %{time_starttransfer}s\nTotal: %{time_total}s\nHTTP Code: %{http_code}\nSize: %{size_download} bytes\n" \
  -s -o /dev/null
```

## Part 2: User Products (Authenticated Endpoints)

### 10. Get User's Product Inventory

```bash
echo "=== Getting all user products ==="
curl -X GET "http://localhost:3000/api/user-products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Mleko 3.2%",
      "categoryId": 1,
      "categoryName": "nabiał",
      "quantity": 1.0,
      "unit": "l",
      "expiresAt": "2024-12-10",
      "isExpired": false,
      "daysUntilExpiry": 5,
      "createdAt": "2024-12-05T10:00:00.000Z",
      "updatedAt": "2024-12-05T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### 11. Filter Products by Category

```bash
echo "=== Filtering products by category (dairy) ==="
curl -X GET "http://localhost:3000/api/user-products?category=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

### 12. Filter Expired Products

```bash
echo "=== Getting expired products ==="
curl -X GET "http://localhost:3000/api/user-products?expired=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

### 13. Filter Products Expiring Soon

```bash
echo "=== Getting products expiring in next 7 days ==="
curl -X GET "http://localhost:3000/api/user-products?expiring_soon=7" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

### 14. Create New Product

```bash
echo "=== Creating new product ==="
curl -X POST "http://localhost:3000/api/user-products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Ser Feta",
    "categoryId": 1,
    "quantity": 0.5,
    "unit": "g",
    "expiresAt": "2026-12-15"
  }' \
  -v
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "generated-uuid",
    "name": "Ser Gouda",
    "categoryId": 1,
    "categoryName": "nabiał",
    "quantity": 0.5,
    "unit": "g",
    "expiresAt": "2024-12-15",
    "isExpired": false,
    "daysUntilExpiry": 10,
    "createdAt": "2024-12-05T10:15:00.000Z",
    "updatedAt": "2024-12-05T10:15:00.000Z"
  }
}
```

### 15. Get Single Product by ID

```bash
# Save product ID from previous response
PRODUCT_ID="550e8400-e29b-41d4-a716-446655440000"

echo "=== Getting single product ==="
curl -X GET "http://localhost:3000/api/user-products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

### 16. Update Product

```bash
echo "=== Updating product ==="
curl -X PUT "http://localhost:3000/api/user-products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Ser Gouda premium",
    "quantity": 0.3,
    "expiresAt": "2024-12-20"
  }' \
  -v
```

### 17. Delete Product

```bash
echo "=== Deleting product ==="
curl -X DELETE "http://localhost:3000/api/user-products/$PRODUCT_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 18. Test Authentication Errors

```bash
echo "=== Testing without auth token (should return 401) ==="
curl -X GET "http://localhost:3000/api/user-products" \
  -H "Content-Type: application/json" \
  -v

echo "\n=== Testing with invalid token (should return 401) ==="
curl -X GET "http://localhost:3000/api/user-products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -v
```

### 19. Test Validation Errors

```bash
echo "=== Testing invalid product data (should return 400) ==="
curl -X POST "http://localhost:3000/api/user-products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "",
    "categoryId": "invalid",
    "quantity": -1,
    "unit": "invalid_unit",
    "expiresAt": "2023-01-01"
  }' \
  -v
```

### 20. Test Pagination

```bash
echo "=== Testing pagination ==="
curl -X GET "http://localhost:3000/api/user-products?limit=2&offset=0&sort=name" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -v
```

## Monitor Server Logs

While running these tests, monitor your server logs to see the caching behavior:

```bash
# In your Astro dev server terminal, you should see logs like:
# ProductCategories API: Request started
# ProductCategoryService: Cache miss or expired, fetching from database  
# ProductCategoryService: Successfully retrieved categories from database
# ProductCategories API: Cache statistics
# UserProducts API: GET request started
# UserProductService: Successfully retrieved products for user
```

## Expected Behaviors

### Product Categories:
1. **First Request**: Cache MISS, database query, slower response
2. **Subsequent Requests**: Cache HIT, faster response (within 30 minutes)
3. **ETag Requests**: 304 Not Modified when ETag matches
4. **Rate Limiting**: Headers show remaining requests, 429 when exceeded
5. **Health Check**: Shows database connectivity and response times

### User Products:
1. **Authentication**: All endpoints require valid JWT token
2. **Ownership**: Users can only access their own products
3. **Computed Fields**: isExpired and daysUntilExpiry calculated dynamically
4. **Validation**: Comprehensive validation with user-friendly error messages
5. **Rate Limiting**: User-specific rate limits (demo users: 10/hour, verified: 100/hour)
6. **Filtering**: Support for category, expiration status, and time-based filters
7. **Pagination**: Efficient pagination with metadata

## Troubleshooting

### General Issues:
- **500 Error**: Check Supabase connection and environment variables
- **Empty Response**: Verify database has seed data
- **CORS Issues**: Check if running on correct port (4321)
- **Rate Limiting**: Wait an hour or restart server to reset rate limits

### Authentication Issues:
- **401 Unauthorized**: Check JWT token format and validity
- **403 Forbidden**: User may not own the requested resource
- **Token Expired**: Generate a new JWT token

### User Products Issues:
- **404 Not Found**: Product doesn't exist or user doesn't own it
- **400 Bad Request**: Check request body format and required fields
- **422 Unprocessable**: Category ID doesn't exist or business rules violated

## Performance Tips

1. **Use pagination** for large product lists
2. **Filter at API level** rather than client-side for better performance
3. **Cache responses** on client-side for frequently accessed data
4. **Monitor response times** in X-Response-Time headers
