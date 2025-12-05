# REST API Plan - FridgePick MVP

## 1. Resources

### Core Resources
- **users** - User authentication and profile management
- **product-categories** - Food product categories dictionary
- **user-products** - User's fridge/pantry inventory  
- **recipes** - Recipe database with nutritional information
- **recipe-ingredients** - Recipe ingredient requirements
- **user-preferences** - User dietary preferences for meal planning
- **weekly-meal-plans** - Weekly meal planning sessions
- **meal-plan-items** - Individual meals within weekly plans
- **cooked-meals** - Cooking history tracking
- **ai-recipe-recommendations** - AI matching cache optimization

## 2. Endpoints

### 2.1 Product Categories

#### GET /api/product-categories
**Description:** Get all product categories
**Response (200):**
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
  ]
}
```

### 2.2 User Products (Fridge Inventory)

#### GET /api/user-products
**Description:** Get user's product inventory
**Query Parameters:**
- `category` (optional) - Filter by category ID
- `expired` (optional) - Filter expired products (true/false)
- `expiring_soon` (optional) - Products expiring within N days
- `sort` (optional) - Sort by: name, expires_at, created_at
- `limit` (optional) - Pagination limit (default: 50)
- `offset` (optional) - Pagination offset

**Response (200):**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Mleko 2%",
      "categoryId": 1,
      "categoryName": "nabiał", 
      "quantity": 1.0,
      "unit": "l",
      "expiresAt": "2024-12-10",
      "createdAt": "2024-12-05T10:00:00Z",
      "isExpired": false,
      "daysUntilExpiry": 5
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

#### POST /api/user-products
**Description:** Add product to user's inventory
**Request Body:**
```json
{
  "name": "Mleko 2%",
  "categoryId": 1,
  "quantity": 1.0,
  "unit": "l",
  "expiresAt": "2024-12-10"
}
```
**Response (201):**
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "Mleko 2%",
    "categoryId": 1,
    "quantity": 1.0,
    "unit": "l", 
    "expiresAt": "2024-12-10",
    "createdAt": "2024-12-05T10:00:00Z"
  }
}
```
**Errors:** 400 (validation), 404 (invalid category)

#### PUT /api/user-products/:id
**Description:** Update product in inventory
**Request Body:**
```json
{
  "name": "Mleko 3.2%",
  "categoryId": 1,
  "quantity": 0.5,
  "unit": "l",
  "expiresAt": "2024-12-10"
}
```
**Response (200):** Same as POST response
**Errors:** 400 (validation), 404 (not found), 403 (not owner)

#### DELETE /api/user-products/:id
**Description:** Remove product from inventory
**Response (200):**
```json
{
  "success": true,
  "message": "Product removed successfully"
}
```
**Errors:** 404 (not found), 403 (not owner)

### 2.3 Recipes

#### GET /api/recipes
**Description:** Get recipes with filtering and search
**Query Parameters:**
- `search` (optional) - Search in recipe names
- `meal_category` (optional) - Filter by: śniadanie, obiad, kolacja, przekąska
- `protein_type` (optional) - Filter by: ryba, drób, czerwone mięso, vege
- `max_prep_time` (optional) - Max preparation time in minutes
- `available_ingredients` (optional) - Show only recipes user can make
- `sort` (optional) - Sort by: name, prep_time, created_at
- `limit` (optional) - Pagination limit (default: 20)
- `offset` (optional) - Pagination offset

**Response (200):**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "name": "Omlet z warzywami",
      "description": "Pyszny omlet na śniadanie",
      "mealCategory": "śniadanie", 
      "proteinType": "vege",
      "prepTimeMinutes": 15,
      "servings": 2,
      "nutritionalValues": {
        "calories": 280,
        "protein": 18,
        "carbs": 8,
        "fat": 20
      },
      "imageUrl": "https://example.com/omlet.jpg",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

#### GET /api/recipes/:id
**Description:** Get single recipe with ingredients
**Response (200):**
```json
{
  "recipe": {
    "id": "uuid",
    "name": "Omlet z warzywami",
    "description": "Pyszny omlet na śniadanie",
    "instructions": "<h3>Przygotowanie:</h3><ol><li>Rozbij jajka...</li></ol>",
    "mealCategory": "śniadanie",
    "proteinType": "vege", 
    "prepTimeMinutes": 15,
    "servings": 2,
    "nutritionalValues": {
      "calories": 280,
      "protein": 18,
      "carbs": 8,
      "fat": 20
    },
    "imageUrl": "https://example.com/omlet.jpg",
    "ingredients": [
      {
        "id": "uuid",
        "name": "jajka",
        "quantity": 3.0,
        "unit": "szt",
        "isRequired": true,
        "userHasIngredient": true,
        "userQuantity": 6.0
      },
      {
        "id": "uuid", 
        "name": "papryka",
        "quantity": 200.0,
        "unit": "g",
        "isRequired": false,
        "userHasIngredient": false,
        "userQuantity": 0.0
      }
    ],
    "canCook": true,
    "missingIngredients": []
  }
}
```
**Errors:** 404 (not found)

#### GET /api/recipes/recommendations
**Description:** AI-powered recipe recommendations based on user's ingredients
**Query Parameters:**
- `meal_category` (optional) - Filter recommendations
- `max_missing_ingredients` (optional) - Max number of missing ingredients (default: 3)
- `prioritize_expiring` (optional) - Prioritize recipes using expiring ingredients
- `limit` (optional) - Number of recommendations (default: 10)

**Response (200):**
```json
{
  "recommendations": [
    {
      "recipe": {
        "id": "uuid",
        "name": "Omlet z warzywami",
        "mealCategory": "śniadanie",
        "prepTimeMinutes": 15,
        "nutritionalValues": {
          "calories": 280
        }
      },
      "matchScore": 0.95,
      "matchLevel": "idealny",
      "availableIngredients": 5,
      "missingIngredients": [],
      "usingExpiringIngredients": ["mleko"]
    },
    {
      "recipe": {
        "id": "uuid2", 
        "name": "Kanapka z szynką"
      },
      "matchScore": 0.7,
      "matchLevel": "wymaga dokupienia",
      "availableIngredients": 2,
      "missingIngredients": ["szynka", "masło"],
      "usingExpiringIngredients": []
    }
  ],
  "cacheUsed": true,
  "generatedAt": "2024-12-05T10:00:00Z"
}
```

### 2.4 User Preferences

#### GET /api/user-preferences
**Description:** Get user's dietary preferences
**Response (200):**
```json
{
  "preferences": {
    "id": "uuid",
    "maxMeatMealsPerWeek": 4,
    "minFishMealsPerWeek": 1,
    "maxFishMealsPerWeek": 3,
    "vegeMealsPerWeek": 2,
    "eggBreakfastsPerWeek": 3,
    "eggDinnersPerWeek": 2,
    "sweetBreakfastRatio": 0.3,
    "dailyCalories": 2000,
    "additionalPreferences": {}
  }
}
```
**Errors:** 404 (no preferences set)

#### PUT /api/user-preferences
**Description:** Create or update user preferences
**Request Body:**
```json
{
  "maxMeatMealsPerWeek": 3,
  "minFishMealsPerWeek": 2,
  "maxFishMealsPerWeek": 4,
  "vegeMealsPerWeek": 3,
  "eggBreakfastsPerWeek": 4,
  "eggDinnersPerWeek": 1,
  "sweetBreakfastRatio": 0.4,
  "dailyCalories": 1800
}
```
**Response (200):**
```json
{
  "success": true,
  "preferences": {
    "id": "uuid",
    "maxMeatMealsPerWeek": 3,
    "minFishMealsPerWeek": 2,
    "maxFishMealsPerWeek": 4,
    "vegeMealsPerWeek": 3,
    "eggBreakfastsPerWeek": 4,
    "eggDinnersPerWeek": 1,
    "sweetBreakfastRatio": 0.4,
    "dailyCalories": 1800,
    "updatedAt": "2024-12-05T10:00:00Z"
  }
}
```
**Errors:** 400 (validation)

### 2.5 Weekly Meal Plans

#### GET /api/weekly-meal-plans
**Description:** Get user's meal plans
**Query Parameters:**
- `active_only` (optional) - Show only active plans (default: true)
- `week_start` (optional) - Filter by week start date (YYYY-MM-DD)
- `limit` (optional) - Pagination limit (default: 10)
- `offset` (optional) - Pagination offset

**Response (200):**
```json
{
  "mealPlans": [
    {
      "id": "uuid",
      "name": "Plan na tydzień 2024-12-02",
      "weekStartDate": "2024-12-02",
      "isActive": true,
      "generatedAt": "2024-12-01T15:00:00Z",
      "mealsCount": 35
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

#### GET /api/weekly-meal-plans/:id
**Description:** Get detailed meal plan with all meals
**Response (200):**
```json
{
  "mealPlan": {
    "id": "uuid",
    "name": "Plan na tydzień 2024-12-02", 
    "weekStartDate": "2024-12-02",
    "isActive": true,
    "generatedAt": "2024-12-01T15:00:00Z",
    "meals": [
      {
        "id": "uuid",
        "mealDate": "2024-12-02",
        "mealType": "śniadanie",
        "portions": 1,
        "recipe": {
          "id": "uuid",
          "name": "Omlet z warzywami",
          "prepTimeMinutes": 15,
          "nutritionalValues": {
            "calories": 280
          }
        },
        "canCook": true,
        "missingIngredients": []
      }
    ],
    "totalCaloriesPerDay": {
      "2024-12-02": 1950,
      "2024-12-03": 2100
    },
    "shoppingList": [
      {
        "ingredient": "papryka",
        "totalQuantity": 400.0,
        "unit": "g",
        "userHas": 200.0,
        "needToBuy": 200.0
      }
    ]
  }
}
```
**Errors:** 404 (not found), 403 (not owner)

#### POST /api/weekly-meal-plans/generate
**Description:** Generate new weekly meal plan using AI
**Request Body:**
```json
{
  "weekStartDate": "2024-12-02",
  "name": "Plan na tydzień 2024-12-02",
  "usePreferences": true,
  "prioritizeExpiringIngredients": true,
  "targetCaloriesPerDay": 2000
}
```
**Response (201):**
```json
{
  "success": true,
  "mealPlan": {
    "id": "uuid",
    "name": "Plan na tydzień 2024-12-02",
    "weekStartDate": "2024-12-02",
    "isActive": true,
    "generatedAt": "2024-12-05T10:00:00Z",
    "mealsCount": 35
  },
  "message": "Meal plan generated successfully"
}
```
**Errors:** 400 (validation), 422 (insufficient ingredients)

#### PUT /api/weekly-meal-plans/:id
**Description:** Update meal plan details
**Request Body:**
```json
{
  "name": "Updated plan name",
  "isActive": false
}
```
**Response (200):** Same as GET response
**Errors:** 404 (not found), 403 (not owner)

#### DELETE /api/weekly-meal-plans/:id  
**Description:** Delete meal plan
**Response (200):**
```json
{
  "success": true,
  "message": "Meal plan deleted successfully"
}
```

### 2.6 Meal Plan Items

#### PUT /api/meal-plan-items/:id
**Description:** Update specific meal in plan
**Request Body:**
```json
{
  "recipeId": "new-recipe-uuid",
  "portions": 2
}
```
**Response (200):**
```json
{
  "success": true,
  "mealItem": {
    "id": "uuid",
    "mealDate": "2024-12-02",
    "mealType": "śniadanie", 
    "portions": 2,
    "recipe": {
      "id": "new-recipe-uuid",
      "name": "Nowy przepis"
    }
  }
}
```

### 2.7 Cooked Meals

#### GET /api/cooked-meals
**Description:** Get user's cooking history
**Query Parameters:**
- `date_from` (optional) - Filter from date (YYYY-MM-DD)
- `date_to` (optional) - Filter to date (YYYY-MM-DD)
- `recipe_id` (optional) - Filter by specific recipe
- `limit` (optional) - Pagination limit (default: 20)
- `offset` (optional) - Pagination offset

**Response (200):**
```json
{
  "cookedMeals": [
    {
      "id": "uuid",
      "cookedAt": "2024-12-05T18:30:00Z",
      "portionsCount": 2,
      "recipe": {
        "id": "uuid", 
        "name": "Omlet z warzywami"
      },
      "mealPlanItemId": "uuid",
      "ingredientsDeducted": true
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20, 
    "offset": 0
  }
}
```

#### POST /api/cooked-meals
**Description:** Mark recipe as cooked and update inventory
**Request Body:**
```json
{
  "recipeId": "uuid",
  "portionsCount": 2,
  "mealPlanItemId": "uuid"
}
```
**Response (201):**
```json
{
  "success": true,
  "cookedMeal": {
    "id": "uuid",
    "recipeId": "uuid",
    "portionsCount": 2,
    "cookedAt": "2024-12-05T18:30:00Z",
    "mealPlanItemId": "uuid"
  },
  "inventoryUpdates": [
    {
      "productId": "uuid",
      "productName": "jajka",
      "oldQuantity": 12.0,
      "newQuantity": 6.0,
      "deducted": 6.0,
      "unit": "szt"
    }
  ],
  "insufficientIngredients": []
}
```
**Errors:** 400 (validation), 404 (recipe not found), 422 (insufficient ingredients)

### 2.8 AI Recipe Cache

#### DELETE /api/ai-cache
**Description:** Clear user's AI recommendation cache
**Response (200):**
```json
{
  "success": true,
  "message": "AI cache cleared successfully"
}
```

## 3. Authentication and Authorization

### Authentication Mechanism
- **JWT (JSON Web Tokens)** for session management
- **Bearer token** authentication in Authorization header
- **Refresh tokens** for secure token renewal
- **Demo sessions** with limited-time JWT for demo users

### Implementation Details
- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Email verification required for full access
- Demo sessions expire after 24 hours
- Rate limiting: 1000 requests per hour per user
- AI endpoints limited to 50 requests per hour per user

### Authorization Levels
1. **Anonymous** - Can access demo mode only
2. **Registered Unverified** - Limited access until email verification
3. **Verified User** - Full access to personal data
4. **Demo User** - Access with predefined data, no persistence

### Security Headers
- All endpoints require HTTPS in production
- CORS configured for specific frontend domains
- Rate limiting headers included in responses
- Request validation and sanitization

## 4. Validation and Business Logic

### Validation Rules

#### User Products
- `name`: Required, 1-255 characters
- `quantity`: Required, >= 0, max 3 decimal places
- `unit`: Required, must be one of: 'g', 'l', 'szt'
- `categoryId`: Required, must exist in product_categories
- `expiresAt`: Optional, must be future date or today

#### Recipes
- `prepTimeMinutes`: Required, > 0, max 600 minutes
- `servings`: Required, > 0, max 20 servings
- `mealCategory`: Required, enum validation
- `proteinType`: Required, enum validation

#### User Preferences
- `maxMeatMealsPerWeek`: 0-7 range
- `minFishMealsPerWeek`: 0-7 range
- `maxFishMealsPerWeek`: >= minFishMealsPerWeek, max 7
- `sweetBreakfastRatio`: 0.0-1.0 range
- `dailyCalories`: 800-5000 range

#### Meal Plan Items
- `portions`: Required, > 0, max 10
- `mealType`: Required, enum validation
- `mealDate`: Required, within plan's week range

### Business Logic Implementation

#### AI Recipe Matching
1. **Cache Check**: Check existing recommendations by user_products_hash
2. **Cache Miss**: Generate new recommendations via AI service
3. **Match Scoring**: Calculate ingredient availability percentage
4. **Level Classification**: 
   - "idealny": 95-100% ingredients available
   - "prawie idealny": 80-94% ingredients available  
   - "wymaga dokupienia": <80% ingredients available
5. **Cache Storage**: Store results with 24-hour TTL

#### Inventory Management
1. **Automatic Deduction**: When marking recipe as cooked
2. **Quantity Validation**: Ensure sufficient ingredients available
3. **Scaling**: Adjust ingredient quantities based on portions cooked
4. **Partial Cooking**: Handle cases with insufficient quantities

#### Meal Plan Generation
1. **Preference Validation**: Check user dietary preferences
2. **Ingredient Prioritization**: Prioritize expiring ingredients
3. **Nutritional Balance**: Aim for target daily calories
4. **Variety Enforcement**: Avoid meal repetition
5. **Feasibility Check**: Ensure user can cook generated meals

#### Rate Limiting Strategy
- **General API**: 1000 requests/hour per user
- **AI Endpoints**: 50 requests/hour per user  
- **Authentication**: 10 attempts/hour per IP
- **Cache Optimization**: Encourage cache reuse for AI endpoints

### Error Handling Standards
- Consistent error response format across all endpoints
- Detailed validation error messages
- Proper HTTP status codes
- Request ID tracking for debugging
- Graceful degradation for AI service failures
