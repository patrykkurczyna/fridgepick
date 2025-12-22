import { describe, it, expect } from "vitest";
import {
  validateCreateUserProduct,
  validateUserProductsQuery,
  validateProductId,
  formatValidationErrors,
} from "../validation/userProducts";

describe("userProducts validation", () => {
  describe("validateCreateUserProduct", () => {
    describe("valid data", () => {
      it("should accept valid product data with all fields", () => {
        // Arrange
        const validData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1.5,
          unit: "l",
          expiresAt: "2025-12-31",
        };

        // Act
        const result = validateCreateUserProduct(validData);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Mleko");
          expect(result.data.categoryId).toBe(1);
          expect(result.data.quantity).toBe(1.5);
          expect(result.data.unit).toBe("l");
          expect(result.data.expiresAt).toBe("2025-12-31");
        }
      });

      it("should accept valid product without expiry date", () => {
        // Arrange
        const validData = {
          name: "Sól",
          categoryId: 5,
          quantity: 1,
          unit: "szt",
        };

        // Act
        const result = validateCreateUserProduct(validData);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.expiresAt).toBeUndefined();
        }
      });

      it("should trim product name whitespace", () => {
        // Arrange
        const dataWithSpaces = {
          name: "  Masło  ",
          categoryId: 1,
          quantity: 200,
          unit: "g",
        };

        // Act
        const result = validateCreateUserProduct(dataWithSpaces);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Masło");
        }
      });

      it("should accept quantity with decimal places (max 3)", () => {
        // Arrange
        const validData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1.125,
          unit: "l",
        };

        // Act
        const result = validateCreateUserProduct(validData);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should accept zero quantity", () => {
        // Arrange
        const validData = {
          name: "Empty Container",
          categoryId: 1,
          quantity: 0,
          unit: "szt",
        };

        // Act
        const result = validateCreateUserProduct(validData);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("invalid product name", () => {
      it("should reject empty product name", () => {
        // Arrange
        const invalidData = {
          name: "",
          categoryId: 1,
          quantity: 1,
          unit: "szt",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors).toHaveLength(1);
          expect(result.errors[0].field).toBe("name");
          expect(result.errors[0].message).toContain("required");
        }
      });

      it("should reject product name exceeding 255 characters", () => {
        // Arrange
        const invalidData = {
          name: "a".repeat(256),
          categoryId: 1,
          quantity: 1,
          unit: "szt",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("name");
          expect(result.errors[0].message).toContain("255 characters");
        }
      });

      it("should accept product name with exactly 255 characters", () => {
        // Arrange
        const validData = {
          name: "a".repeat(255),
          categoryId: 1,
          quantity: 1,
          unit: "szt",
        };

        // Act
        const result = validateCreateUserProduct(validData);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("invalid category", () => {
      it("should reject non-integer category ID", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: 1.5,
          quantity: 1,
          unit: "l",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("categoryId");
          expect(result.errors[0].message).toContain("integer");
        }
      });

      it("should reject zero category ID", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: 0,
          quantity: 1,
          unit: "l",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("categoryId");
          expect(result.errors[0].message).toContain("positive");
        }
      });

      it("should reject negative category ID", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: -1,
          quantity: 1,
          unit: "l",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("categoryId");
        }
      });
    });

    describe("invalid quantity", () => {
      it("should reject negative quantity", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: 1,
          quantity: -1,
          unit: "l",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("quantity");
          expect(result.errors[0].message).toContain("negative");
        }
      });

      it("should reject quantity exceeding 999,999", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1000000,
          unit: "l",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("quantity");
          expect(result.errors[0].message).toContain("999,999");
        }
      });

      it("should reject quantity with more than 3 decimal places", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1.1234,
          unit: "l",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("quantity");
          expect(result.errors[0].message).toContain("3 decimal places");
        }
      });
    });

    describe("invalid unit", () => {
      it("should reject invalid unit", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1,
          unit: "invalid",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("unit");
          expect(result.errors[0].message).toContain("g, l, szt");
        }
      });

      it("should accept all valid units", () => {
        // Arrange
        const validUnits = ["g", "l", "szt"];

        // Act & Assert
        validUnits.forEach((unit) => {
          const result = validateCreateUserProduct({
            name: "Test",
            categoryId: 1,
            quantity: 1,
            unit,
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe("invalid expiry date", () => {
      it("should reject invalid date format", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1,
          unit: "l",
          expiresAt: "2025/12/31", // Wrong format
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("expiresAt");
          expect(result.errors[0].message).toContain("YYYY-MM-DD");
        }
      });

      it("should reject invalid date values", () => {
        // Arrange
        const invalidData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1,
          unit: "l",
          expiresAt: "2025-13-32", // Invalid month and day
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
      });

      it("should reject past expiry dates", () => {
        // Arrange
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const invalidData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1,
          unit: "l",
          expiresAt: yesterdayStr,
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("expiresAt");
          expect(result.errors[0].message).toContain("today or in the future");
        }
      });

      it("should accept today as expiry date", () => {
        // Arrange
        const today = new Date().toISOString().split("T")[0];

        const validData = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1,
          unit: "l",
          expiresAt: today,
        };

        // Act
        const result = validateCreateUserProduct(validData);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("security - additional properties", () => {
      it("should reject data with additional properties (strict mode)", () => {
        // Arrange
        const dataWithExtra = {
          name: "Mleko",
          categoryId: 1,
          quantity: 1,
          unit: "l",
          hackAttempt: "malicious data",
        };

        // Act
        const result = validateCreateUserProduct(dataWithExtra);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].message).toContain("Unrecognized key");
        }
      });
    });

    describe("missing required fields", () => {
      it("should reject data missing name field", () => {
        // Arrange
        const invalidData = {
          categoryId: 1,
          quantity: 1,
          unit: "l",
        };

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("name");
        }
      });

      it("should reject data missing all required fields", () => {
        // Arrange
        const invalidData = {};

        // Act
        const result = validateCreateUserProduct(invalidData);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("validateUserProductsQuery", () => {
    describe("valid query parameters", () => {
      it("should accept valid search query", () => {
        // Arrange
        const validQuery = {
          search: "mleko",
        };

        // Act
        const result = validateUserProductsQuery(validQuery);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.search).toBe("mleko");
        }
      });

      it("should trim search query", () => {
        // Arrange
        const queryWithSpaces = {
          search: "  mleko  ",
        };

        // Act
        const result = validateUserProductsQuery(queryWithSpaces);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.search).toBe("mleko");
        }
      });

      it("should accept valid category filter", () => {
        // Arrange
        const validQuery = {
          category: "1",
        };

        // Act
        const result = validateUserProductsQuery(validQuery);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.category).toBe(1);
        }
      });

      it("should accept valid expired filter", () => {
        // Arrange
        const validQuery = {
          expired: "true",
        };

        // Act
        const result = validateUserProductsQuery(validQuery);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.expired).toBe(true);
        }
      });

      it("should accept valid pagination parameters", () => {
        // Arrange
        const validQuery = {
          limit: "20",
          offset: "40",
        };

        // Act
        const result = validateUserProductsQuery(validQuery);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(20);
          expect(result.data.offset).toBe(40);
        }
      });

      it("should accept valid sort parameter", () => {
        // Arrange
        const validQuery = {
          sort: "name",
        };

        // Act
        const result = validateUserProductsQuery(validQuery);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.sort).toBe("name");
        }
      });
    });

    describe("invalid search query", () => {
      it("should reject search query shorter than 2 characters", () => {
        // Arrange
        const invalidQuery = {
          search: "a",
        };

        // Act
        const result = validateUserProductsQuery(invalidQuery);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("search");
          expect(result.errors[0].message).toContain("at least 2 characters");
        }
      });

      it("should reject search query exceeding 100 characters", () => {
        // Arrange
        const invalidQuery = {
          search: "a".repeat(101),
        };

        // Act
        const result = validateUserProductsQuery(invalidQuery);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("search");
          expect(result.errors[0].message).toContain("at most 100 characters");
        }
      });
    });

    describe("invalid pagination", () => {
      it("should reject limit exceeding 100", () => {
        // Arrange
        const invalidQuery = {
          limit: "101",
        };

        // Act
        const result = validateUserProductsQuery(invalidQuery);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("limit");
          expect(result.errors[0].message).toContain("between 1 and 100");
        }
      });

      it("should reject negative offset", () => {
        // Arrange
        const invalidQuery = {
          offset: "-1",
        };

        // Act
        const result = validateUserProductsQuery(invalidQuery);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("offset");
          expect(result.errors[0].message).toContain("non-negative");
        }
      });

      it("should reject zero limit", () => {
        // Arrange
        const invalidQuery = {
          limit: "0",
        };

        // Act
        const result = validateUserProductsQuery(invalidQuery);

        // Assert
        expect(result.success).toBe(false);
      });
    });

    describe("invalid sort", () => {
      it("should reject invalid sort field", () => {
        // Arrange
        const invalidQuery = {
          sort: "invalid_field",
        };

        // Act
        const result = validateUserProductsQuery(invalidQuery);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors[0].field).toBe("sort");
          expect(result.errors[0].message).toContain("name, expires_at, created_at");
        }
      });
    });

    describe("SQL injection prevention", () => {
      it("should sanitize search query with SQL injection attempt", () => {
        // Arrange
        const maliciousQuery = {
          search: "'; DROP TABLE users; --",
        };

        // Act
        const result = validateUserProductsQuery(maliciousQuery);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          // Should accept but trim - actual SQL injection protection is in repository layer
          expect(result.data.search).toBe("'; DROP TABLE users; --");
        }
      });
    });
  });

  describe("validateProductId", () => {
    it("should accept valid UUID", () => {
      // Arrange
      const validId = {
        id: "550e8400-e29b-41d4-a716-446655440000",
      };

      // Act
      const result = validateProductId(validId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("550e8400-e29b-41d4-a716-446655440000");
      }
    });

    it("should reject invalid UUID format", () => {
      // Arrange
      const invalidId = {
        id: "not-a-uuid",
      };

      // Act
      const result = validateProductId(invalidId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].field).toBe("id");
        expect(result.errors[0].message).toContain("valid UUID");
      }
    });

    it("should reject numeric ID", () => {
      // Arrange
      const invalidId = {
        id: "12345",
      };

      // Act
      const result = validateProductId(invalidId);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("formatValidationErrors", () => {
    it("should format multiple validation errors correctly", () => {
      // Arrange
      const errors = [
        { field: "name", message: "Name is required" },
        { field: "quantity", message: "Quantity must be positive" },
      ];

      // Act
      const formatted = formatValidationErrors(errors);

      // Assert
      expect(formatted).toHaveProperty("name");
      expect(formatted).toHaveProperty("quantity");
      expect(formatted.name).toBe("Name is required");
      expect(formatted.quantity).toBe("Quantity must be positive");
    });

    it("should handle empty errors array", () => {
      // Arrange
      const errors: never[] = [];

      // Act
      const formatted = formatValidationErrors(errors);

      // Assert
      expect(formatted).toEqual({});
    });
  });

  describe("edge cases and type safety", () => {
    it("should handle null input gracefully", () => {
      // Arrange & Act
      const result = validateCreateUserProduct(null);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should handle undefined input gracefully", () => {
      // Arrange & Act
      const result = validateCreateUserProduct(undefined);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should handle array input gracefully", () => {
      // Arrange & Act
      const result = validateCreateUserProduct([]);

      // Assert
      expect(result.success).toBe(false);
    });

    it("should handle primitive input gracefully", () => {
      // Arrange & Act
      const result = validateCreateUserProduct("string");

      // Assert
      expect(result.success).toBe(false);
    });
  });
});
