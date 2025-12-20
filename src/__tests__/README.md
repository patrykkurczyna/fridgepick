# Test Suite Documentation

This directory contains unit tests for the FridgePick application, built with **Vitest** and **React Testing Library**.

## 📁 Test Structure

```
src/__tests__/
├── README.md                           # This file
├── setup.ts                            # Global test configuration
├── ProductCategoryService.test.ts      # ✅ Product category service tests
├── UserProductService.test.ts          # ✅ User product service tests (NEW)
├── utils.test.ts                       # ✅ Utility functions tests (NEW)
└── userProducts.validation.test.ts     # ✅ Validation layer tests (NEW)
```

## 🚀 Running Tests

### All Tests
```bash
npm run test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

### UI Mode (Visual Test Explorer)
```bash
npm run test:ui
```

### Run Specific Test File
```bash
npm run test UserProductService
```

### Run Tests Matching Pattern
```bash
npm run test -t "should compute isExpired"
```

## 📊 Coverage Goals

| Layer                          | Target | Current |
|--------------------------------|--------|---------|
| Services (Business Logic)      | ≥80%   | 🎯      |
| Validation Layer               | ≥80%   | 🎯      |
| Repositories (Transformations) | ≥70%   | 📈      |
| Utility Functions              | ≥80%   | 🎯      |
| Components (Logic Heavy)       | ≥60%   | 📈      |

## 🧪 Test Files Overview

### ✅ UserProductService.test.ts (200+ assertions)
**Priority: CRITICAL**

Tests the core business logic for user products:
- `getUserProducts()` - Fetching with filters, pagination, sorting
- `createProduct()` - Product creation with validation
- `updateProduct()` - Product updates
- `deleteProduct()` - Product deletion
- **Computed fields logic** - `isExpired`, `daysUntilExpiry`, `expiryStatus`
- **Edge cases** - Empty lists, null values, repository errors

**Key Test Cases:**
- ✓ Computes expiry status correctly (fresh/expiring_soon/expired/no_expiry)
- ✓ Handles search filtering with debounce
- ✓ Paginates results with hasNext/hasPrevious
- ✓ Sorts by multiple fields (name, expiry_date, created_at)
- ✓ Validates business rules (no past expiry dates)

### ✅ userProducts.validation.test.ts (80+ assertions)
**Priority: CRITICAL (Security)**

Tests input validation and sanitization:
- Product creation validation
- Query parameter validation
- UUID format validation
- **Security** - SQL injection prevention, XSS prevention
- **Edge cases** - Null, undefined, malformed data

**Key Test Cases:**
- ✓ Rejects empty/invalid product names
- ✓ Validates quantity ranges and decimal places
- ✓ Enforces allowed units (g, l, szt)
- ✓ Prevents past expiry dates
- ✓ Strict mode rejects additional properties
- ✓ Sanitizes search queries
- ✓ Validates pagination limits

### ✅ utils.test.ts (15+ assertions)
**Priority: HIGH (Quick Win)**

Tests utility functions:
- `cn()` - Tailwind class merging with clsx + twMerge
- Conditional classes
- Class deduplication
- Responsive and state variants

**Key Test Cases:**
- ✓ Merges multiple classes correctly
- ✓ Handles conditional classes (true/false)
- ✓ Resolves Tailwind conflicts (last class wins)
- ✓ Supports objects and arrays
- ✓ Filters null/undefined gracefully

### ✅ ProductCategoryService.test.ts (EXISTING)
Tests product category service with caching:
- Cache TTL logic
- Fallback to default categories
- Cache hit/miss scenarios

## 🎯 Testing Best Practices (Vitest)

### 1. Arrange-Act-Assert Pattern
```typescript
it("should compute isExpired correctly", () => {
  // Arrange
  const expiredProduct = { expiry_date: "2024-01-01" };

  // Act
  const result = service.transformToDTO(expiredProduct);

  // Assert
  expect(result.isExpired).toBe(true);
});
```

### 2. Descriptive Test Names
```typescript
// ✅ Good
it("should reject negative quantity")
it("should return null for products without expiry date")

// ❌ Bad
it("test1")
it("works")
```

### 3. Use Type-Safe Mocks
```typescript
// Create typed mock
const mockRepository: IUserProductRepository = {
  findByUserId: vi.fn(),
  countByUserId: vi.fn(),
  // ... other methods
};

// Type-safe mock assignment
const findMock = mockRepository.findByUserId as Mock;
findMock.mockResolvedValue([...]);
```

### 4. Test Edge Cases
```typescript
it("should handle empty product list")
it("should handle null expiry date")
it("should throw error for invalid user ID")
it("should handle repository errors gracefully")
```

### 5. Group Related Tests
```typescript
describe("UserProductService", () => {
  describe("getUserProducts", () => {
    describe("with search filter", () => {
      it("should filter by search query")
      it("should trim search query")
    });
  });
});
```

## 🔧 Vitest Configuration Highlights

- **Environment:** jsdom (for React component testing)
- **Globals:** Enabled (`describe`, `it`, `expect` available globally)
- **Coverage Provider:** v8 (fast native coverage)
- **Setup Files:** `setup.ts` (global mocks and config)
- **Reporters:** verbose + HTML
- **Thresholds:** 80% for critical code paths

## 🐛 Debugging Tests

### Run Single Test with Logs
```bash
npm run test UserProductService -- --reporter=verbose
```

### Debug with Breakpoints
```bash
npm run test:debug
```
Then open `chrome://inspect` in Chrome.

### View Test Results in Browser
```bash
npm run test:ui
```

## 📝 Writing New Tests

### 1. Create Test File
```bash
touch src/__tests__/MyService.test.ts
```

### 2. Basic Template
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MyService } from "../services/MyService";

describe("MyService", () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  describe("myMethod", () => {
    it("should do something", () => {
      // Arrange
      const input = "test";

      // Act
      const result = service.myMethod(input);

      // Assert
      expect(result).toBe("expected");
    });
  });
});
```

### 3. Mock Dependencies
```typescript
// Mock at top of file (before imports)
vi.mock("../repositories/MyRepository", () => ({
  MyRepository: vi.fn(() => ({
    getData: vi.fn(),
  })),
}));
```

## 🎓 Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [FridgePick Test Plan](.ai/test-plan.mdc)

## 🤝 Contributing

When adding new features:
1. Write tests **before** or **alongside** implementation
2. Aim for **≥80% coverage** for business logic
3. Include **edge cases** and **error scenarios**
4. Follow **Arrange-Act-Assert** pattern
5. Use **descriptive test names**

## ✅ Checklist Before Committing

- [ ] All tests pass: `npm run test`
- [ ] Coverage thresholds met: `npm run test:coverage`
- [ ] No linting errors: `npm run lint`
- [ ] Tests follow project conventions
- [ ] Edge cases covered
- [ ] Mock cleanup in `afterEach`

---

**Last Updated:** 2025-12-20
**Test Framework:** Vitest v2.0+
**Total Test Files:** 4
**Total Assertions:** 300+
