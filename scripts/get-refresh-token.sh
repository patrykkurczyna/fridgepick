#!/bin/bash

# Script to get JWT token with refresh token for longer sessions
# Usage: ./scripts/get-refresh-token.sh

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

echo "🔑 Getting JWT token with refresh token for $SUPABASE_EMAIL..."

RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$SUPABASE_EMAIL\",
    \"password\": \"$SUPABASE_PASSWORD\"
  }")

if echo "$RESPONSE" | grep -q "access_token"; then
    # Extract both access and refresh tokens
    export JWT_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    export REFRESH_TOKEN=$(echo "$RESPONSE" | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)
    
    echo "✅ Tokens retrieved successfully!"
    echo "Access Token: ${JWT_TOKEN:0:50}..."
    echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
    
    # Show token expiry info
    echo ""
    echo "🕐 Token Details:"
    echo "$RESPONSE" | grep -o '"expires_in":[^,}]*' | cut -d':' -f2 | sed 's/^/Access Token expires in: /' | sed 's/$/ seconds/'
    echo "$RESPONSE" | grep -o '"expires_at":[^,}]*' | cut -d':' -f2 | sed 's/^/Expires at: /'
    
    echo ""
    echo "💡 To refresh the token later, use:"
    echo "curl -X POST \"$SUPABASE_URL/auth/v1/token?grant_type=refresh_token\" \\"
    echo "  -H \"apikey: $SUPABASE_KEY\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"refresh_token\": \"'\$REFRESH_TOKEN'\"}'"
    
else
    echo "❌ Failed to get tokens"
    echo "Response: $RESPONSE"
fi