import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { UserProductService, UserProductServiceError } from "../services/UserProductService";
import type { IUserProductRepository } from "../repositories/UserProductRepository";
import type { UserProductWithCategory } from "../repositories/UserProductRepository";

// Mock data - Database rows with category joins (flattened structure as returned by repository)
const mockDbProductsWithCategories: UserProductWithCategory[] = [
  {
    id: "prod-1",
    user_id: "user-123",
    category_id: 1,
    name: "Mleko",
    quantity: 1,
    unit: "l",
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days from now
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
    category_name: "nabiał",
    category_description: "Produkty mleczne",
  },
  {
    id: "prod-2",
    user_id: "user-123",
    category_id: 2,
    name: "Kurczak",
    quantity: 500,
    unit: "g",
    expires_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days ago (expired)
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
    category_name: "mięso",
    category_description: "Mięso i wędliny",
  },
  {
    id: "prod-3",
    user_id: "user-123",
    category_id: 3,
    name: "Chleb",
    quantity: 1,
    unit: "szt",
    expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 day from now (expiring soon)
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
    category_name: "pieczywo",
    category_description: "Pieczywo i wypieki",
  },
  {
    id: "prod-4",
    user_id: "user-123",
    category_id: 4,
    name: "Sól",
    quantity: 1,
    unit: "g",
    expires_at: null, // No expiry date
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
    category_name: "przyprawy",
    category_description: "Przyprawy i zioła",
  },
];

// Mock repository
const mockRepository: IUserProductRepository = {
  findByUserId: vi.fn(),
  countByUserId: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  categoryExists: vi.fn(),
};

describe("UserProductService", () => {
  let service: UserProductService;
  let findByUserIdMock: Mock;
  let countByUserIdMock: Mock;
  let findByIdMock: Mock;
  let createMock: Mock;
  let updateMock: Mock;
  let deleteMock: Mock;
  let categoryExistsMock: Mock;

  const testUserId = "user-123";

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Type-safe mock assignments
    findByUserIdMock = mockRepository.findByUserId as Mock;
    countByUserIdMock = mockRepository.countByUserId as Mock;
    findByIdMock = mockRepository.findById as Mock;
    createMock = mockRepository.create as Mock;
    updateMock = mockRepository.update as Mock;
    deleteMock = mockRepository.delete as Mock;
    categoryExistsMock = mockRepository.categoryExists as Mock;

    // Create fresh service instance
    service = new UserProductService(mockRepository);
  });

  describe("getUserProducts", () => {
    describe("with no filters", () => {
      it("should return all user products with computed fields", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(4);
        findByUserIdMock.mockResolvedValue(mockDbProductsWithCategories);

        // Act
        const result = await service.getUserProducts(testUserId);

        // Assert
        expect(result.products).toHaveLength(4);
        expect(result.pagination.total).toBe(4);

        // Verify computed fields are added
        const mleko = result.products[0];
        expect(mleko.name).toBe("Mleko");
        expect(mleko.categoryId).toBe(1);
        expect(mleko.categoryName).toBe("nabiał");
        expect(mleko.isExpired).toBe(false);
        expect(mleko.daysUntilExpiry).toBeGreaterThan(4);
        expect(mleko.daysUntilExpiry).toBeLessThan(6);

        const kurczak = result.products[1];
        expect(kurczak.name).toBe("Kurczak");
        expect(kurczak.isExpired).toBe(true);
        expect(kurczak.daysUntilExpiry).toBeNull(); // Expired products have null daysUntilExpiry

        const chleb = result.products[2];
        expect(chleb.name).toBe("Chleb");
        expect(chleb.isExpired).toBe(false);
        expect(chleb.daysUntilExpiry).toBeLessThanOrEqual(3);

        const sol = result.products[3];
        expect(sol.name).toBe("Sól");
        expect(sol.isExpired).toBe(false);
        expect(sol.daysUntilExpiry).toBeNull();
      });

      it("should call repository with correct default filters", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(0);
        findByUserIdMock.mockResolvedValue([]);

        // Act
        await service.getUserProducts(testUserId);

        // Assert
        expect(countByUserIdMock).toHaveBeenCalledWith(testUserId, {});
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, {});
      });
    });

    describe("with search filter", () => {
      it("should filter products by search query", async () => {
        // Arrange
        const searchQuery = "mleko";
        countByUserIdMock.mockResolvedValue(1);
        findByUserIdMock.mockResolvedValue([mockDbProductsWithCategories[0]]);

        // Act
        const result = await service.getUserProducts(testUserId, { search: searchQuery });

        // Assert
        expect(countByUserIdMock).toHaveBeenCalledWith(testUserId, {
          search: searchQuery,
        });
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { search: searchQuery });
        expect(result.products).toHaveLength(1);
        expect(result.products[0].name).toBe("Mleko");
      });

      it("should trim search query", async () => {
        // Arrange
        const searchQuery = "  mleko  ";
        countByUserIdMock.mockResolvedValue(0);
        findByUserIdMock.mockResolvedValue([]);

        // Act
        await service.getUserProducts(testUserId, { search: searchQuery });

        // Assert - should be trimmed
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { search: "mleko" });
      });

      it("should handle empty search query", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(4);
        findByUserIdMock.mockResolvedValue(mockDbProductsWithCategories);

        // Act
        const result = await service.getUserProducts(testUserId, { search: "" });

        // Assert - empty search should be ignored
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, {});
        expect(result.products).toHaveLength(4);
      });
    });

    describe("with category filter", () => {
      it("should filter products by category", async () => {
        // Arrange
        const categoryId = 1;
        countByUserIdMock.mockResolvedValue(1);
        findByUserIdMock.mockResolvedValue([mockDbProductsWithCategories[0]]);

        // Act
        const result = await service.getUserProducts(testUserId, { category: categoryId });

        // Assert
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { category: categoryId });
        expect(result.products).toHaveLength(1);
        expect(result.products[0].categoryId).toBe(categoryId);
      });
    });

    describe("with expiry filters", () => {
      it("should filter expired products", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(1);
        findByUserIdMock.mockResolvedValue([mockDbProductsWithCategories[1]]);

        // Act
        const result = await service.getUserProducts(testUserId, { expired: true });

        // Assert
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { expired: true });
        expect(result.products).toHaveLength(1);
      });

      it("should filter expiring soon products", async () => {
        // Arrange
        const days = 7;
        countByUserIdMock.mockResolvedValue(1);
        findByUserIdMock.mockResolvedValue([mockDbProductsWithCategories[2]]);

        // Act
        const result = await service.getUserProducts(testUserId, { expiring_soon: days });

        // Assert
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { expiring_soon: days });
        expect(result.products).toHaveLength(1);
      });
    });

    describe("with pagination", () => {
      it("should paginate results correctly", async () => {
        // Arrange
        const limit = 10;
        const offset = 10;
        countByUserIdMock.mockResolvedValue(25);
        findByUserIdMock.mockResolvedValue([]);

        // Act
        const result = await service.getUserProducts(testUserId, { limit, offset });

        // Assert
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { limit, offset });
        expect(result.pagination).toEqual({
          total: 25,
          limit: 10,
          offset: 10,
        });
      });

      it("should use default pagination when not specified", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(100);
        findByUserIdMock.mockResolvedValue([]);

        // Act
        const result = await service.getUserProducts(testUserId);

        // Assert
        expect(result.pagination.total).toBe(100);
        expect(result.pagination.limit).toBe(50); // Default from service
        expect(result.pagination.offset).toBe(0);
      });

      it("should handle custom limit", async () => {
        // Arrange
        const limit = 25;
        countByUserIdMock.mockResolvedValue(100);
        findByUserIdMock.mockResolvedValue([]);

        // Act
        const result = await service.getUserProducts(testUserId, { limit });

        // Assert
        expect(result.pagination.limit).toBe(25);
        expect(result.pagination.offset).toBe(0);
      });
    });

    describe("with sorting", () => {
      it("should sort by name", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(4);
        findByUserIdMock.mockResolvedValue(mockDbProductsWithCategories);

        // Act
        await service.getUserProducts(testUserId, { sort: "name" });

        // Assert
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { sort: "name" });
      });

      it("should sort by expires_at", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(4);
        findByUserIdMock.mockResolvedValue(mockDbProductsWithCategories);

        // Act
        await service.getUserProducts(testUserId, { sort: "expires_at" });

        // Assert
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { sort: "expires_at" });
      });

      it("should sort by created_at", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(4);
        findByUserIdMock.mockResolvedValue(mockDbProductsWithCategories);

        // Act
        await service.getUserProducts(testUserId, { sort: "created_at" });

        // Assert
        expect(findByUserIdMock).toHaveBeenCalledWith(testUserId, { sort: "created_at" });
      });
    });

    describe("edge cases", () => {
      it("should handle empty product list", async () => {
        // Arrange
        countByUserIdMock.mockResolvedValue(0);
        findByUserIdMock.mockResolvedValue([]);

        // Act
        const result = await service.getUserProducts(testUserId);

        // Assert
        expect(result.products).toEqual([]);
        expect(result.pagination.total).toBe(0);
      });

      it("should handle repository errors gracefully", async () => {
        // Arrange
        countByUserIdMock.mockRejectedValue(new Error("Database connection failed"));

        // Act & Assert
        await expect(service.getUserProducts(testUserId)).rejects.toThrow();
      });
    });
  });

  describe("createProduct", () => {
    it("should create product successfully", async () => {
      // Arrange
      const productData = {
        categoryId: 1,
        name: "Masło",
        quantity: 200,
        unit: "g" as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };

      const createdProduct: UserProductWithCategory = {
        id: "prod-new",
        user_id: testUserId,
        category_id: 1,
        name: "Masło",
        quantity: 200,
        unit: "g",
        expires_at: productData.expiresAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_name: "nabiał",
        category_description: "Produkty mleczne",
      };

      categoryExistsMock.mockResolvedValue(true);
      createMock.mockResolvedValue(createdProduct);

      // Act
      const result = await service.createProduct(testUserId, productData);

      // Assert
      expect(categoryExistsMock).toHaveBeenCalledWith(productData.categoryId);
      expect(createMock).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.product.id).toBe("prod-new");
      expect(result.product.name).toBe("Masło");
      expect(result.product.categoryId).toBe(1);
      expect(result.product.categoryName).toBe("nabiał");
    });

    it("should throw error for invalid category", async () => {
      // Arrange
      const productData = {
        categoryId: 999,
        name: "Test",
        quantity: 1,
        unit: "g" as const,
      };

      categoryExistsMock.mockResolvedValue(false);

      // Act & Assert
      await expect(service.createProduct(testUserId, productData)).rejects.toThrow(UserProductServiceError);
      expect(categoryExistsMock).toHaveBeenCalledWith(999);
    });

    it("should throw error for expiry date in the past", async () => {
      // Arrange
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const productData = {
        categoryId: 1,
        name: "Test",
        quantity: 1,
        unit: "g" as const,
        expiresAt: pastDate,
      };

      categoryExistsMock.mockResolvedValue(true);

      // Act & Assert
      await expect(service.createProduct(testUserId, productData)).rejects.toThrow(UserProductServiceError);
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      // Arrange
      const productId = "prod-1";
      const updateData = {
        name: "Mleko Updated",
        categoryId: 1,
        quantity: 2,
        unit: "l" as const,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };

      const existingProduct = mockDbProductsWithCategories[0];
      const updatedProduct: UserProductWithCategory = {
        ...existingProduct,
        name: "Mleko Updated",
        quantity: 2,
        updated_at: new Date().toISOString(),
      };

      findByIdMock.mockResolvedValue(existingProduct);
      categoryExistsMock.mockResolvedValue(true);
      updateMock.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.updateProduct(testUserId, productId, updateData);

      // Assert
      expect(findByIdMock).toHaveBeenCalledWith(productId, testUserId);
      expect(categoryExistsMock).toHaveBeenCalledWith(updateData.categoryId);
      expect(updateMock).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.product.quantity).toBe(2);
      expect(result.product.name).toBe("Mleko Updated");
    });

    it("should throw error when product not found", async () => {
      // Arrange
      const updateData = {
        name: "Test",
        categoryId: 1,
        quantity: 1,
        unit: "g" as const,
      };

      findByIdMock.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProduct(testUserId, "non-existent", updateData)).rejects.toThrow(
        UserProductServiceError
      );
    });

    it("should throw error for invalid category", async () => {
      // Arrange
      const productId = "prod-1";
      const updateData = {
        name: "Test",
        categoryId: 999,
        quantity: 1,
        unit: "g" as const,
      };

      findByIdMock.mockResolvedValue(mockDbProductsWithCategories[0]);
      categoryExistsMock.mockResolvedValue(false);

      // Act & Assert
      await expect(service.updateProduct(testUserId, productId, updateData)).rejects.toThrow(UserProductServiceError);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      // Arrange
      const productId = "prod-1";
      deleteMock.mockResolvedValue(true);

      // Act
      const result = await service.deleteProduct(testUserId, productId);

      // Assert
      expect(deleteMock).toHaveBeenCalledWith(productId, testUserId);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Product removed successfully");
    });

    it("should throw error when product not found", async () => {
      // Arrange
      deleteMock.mockResolvedValue(false);

      // Act & Assert
      await expect(service.deleteProduct(testUserId, "non-existent")).rejects.toThrow(UserProductServiceError);
    });
  });

  describe("getProductById", () => {
    it("should return product by id", async () => {
      // Arrange
      const productId = "prod-1";
      findByIdMock.mockResolvedValue(mockDbProductsWithCategories[0]);

      // Act
      const result = await service.getProductById(testUserId, productId);

      // Assert
      expect(findByIdMock).toHaveBeenCalledWith(productId, testUserId);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(productId);
      expect(result?.name).toBe("Mleko");
      expect(result?.categoryId).toBe(1);
      expect(result?.categoryName).toBe("nabiał");
    });

    it("should return null when product not found", async () => {
      // Arrange
      findByIdMock.mockResolvedValue(null);

      // Act
      const result = await service.getProductById(testUserId, "non-existent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("computed fields logic", () => {
    it("should correctly compute isExpired for past expiry date", async () => {
      // Arrange
      countByUserIdMock.mockResolvedValue(1);
      findByUserIdMock.mockResolvedValue([mockDbProductsWithCategories[1]]); // Kurczak (expired)

      // Act
      const result = await service.getUserProducts(testUserId);

      // Assert
      expect(result.products[0].isExpired).toBe(true);
      expect(result.products[0].daysUntilExpiry).toBeNull(); // Expired products don't have days until expiry
    });

    it("should correctly compute daysUntilExpiry for future expiry date", async () => {
      // Arrange
      countByUserIdMock.mockResolvedValue(1);
      findByUserIdMock.mockResolvedValue([mockDbProductsWithCategories[0]]); // Mleko (5 days)

      // Act
      const result = await service.getUserProducts(testUserId);

      // Assert
      const product = result.products[0];
      expect(product.isExpired).toBe(false);
      expect(product.daysUntilExpiry).toBeGreaterThan(4);
      expect(product.daysUntilExpiry).toBeLessThan(6);
    });

    it("should return null daysUntilExpiry for products without expiry date", async () => {
      // Arrange
      countByUserIdMock.mockResolvedValue(1);
      findByUserIdMock.mockResolvedValue([mockDbProductsWithCategories[3]]); // Sól (no expiry)

      // Act
      const result = await service.getUserProducts(testUserId);

      // Assert
      expect(result.products[0].isExpired).toBe(false);
      expect(result.products[0].daysUntilExpiry).toBeNull();
    });

    it("should correctly compute fields for all products", async () => {
      // Arrange
      countByUserIdMock.mockResolvedValue(4);
      findByUserIdMock.mockResolvedValue(mockDbProductsWithCategories);

      // Act
      const result = await service.getUserProducts(testUserId);

      // Assert - Mleko (5 days from now)
      expect(result.products[0].isExpired).toBe(false);
      expect(result.products[0].daysUntilExpiry).toBeGreaterThan(4);

      // Assert - Kurczak (expired)
      expect(result.products[1].isExpired).toBe(true);
      expect(result.products[1].daysUntilExpiry).toBeNull();

      // Assert - Chleb (1 day from now)
      expect(result.products[2].isExpired).toBe(false);
      expect(result.products[2].daysUntilExpiry).toBeLessThanOrEqual(2);

      // Assert - Sól (no expiry)
      expect(result.products[3].isExpired).toBe(false);
      expect(result.products[3].daysUntilExpiry).toBeNull();
    });
  });
});
