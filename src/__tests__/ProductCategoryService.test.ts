import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { ProductCategoryService } from "../services/ProductCategoryService";
import type { IProductCategoryRepository } from "../repositories/ProductCategoryRepository";
import { DatabaseError } from "../repositories/ProductCategoryRepository";
import type { ProductCategoryDTO, DatabaseTables } from "../types";

// Mock data
const mockDbRows: DatabaseTables["product_categories"]["Row"][] = [
  {
    id: 1,
    name: "nabiał",
    description: "Produkty mleczne i nabiałowe",
    created_at: "2024-12-05T10:00:00Z",
  },
  {
    id: 2,
    name: "mięso",
    description: "Mięso i produkty mięsne",
    created_at: "2024-12-05T10:00:00Z",
  },
  {
    id: 3,
    name: "warzywa",
    description: "Warzywa świeże i przetworzone",
    created_at: "2024-12-05T10:00:00Z",
  },
];

const expectedDTOs: ProductCategoryDTO[] = [
  { id: 1, name: "nabiał", description: "Produkty mleczne i nabiałowe" },
  { id: 2, name: "mięso", description: "Mięso i produkty mięsne" },
  { id: 3, name: "warzywa", description: "Warzywa świeże i przetworzone" },
];

// Mock repository
const mockRepository: IProductCategoryRepository = {
  findAll: vi.fn(),
};

describe("ProductCategoryService", () => {
  let service: ProductCategoryService;
  let repositoryMock: Mock;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    repositoryMock = mockRepository.findAll as Mock;

    // Create service with very short cache TTL for testing
    service = new ProductCategoryService(mockRepository, 100); // 100ms TTL
  });

  describe("getAllCategories", () => {
    it("should return transformed DTOs from repository", async () => {
      // Arrange
      repositoryMock.mockResolvedValue(mockDbRows);

      // Act
      const result = await service.getAllCategories();

      // Assert
      expect(result).toEqual(expectedDTOs);
      expect(repositoryMock).toHaveBeenCalledTimes(1);
    });

    it("should return fallback data when repository throws DatabaseError", async () => {
      // Arrange
      const dbError = new DatabaseError("Connection failed");
      repositoryMock.mockRejectedValue(dbError);

      // Act
      const result = await service.getAllCategories();

      // Assert
      expect(result).toEqual([
        { id: 1, name: "nabiał", description: "Produkty mleczne i nabiałowe" },
        { id: 2, name: "mięso", description: "Mięso i produkty mięsne" },
        { id: 3, name: "pieczywo", description: "Pieczywo i wypieki" },
        { id: 4, name: "warzywa", description: "Warzywa świeże i przetworzone" },
        { id: 5, name: "owoce", description: "Owoce świeże i suszone" },
      ]);
      expect(repositoryMock).toHaveBeenCalledTimes(1);
    });

    it("should return fallback data when repository throws generic error", async () => {
      // Arrange
      repositoryMock.mockRejectedValue(new Error("Network error"));

      // Act
      const result = await service.getAllCategories();

      // Assert
      expect(result).toHaveLength(5); // Fallback data length
      expect(repositoryMock).toHaveBeenCalledTimes(1);
    });

    it("should use cache on subsequent calls within TTL", async () => {
      // Arrange
      repositoryMock.mockResolvedValue(mockDbRows);

      // Act - First call
      const result1 = await service.getAllCategories();
      // Act - Second call immediately
      const result2 = await service.getAllCategories();

      // Assert
      expect(result1).toEqual(expectedDTOs);
      expect(result2).toEqual(expectedDTOs);
      expect(repositoryMock).toHaveBeenCalledTimes(1); // Only called once due to cache
    });

    it("should fetch fresh data after cache TTL expires", async () => {
      // Arrange
      repositoryMock.mockResolvedValue(mockDbRows);

      // Act - First call
      await service.getAllCategories();

      // Wait for cache to expire (110ms > 100ms TTL)
      await new Promise((resolve) => setTimeout(resolve, 110));

      // Act - Second call after TTL
      await service.getAllCategories();

      // Assert
      expect(repositoryMock).toHaveBeenCalledTimes(2); // Called twice due to cache expiry
    });

    it("should handle empty database results", async () => {
      // Arrange
      repositoryMock.mockResolvedValue([]);

      // Act
      const result = await service.getAllCategories();

      // Assert
      expect(result).toEqual([]);
      expect(repositoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("cache management", () => {
    it("should return correct cache stats when cache is empty", () => {
      // Act
      const stats = service.getCacheStats();

      // Assert
      expect(stats).toEqual({
        hasData: false,
        age: 0,
        ttl: 100,
        isValid: false,
        itemCount: 0,
      });
    });

    it("should return correct cache stats when cache has data", async () => {
      // Arrange
      repositoryMock.mockResolvedValue(mockDbRows);
      await service.getAllCategories();

      // Act
      const stats = service.getCacheStats();

      // Assert
      expect(stats.hasData).toBe(true);
      expect(stats.ttl).toBe(100);
      expect(stats.isValid).toBe(true);
      expect(stats.itemCount).toBe(3);
      expect(stats.age).toBeGreaterThanOrEqual(0);
    });

    it("should clear cache manually", async () => {
      // Arrange
      repositoryMock.mockResolvedValue(mockDbRows);
      await service.getAllCategories();

      // Act
      service.clearCache();
      const stats = service.getCacheStats();

      // Assert
      expect(stats.hasData).toBe(false);
      expect(stats.isValid).toBe(false);
      expect(stats.itemCount).toBe(0);
    });

    it("should fetch fresh data after manual cache clear", async () => {
      // Arrange
      repositoryMock.mockResolvedValue(mockDbRows);

      // Act
      await service.getAllCategories(); // First call
      service.clearCache();
      await service.getAllCategories(); // Second call after clear

      // Assert
      expect(repositoryMock).toHaveBeenCalledTimes(2); // Called twice due to cache clear
    });
  });

  describe("data transformation", () => {
    it("should correctly map database rows to DTOs", async () => {
      // Arrange
      const dbRowWithExtraFields = {
        ...mockDbRows[0],
        created_at: "2024-12-05T10:00:00Z",
        extra_field: "should be ignored",
      };
      repositoryMock.mockResolvedValue([dbRowWithExtraFields]);

      // Act
      const result = await service.getAllCategories();

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          name: "nabiał",
          description: "Produkty mleczne i nabiałowe",
        },
      ]);
      // Verify extra fields are not included
      expect(result[0]).not.toHaveProperty("created_at");
      expect(result[0]).not.toHaveProperty("extra_field");
    });

    it("should handle null description field", async () => {
      // Arrange
      const dbRowWithNullDescription = {
        ...mockDbRows[0],
        description: null,
      };
      repositoryMock.mockResolvedValue([dbRowWithNullDescription]);

      // Act
      const result = await service.getAllCategories();

      // Assert
      expect(result[0].description).toBeNull();
    });
  });
});
