#!/bin/bash

# Quick test script for Product Categories API
# Usage: ./scripts/quick-test.sh

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/product-categories"
HEALTH_URL="$BASE_URL/api/health"

echo "🧪 Testing Product Categories API at $API_URL"
echo "=================================================="

# Check if server is running
echo "📡 Testing server connectivity..."
if ! curl -s --connect-timeout 5 "$BASE_URL" > /dev/null; then
    echo "❌ Server not reachable at $BASE_URL"
    echo "   Make sure to run: npm run dev"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Test 1: Basic GET request
echo "🔍 Test 1: Basic GET request"
echo "----------------------------"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" "$API_URL")
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

# Test 2: Cache test (second request)
echo "⚡ Test 2: Cache behavior (second request)"
echo "----------------------------------------"
RESPONSE2=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" "$API_URL" -D /tmp/headers.txt 2>/dev/null)
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

# Test 3: ETag test
echo "🏷️  Test 3: ETag conditional request"
echo "-----------------------------------"
ETAG=$(grep -i "etag:" /tmp/headers.txt 2>/dev/null | cut -d' ' -f2 | tr -d '\r\n' || echo "")

if [ -n "$ETAG" ]; then
    echo "📌 ETag found: $ETAG"

    ETAG_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_URL" -H "If-None-Match: $ETAG")
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

# Cleanup
rm -f /tmp/headers.txt 2>/dev/null

echo "🎉 Testing complete!"
echo ""
echo "💡 Tips:"
echo "   - Run tests multiple times to see cache behavior"
echo "   - Check server logs for detailed information"
echo "   - Use the full test suite in scripts/test-api-endpoints.md"
