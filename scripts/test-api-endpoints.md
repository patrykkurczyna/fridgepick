# API Testing Guide - Product Categories

This guide provides curl commands to test the `/api/product-categories` endpoint and health check.

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

## Monitor Server Logs

While running these tests, monitor your server logs to see the caching behavior:

```bash
# In your Astro dev server terminal, you should see logs like:
# ProductCategories API: Request started
# ProductCategoryService: Cache miss or expired, fetching from database  
# ProductCategoryService: Successfully retrieved categories from database
# ProductCategories API: Cache statistics
```

## Expected Behaviors

1. **First Request**: Cache MISS, database query, slower response
2. **Subsequent Requests**: Cache HIT, faster response (within 30 minutes)
3. **ETag Requests**: 304 Not Modified when ETag matches
4. **Rate Limiting**: Headers show remaining requests, 429 when exceeded
5. **Health Check**: Shows database connectivity and response times

## Troubleshooting

- **500 Error**: Check Supabase connection and environment variables
- **Empty Response**: Verify database has seed data
- **CORS Issues**: Check if running on correct port (4321)
- **Rate Limiting**: Wait an hour or restart server to reset rate limits
