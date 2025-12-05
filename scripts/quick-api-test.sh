#!/bin/bash

# Quick test script for FridgePick API (Product Categories + User Products)
# Usage: ./scripts/quick-api-test.sh

BASE_URL="http://localhost:3000"
CATEGORIES_URL="$BASE_URL/api/product-categories"
USER_PRODUCTS_URL="$BASE_URL/api/user-products"
HEALTH_URL="$BASE_URL/api/health"

# JWT token for authenticated requests (set this to your actual token)
# You can get this from browser dev tools after logging in
# JWT_TOKEN="your_jwt_token_here"

echo "🧪 Testing FridgePick API"
echo "🏷️  Categories: $CATEGORIES_URL"
echo "📦 Products: $USER_PRODUCTS_URL"
echo "💊 Health: $HEALTH_URL"
echo "================================================="

# Check if server is running
echo "📡 Testing server connectivity..."
if ! curl -s --connect-timeout 5 "$BASE_URL" > /dev/null; then
    echo "❌ Server not reachable at $BASE_URL"
    echo "   Make sure to run: npm run dev"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Test 1: Product Categories - Basic GET request
echo "🔍 Test 1: Product Categories - Basic GET"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" "$CATEGORIES_URL")
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3}).*/\1/')
RESPONSE_TIME=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*TIME:([0-9.]+).*/\1/')
RESPONSE_BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3};TIME:[0-9.]+$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Status: $HTTP_STATUS (Response time: ${RESPONSE_TIME}s)"
    CATEGORY_COUNT=$(echo "$RESPONSE_BODY" | grep -o '"id"' | wc -l)
    echo "📊 Found $CATEGORY_COUNT categories"
else
    echo "❌ Status: $HTTP_STATUS"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 2: Product Categories - Cache test (second request)
echo "⚡ Test 2: Categories - Cache behavior"
echo "------------------------------------"
RESPONSE2=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" "$CATEGORIES_URL" -D /tmp/headers.txt 2>/dev/null)
HTTP_STATUS2=$(echo $RESPONSE2 | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3}).*/\1/')
RESPONSE_TIME2=$(echo $RESPONSE2 | tr -d '\n' | sed -E 's/.*TIME:([0-9.]+).*/\1/')

if [ "$HTTP_STATUS2" -eq 200 ]; then
    echo "✅ Status: $HTTP_STATUS2 (Response time: ${RESPONSE_TIME2}s)"

    # Check cache headers
    if grep -q "X-Cache-Status: HIT" /tmp/headers.txt 2>/dev/null; then
        echo "💾 Cache: HIT ✅"
    else
        echo "💾 Cache: MISS (this is normal for rapid consecutive requests)"
    fi

    # Compare response times
    FASTER=$(echo "$RESPONSE_TIME $RESPONSE_TIME2" | awk '{print ($1 > $2) ? "Second" : "First"}')
    echo "🏃 Faster request: $FASTER"
else
    echo "❌ Status: $HTTP_STATUS2"
fi
echo ""

# Test 3: Product Categories - ETag test
echo "🏷️  Test 3: Categories - ETag conditional request"
echo "----------------------------------------------"
ETAG=$(grep -i "etag:" /tmp/headers.txt 2>/dev/null | cut -d' ' -f2 | tr -d '\r\n' || echo "")

if [ -n "$ETAG" ]; then
    echo "📌 ETag found: $ETAG"

    ETAG_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$CATEGORIES_URL" -H "If-None-Match: $ETAG")
    ETAG_STATUS=$(echo $ETAG_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3}).*/\1/')

    if [ "$ETAG_STATUS" -eq 304 ]; then
        echo "✅ ETag working: Got 304 Not Modified"
    else
        echo "⚠️  ETag test: Got $ETAG_STATUS (expected 304)"
    fi
else
    echo "⚠️  No ETag found in response headers"
fi
echo ""

# Test 4: Health check
echo "🏥 Test 4: Health check"
echo "----------------------"
HEALTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$HEALTH_URL")
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3}).*/\1/')
HEALTH_BODY=$(echo $HEALTH_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HEALTH_STATUS" -eq 200 ]; then
    echo "✅ Health Status: $HEALTH_STATUS"

    # Parse health status
    OVERALL_STATUS=$(echo "$HEALTH_BODY" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    DB_STATUS=$(echo "$HEALTH_BODY" | grep -o '"database":{"status":"[^"]*"' | cut -d'"' -f6)

    echo "💊 Overall: $OVERALL_STATUS"
    echo "🗄️  Database: $DB_STATUS"
else
    echo "❌ Health Status: $HEALTH_STATUS"
    echo "Response: $HEALTH_BODY"
fi
echo ""

# Test 5: Rate limit headers
echo "🚦 Test 5: Rate limiting headers"
echo "-------------------------------"
RATE_HEADERS=$(grep -E "(X-RateLimit-)" /tmp/headers.txt 2>/dev/null || echo "No rate limit headers found")
if [ "$RATE_HEADERS" != "No rate limit headers found" ]; then
    echo "$RATE_HEADERS"
else
    echo "⚠️  $RATE_HEADERS"
fi
echo ""

# Test 6: User Products Authentication Check
echo "🔐 Test 6: User Products - Authentication Check"
echo "-----------------------------------------------"
if [ -z "$JWT_TOKEN" ]; then
    echo "⚠️  JWT_TOKEN not set - testing unauthorized access"
    USER_PRODUCTS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$USER_PRODUCTS_URL")
    USER_PRODUCTS_STATUS=$(echo $USER_PRODUCTS_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3}).*/\1/')

    if [ "$USER_PRODUCTS_STATUS" -eq 401 ]; then
        echo "✅ Expected 401 Unauthorized (JWT required)"
    else
        echo "❌ Unexpected status: $USER_PRODUCTS_STATUS"
    fi
else
    echo "🔑 JWT_TOKEN set - testing authenticated access"
    USER_PRODUCTS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$USER_PRODUCTS_URL" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json")
    USER_PRODUCTS_STATUS=$(echo $USER_PRODUCTS_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3}).*/\1/')
    USER_PRODUCTS_BODY=$(echo $USER_PRODUCTS_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

    if [ "$USER_PRODUCTS_STATUS" -eq 200 ]; then
        echo "✅ Status: $USER_PRODUCTS_STATUS (Authenticated successfully)"
        PRODUCT_COUNT=$(echo "$USER_PRODUCTS_BODY" | grep -o '"id"' | wc -l || echo "0")
        echo "📦 Found $PRODUCT_COUNT products"
    else
        echo "❌ Status: $USER_PRODUCTS_STATUS"
        echo "Response: $USER_PRODUCTS_BODY"
    fi
fi
echo ""

# Test 7: Create Product Test (if authenticated)
if [ -n "$JWT_TOKEN" ]; then
    echo "➕ Test 7: User Products - Create Product"
    echo "-----------------------------------------"
    CREATE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$USER_PRODUCTS_URL" \
        -X POST \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Product",
            "categoryId": 1,
            "quantity": 1.0,
            "unit": "szt",
            "expiresAt": "2026-12-31"
        }')

    CREATE_STATUS=$(echo $CREATE_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3}).*/\1/')
    CREATE_BODY=$(echo $CREATE_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

    if [ "$CREATE_STATUS" -eq 201 ]; then
        echo "✅ Status: $CREATE_STATUS (Product created successfully)"
        PRODUCT_ID=$(echo "$CREATE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -n "$PRODUCT_ID" ]; then
            echo "🆔 Created product ID: $PRODUCT_ID"

            # Test 8: Delete the test product
            echo ""
            echo "🗑️  Test 8: User Products - Delete Test Product"
            echo "-----------------------------------------------"
            DELETE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$USER_PRODUCTS_URL/$PRODUCT_ID" \
                -X DELETE \
                -H "Authorization: Bearer $JWT_TOKEN")

            DELETE_STATUS=$(echo $DELETE_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3}).*/\1/')

            if [ "$DELETE_STATUS" -eq 200 ]; then
                echo "✅ Status: $DELETE_STATUS (Product deleted successfully)"
            else
                echo "❌ Status: $DELETE_STATUS (Failed to delete test product)"
            fi
        fi
    else
        echo "❌ Status: $CREATE_STATUS"
        echo "Response: $CREATE_BODY"
    fi
    echo ""
fi

# Cleanup
rm -f /tmp/headers.txt 2>/dev/null

echo "🎉 Testing complete!"
echo ""
echo "📋 Summary:"
echo "   ✅ Product Categories (public endpoints)"
echo "   ✅ Health Check"
if [ -n "$JWT_TOKEN" ]; then
    echo "   ✅ User Products (authenticated endpoints)"
else
    echo "   ⚠️  User Products (authentication check only - set JWT_TOKEN for full testing)"
fi
echo ""
echo "💡 Tips:"
echo "   - Set JWT_TOKEN environment variable for full user products testing"
echo "   - Run tests multiple times to see cache behavior"
echo "   - Check server logs for detailed information"
echo "   - Use the full test suite in scripts/test-api-endpoints.md"
echo ""
echo "🔧 To set JWT token:"
echo "   export JWT_TOKEN=\"your_jwt_token_from_browser_devtools\""
