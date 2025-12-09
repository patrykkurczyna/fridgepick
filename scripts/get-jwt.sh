#!/bin/bash

# Quick script to get JWT token for API testing
# Usage: source scripts/get-jwt.sh

# Load environment variables (.env first, then .env.local overrides)
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Check required environment variables
if [ -z "$SUPABASE_EMAIL" ] || [ -z "$SUPABASE_PASSWORD" ] || [ -z "$SUPABASE_KEY" ] || [ -z "$SUPABASE_URL" ]; then
    echo "❌ Missing required environment variables:"
    echo "   SUPABASE_EMAIL, SUPABASE_PASSWORD, SUPABASE_KEY, SUPABASE_URL"
    echo "   Make sure these are set in .env.local"
    exit 1
fi

echo "🔑 Getting JWT token for $SUPABASE_EMAIL..."

RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$SUPABASE_EMAIL\",
    \"password\": \"$SUPABASE_PASSWORD\"
  }")

if echo "$RESPONSE" | grep -q "access_token"; then
    export JWT_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "✅ JWT_TOKEN set successfully!"
    echo "Token: ${JWT_TOKEN}"
    echo ""
    echo "💡 You can now use:"
    echo "   curl -H \"Authorization: Bearer \$JWT_TOKEN\" http://localhost:3000/api/user-products"
    echo "   ./scripts/quick-api-test.sh"
else
    echo "❌ Failed to get JWT token"
    echo "Response: $RESPONSE"
fi
