#!/bin/bash

echo "🛒 Adding sample products to user inventory..."

# Get token
source scripts/get-jwt.sh

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ No JWT token available"
  exit 1
fi

# Array of sample products (YYYY-MM-DD format required by API)
declare -a products=(
  '{"name":"Mleko","categoryId":1,"quantity":1,"unit":"l","expiresAt":"'$(date -v+3d +"%Y-%m-%d")'"}' 
  '{"name":"Chleb","categoryId":3,"quantity":1,"unit":"szt","expiresAt":"'$(date -v+1d +"%Y-%m-%d")'"}' 
  '{"name":"Jajka","categoryId":1,"quantity":12,"unit":"szt","expiresAt":"'$(date -v+7d +"%Y-%m-%d")'"}' 
  '{"name":"Pomidory","categoryId":4,"quantity":6,"unit":"szt","expiresAt":"'$(date -v+5d +"%Y-%m-%d")'"}' 
  '{"name":"Ser","categoryId":1,"quantity":200,"unit":"g","expiresAt":"'$(date -v+10d +"%Y-%m-%d")'"}' 
  '{"name":"Masło","categoryId":1,"quantity":1,"unit":"szt","expiresAt":"'$(date -v+14d +"%Y-%m-%d")'"}' 
  '{"name":"Marchewka","categoryId":4,"quantity":1000,"unit":"g","expiresAt":"'$(date -v+8d +"%Y-%m-%d")'"}' 
  '{"name":"Banan","categoryId":5,"quantity":6,"unit":"szt","expiresAt":"'$(date -v+2d +"%Y-%m-%d")'"}' 
  '{"name":"Ryż","categoryId":5,"quantity":1000,"unit":"g","expiresAt":"'$(date -v+365d +"%Y-%m-%d")'"}' 
)

# Add each product
for product in "${products[@]}"; do
  echo "Adding: $(echo $product | jq -r '.name')"
  
  response=$(curl -s -X POST "http://localhost:3000/api/user-products" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$product")
  
  if echo "$response" | grep -q '"id"'; then
    echo "✅ Added successfully"
  else
    echo "❌ Failed to add:"
    echo "$response"
  fi
  
  sleep 0.1
done

echo ""
echo "🎉 Sample products added! Check your fridge view."