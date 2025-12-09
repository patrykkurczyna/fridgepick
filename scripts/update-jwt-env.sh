#!/bin/bash

# Script to update JWT token in .env.local
# Usage: ./scripts/update-jwt-env.sh

echo "🔄 Updating JWT token in .env.local..."

# Get fresh JWT token
echo "🔑 Getting fresh JWT token..."
TOKEN=$(./scripts/get-jwt.sh 2>&1 | grep "Token:" | sed 's/.*Token: //')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get JWT token"
  exit 1
fi

echo "✅ Got fresh token"

# Update .env.local file
if [ -f ".env.local" ]; then
  # Update existing token (try both JWT_TOKEN and PUBLIC_JWT_TOKEN)
  sed -i '' "s/^JWT_TOKEN=.*/PUBLIC_JWT_TOKEN=$TOKEN/" .env.local
  sed -i '' "s/^PUBLIC_JWT_TOKEN=.*/PUBLIC_JWT_TOKEN=$TOKEN/" .env.local
  echo "✅ Updated JWT_TOKEN in .env.local"
else
  # Create new .env.local file
  cat > .env.local << EOF
# Local environment variables - not committed to git
# Generate token with: ./scripts/get-jwt.sh

# JWT Token for API authentication (PUBLIC_ prefix makes it available in client-side code)
PUBLIC_JWT_TOKEN=$TOKEN
EOF
  echo "✅ Created .env.local with JWT_TOKEN"
fi

echo "🎉 Token updated successfully!"
echo "💡 Restart the dev server to use the new token: npm run dev"