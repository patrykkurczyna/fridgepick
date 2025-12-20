import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, DatabaseTables } from "../types";

/**
 * Custom error class for database-related operations
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Repository interface for product categories data access
 */
export interface IProductCategoryRepository {
  findAll(): Promise<DatabaseTables["product_categories"]["Row"][]>;
}

/**
 * Repository class responsible for product categories data access layer
 * Handles all database interactions for product categories table
 */
export class ProductCategoryRepository implements IProductCategoryRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Retrieves all product categories from the database
   * Orders results by name for consistent presentation
   *
   * @returns Promise<DatabaseTables['product_categories']['Row'][]> Array of category rows
   * @throws {DatabaseError} When database query fails
   */
  async findAll(): Promise<DatabaseTables["product_categories"]["Row"][]> {
    try {
      console.info("ProductCategoryRepository: Starting findAll query");

      const queryStartTime = Date.now();

      const { data, error } = await this.supabase
        .from("product_categories")
        .select("id, name, description, created_at")
        .order("name");

      const queryTime = Date.now() - queryStartTime;

      if (error) {
        console.error("ProductCategoryRepository: Database error occurred", {
          error: error.message,
          code: error.code,
          details: error.details,
          queryTime: `${queryTime}ms`,
        });

        throw new DatabaseError(
          "Failed to fetch product categories from database",
          error,
          error.code || "UNKNOWN_DB_ERROR"
        );
      }

      const categories = data || [];

      console.debug("ProductCategoryRepository: Query executed successfully", {
        queryTime: `${queryTime}ms`,
        rowCount: categories.length,
      });

      return categories;
    } catch {
      // Re-throw DatabaseError as-is, wrap other errors
      if (error instanceof DatabaseError) {
        throw error;
      }

      console.error("ProductCategoryRepository: Unexpected error in findAll", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new DatabaseError("Unexpected error occurred while fetching product categories", error, "UNEXPECTED_ERROR");
    }
  }
}
