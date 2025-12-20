import type { ProductCategoryDTO, DatabaseTables } from "../types";
import type { IProductCategoryRepository } from "../repositories/ProductCategoryRepository";
import { DatabaseError } from "../repositories/ProductCategoryRepository";

/**
 * Fallback categories for graceful degradation when database is unavailable
 * These match the seed data from the database migration
 */
const FALLBACK_CATEGORIES: ProductCategoryDTO[] = [
  { id: 1, name: "nabiał", description: "Produkty mleczne i nabiałowe" },
  { id: 2, name: "mięso", description: "Mięso i produkty mięsne" },
  { id: 3, name: "pieczywo", description: "Pieczywo i wypieki" },
  { id: 4, name: "warzywa", description: "Warzywa świeże i przetworzone" },
  { id: 5, name: "owoce", description: "Owoce świeże i suszone" },
];

/**
 * Service interface for product categories business logic
 */
export interface IProductCategoryService {
  getAllCategories(): Promise<ProductCategoryDTO[]>;
}

/**
 * Service class responsible for product categories business logic
 * Handles data transformation, caching, and fallback strategies
 */
export class ProductCategoryService implements IProductCategoryService {
  private cache: {
    data: ProductCategoryDTO[] | null;
    timestamp: number;
    ttl: number;
  };

  constructor(
    private readonly repository: IProductCategoryRepository,
    private readonly cacheTtlMs: number = 30 * 60 * 1000 // 30 minutes default TTL
  ) {
    this.cache = {
      data: null,
      timestamp: 0,
      ttl: cacheTtlMs,
    };
  }

  /**
   * Retrieves all product categories with caching and fallback support
   * Implements in-memory cache with TTL for performance optimization
   * Falls back to static data if database is unavailable
   *
   * @returns Promise<ProductCategoryDTO[]> Array of product category DTOs
   */
  async getAllCategories(): Promise<ProductCategoryDTO[]> {
    console.info("ProductCategoryService: getAllCategories called");

    // Check cache first
    if (this.isCacheValid()) {
      console.debug("ProductCategoryService: Returning cached data", {
        cacheAge: Date.now() - this.cache.timestamp,
        itemCount: this.cache.data?.length || 0,
      });
      return this.cache.data || [];
    }

    console.debug("ProductCategoryService: Cache miss or expired, fetching from database");

    try {
      const startTime = Date.now();

      // Fetch from database via repository
      const dbRows = await this.repository.findAll();

      // Transform database rows to DTOs
      const categories = dbRows.map(this.mapToDTO);

      // Update cache
      this.updateCache(categories);

      const responseTime = Date.now() - startTime;

      console.info("ProductCategoryService: Successfully retrieved categories from database", {
        responseTime: `${responseTime}ms`,
        categoryCount: categories.length,
      });

      return categories;
    } catch (error) {
      console.error("ProductCategoryService: Database error, falling back to static data", {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof DatabaseError ? "DatabaseError" : "UnknownError",
      });

      // Return fallback data for graceful degradation
      console.warn("ProductCategoryService: Using fallback categories due to database error");
      return FALLBACK_CATEGORIES;
    }
  }

  /**
   * Maps database row to DTO format
   * Handles data transformation from database schema to API response format
   *
   * @param row Database row from product_categories table
   * @returns ProductCategoryDTO Transformed DTO object
   */
  private mapToDTO(row: DatabaseTables["product_categories"]["Row"]): ProductCategoryDTO {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
    };
  }

  /**
   * Checks if current cache is still valid based on TTL
   *
   * @returns boolean True if cache is valid, false otherwise
   */
  private isCacheValid(): boolean {
    if (!this.cache.data) {
      return false;
    }

    const cacheAge = Date.now() - this.cache.timestamp;
    return cacheAge < this.cache.ttl;
  }

  /**
   * Updates the in-memory cache with new data
   *
   * @param data Product categories data to cache
   */
  private updateCache(data: ProductCategoryDTO[]): void {
    this.cache.data = data;
    this.cache.timestamp = Date.now();

    console.debug("ProductCategoryService: Cache updated", {
      itemCount: data.length,
      ttlMs: this.cache.ttl,
    });
  }

  /**
   * Clears the in-memory cache
   * Useful for cache invalidation scenarios
   */
  public clearCache(): void {
    this.cache.data = null;
    this.cache.timestamp = 0;

    console.debug("ProductCategoryService: Cache cleared manually");
  }

  /**
   * Gets cache statistics for monitoring purposes
   *
   * @returns Cache statistics object
   */
  public getCacheStats(): {
    hasData: boolean;
    age: number;
    ttl: number;
    isValid: boolean;
    itemCount: number;
  } {
    return {
      hasData: this.cache.data !== null,
      age: this.cache.data ? Date.now() - this.cache.timestamp : 0,
      ttl: this.cache.ttl,
      isValid: this.isCacheValid(),
      itemCount: this.cache.data?.length || 0,
    };
  }
}
