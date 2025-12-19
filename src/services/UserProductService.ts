import type { 
  UserProductDTO, 
  UserProductsResponse, 
  UserProductResponse, 
  CreateUserProductRequest, 
  UpdateUserProductRequest,
  UserProductsQueryParams,
  PaginationDTO,
  DatabaseTables,
  Enums
} from '../types';
import type { 
  IUserProductRepository,
  UserProductFilters,
  UserProductWithCategory,
  CreateUserProductData,
  UpdateUserProductData
} from '../repositories/UserProductRepository';
import { DatabaseError } from '../repositories/ProductCategoryRepository';

/**
 * Service interface for user products business logic
 */
export interface IUserProductService {
  getUserProducts(userId: string, queryParams?: UserProductsQueryParams): Promise<UserProductsResponse>;
  createProduct(userId: string, productData: CreateUserProductRequest): Promise<UserProductResponse>;
  updateProduct(userId: string, productId: string, productData: UpdateUserProductRequest): Promise<UserProductResponse>;
  deleteProduct(userId: string, productId: string): Promise<{ success: boolean; message: string }>;
  getProductById(userId: string, productId: string): Promise<UserProductDTO | null>;
}

/**
 * Business logic error class
 */
export class UserProductServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'UserProductServiceError';
  }
}

/**
 * Service class responsible for user products business logic
 * Handles data transformation, validation, computed fields, and business rules
 */
export class UserProductService implements IUserProductService {
  constructor(private readonly repository: IUserProductRepository) {}

  /**
   * Retrieves user products with filtering, sorting, and pagination
   * Includes computed fields like isExpired and daysUntilExpiry
   * 
   * @param userId - User ID to get products for
   * @param queryParams - Optional query parameters for filtering and pagination
   * @returns Promise<UserProductsResponse> Products with pagination metadata
   */
  async getUserProducts(userId: string, queryParams: UserProductsQueryParams = {}): Promise<UserProductsResponse> {
    try {
      console.info('UserProductService: Starting getUserProducts', {
        userId: userId.substring(0, 8) + '...',
        queryParams
      });

      const startTime = Date.now();

      // Validate and sanitize query parameters
      const filters = this.buildFilters(queryParams);

      // Get total count for pagination
      const totalCount = await this.repository.countByUserId(userId, {
        search: filters.search,
        category: filters.category,
        expired: filters.expired,
        expiring_soon: filters.expiring_soon
      });

      // Get the actual data
      const dbProducts = await this.repository.findByUserId(userId, filters);

      // Transform to DTOs with computed fields
      const products = dbProducts.map(product => this.transformToDTO(product));

      // Build pagination metadata
      const pagination: PaginationDTO = {
        total: totalCount,
        limit: filters.limit || 50,
        offset: filters.offset || 0
      };

      const responseTime = Date.now() - startTime;

      console.info('UserProductService: getUserProducts completed successfully', {
        userId: userId.substring(0, 8) + '...',
        productCount: products.length,
        totalCount,
        responseTime: `${responseTime}ms`
      });

      return {
        products,
        pagination
      };

    } catch (error) {
      console.error('UserProductService: Error in getUserProducts', {
        userId: userId.substring(0, 8) + '...',
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof DatabaseError) {
        throw new UserProductServiceError(
          'Failed to retrieve user products',
          'DATABASE_ERROR',
          500,
          { originalError: error.message }
        );
      }

      throw error;
    }
  }

  /**
   * Creates a new user product with validation
   * 
   * @param userId - User ID who owns the product
   * @param productData - Product data to create
   * @returns Promise<UserProductResponse> Created product with success flag
   */
  async createProduct(userId: string, productData: CreateUserProductRequest): Promise<UserProductResponse> {
    try {
      console.info('UserProductService: Starting createProduct', {
        userId: userId.substring(0, 8) + '...',
        productName: productData.name,
        categoryId: productData.categoryId
      });

      const startTime = Date.now();

      // Validate category exists
      const categoryExists = await this.repository.categoryExists(productData.categoryId);
      if (!categoryExists) {
        throw new UserProductServiceError(
          'Invalid category ID - category does not exist',
          'INVALID_CATEGORY',
          400,
          { categoryId: productData.categoryId }
        );
      }

      // Validate expiration date if provided
      if (productData.expiresAt) {
        const expiryDate = new Date(productData.expiresAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expiryDate < today) {
          throw new UserProductServiceError(
            'Expiration date cannot be in the past',
            'INVALID_EXPIRY_DATE',
            400,
            { expiresAt: productData.expiresAt }
          );
        }
      }

      // Transform request data to repository format
      const createData: CreateUserProductData = {
        name: productData.name.trim(),
        category_id: productData.categoryId,
        quantity: productData.quantity,
        unit: productData.unit,
        expires_at: productData.expiresAt || null
      };

      // Create the product
      const createdProduct = await this.repository.create(userId, createData);

      // Transform to DTO
      const productDTO = this.transformToDTO(createdProduct);

      const responseTime = Date.now() - startTime;

      console.info('UserProductService: createProduct completed successfully', {
        userId: userId.substring(0, 8) + '...',
        productId: createdProduct.id,
        responseTime: `${responseTime}ms`
      });

      return {
        success: true,
        product: productDTO
      };

    } catch (error) {
      console.error('UserProductService: Error in createProduct', {
        userId: userId.substring(0, 8) + '...',
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof UserProductServiceError) {
        throw error;
      }

      if (error instanceof DatabaseError) {
        // Check for specific database constraint violations
        if (error.originalError?.code === '23503') {
          throw new UserProductServiceError(
            'Invalid category ID - category does not exist',
            'INVALID_CATEGORY',
            400,
            { categoryId: productData.categoryId }
          );
        }

        throw new UserProductServiceError(
          'Failed to create user product',
          'DATABASE_ERROR',
          500,
          { originalError: error.message }
        );
      }

      throw error;
    }
  }

  /**
   * Updates an existing user product with validation
   * 
   * @param userId - User ID for ownership validation
   * @param productId - Product ID to update
   * @param productData - Updated product data
   * @returns Promise<UserProductResponse> Updated product with success flag
   */
  async updateProduct(userId: string, productId: string, productData: UpdateUserProductRequest): Promise<UserProductResponse> {
    try {
      console.info('UserProductService: Starting updateProduct', {
        userId: userId.substring(0, 8) + '...',
        productId,
        productName: productData.name
      });

      const startTime = Date.now();

      // Check if product exists and is owned by user
      const existingProduct = await this.repository.findById(productId, userId);
      if (!existingProduct) {
        throw new UserProductServiceError(
          'Product not found or access denied',
          'PRODUCT_NOT_FOUND',
          404,
          { productId }
        );
      }

      // Validate category exists
      const categoryExists = await this.repository.categoryExists(productData.categoryId);
      if (!categoryExists) {
        throw new UserProductServiceError(
          'Invalid category ID - category does not exist',
          'INVALID_CATEGORY',
          400,
          { categoryId: productData.categoryId }
        );
      }

      // Validate expiration date if provided
      if (productData.expiresAt) {
        const expiryDate = new Date(productData.expiresAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expiryDate < today) {
          throw new UserProductServiceError(
            'Expiration date cannot be in the past',
            'INVALID_EXPIRY_DATE',
            400,
            { expiresAt: productData.expiresAt }
          );
        }
      }

      // Transform request data to repository format
      const updateData: UpdateUserProductData = {
        name: productData.name.trim(),
        category_id: productData.categoryId,
        quantity: productData.quantity,
        unit: productData.unit,
        expires_at: productData.expiresAt || null
      };

      // Update the product
      const updatedProduct = await this.repository.update(productId, userId, updateData);

      // Transform to DTO
      const productDTO = this.transformToDTO(updatedProduct);

      const responseTime = Date.now() - startTime;

      console.info('UserProductService: updateProduct completed successfully', {
        userId: userId.substring(0, 8) + '...',
        productId,
        responseTime: `${responseTime}ms`
      });

      return {
        success: true,
        product: productDTO
      };

    } catch (error) {
      console.error('UserProductService: Error in updateProduct', {
        userId: userId.substring(0, 8) + '...',
        productId,
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof UserProductServiceError) {
        throw error;
      }

      if (error instanceof DatabaseError) {
        if (error.code === 'PRODUCT_NOT_FOUND_OR_FORBIDDEN') {
          throw new UserProductServiceError(
            'Product not found or access denied',
            'PRODUCT_NOT_FOUND',
            404,
            { productId }
          );
        }

        throw new UserProductServiceError(
          'Failed to update user product',
          'DATABASE_ERROR',
          500,
          { originalError: error.message }
        );
      }

      throw error;
    }
  }

  /**
   * Deletes a user product with ownership validation
   * 
   * @param userId - User ID for ownership validation
   * @param productId - Product ID to delete
   * @returns Promise<{success: boolean; message: string}> Deletion result
   */
  async deleteProduct(userId: string, productId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.info('UserProductService: Starting deleteProduct', {
        userId: userId.substring(0, 8) + '...',
        productId
      });

      const startTime = Date.now();

      // Delete the product (repository handles ownership validation)
      const wasDeleted = await this.repository.delete(productId, userId);

      if (!wasDeleted) {
        throw new UserProductServiceError(
          'Product not found or access denied',
          'PRODUCT_NOT_FOUND',
          404,
          { productId }
        );
      }

      const responseTime = Date.now() - startTime;

      console.info('UserProductService: deleteProduct completed successfully', {
        userId: userId.substring(0, 8) + '...',
        productId,
        responseTime: `${responseTime}ms`
      });

      return {
        success: true,
        message: 'Product removed successfully'
      };

    } catch (error) {
      console.error('UserProductService: Error in deleteProduct', {
        userId: userId.substring(0, 8) + '...',
        productId,
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof UserProductServiceError) {
        throw error;
      }

      if (error instanceof DatabaseError) {
        throw new UserProductServiceError(
          'Failed to delete user product',
          'DATABASE_ERROR',
          500,
          { originalError: error.message }
        );
      }

      throw error;
    }
  }

  /**
   * Gets a single user product by ID with ownership validation
   * 
   * @param userId - User ID for ownership validation
   * @param productId - Product ID to retrieve
   * @returns Promise<UserProductDTO | null> Product data or null if not found
   */
  async getProductById(userId: string, productId: string): Promise<UserProductDTO | null> {
    try {
      console.debug('UserProductService: Starting getProductById', {
        userId: userId.substring(0, 8) + '...',
        productId
      });

      const product = await this.repository.findById(productId, userId);
      
      if (!product) {
        return null;
      }

      return this.transformToDTO(product);

    } catch (error) {
      console.error('UserProductService: Error in getProductById', {
        userId: userId.substring(0, 8) + '...',
        productId,
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof DatabaseError) {
        throw new UserProductServiceError(
          'Failed to retrieve user product',
          'DATABASE_ERROR',
          500,
          { originalError: error.message }
        );
      }

      throw error;
    }
  }

  /**
   * Transforms database row to UserProductDTO with computed fields
   * 
   * @param dbProduct - Database product with category information
   * @returns UserProductDTO Transformed DTO with computed fields
   */
  private transformToDTO(dbProduct: UserProductWithCategory): UserProductDTO {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let isExpired = false;
    let daysUntilExpiry: number | null = null;

    if (dbProduct.expires_at) {
      const expiryDate = new Date(dbProduct.expires_at);
      const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
      
      isExpired = expiryDateOnly < today;
      
      if (!isExpired) {
        const diffTime = expiryDateOnly.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    return {
      id: dbProduct.id,
      name: dbProduct.name,
      categoryId: dbProduct.category_id,
      categoryName: dbProduct.category_name,
      quantity: dbProduct.quantity,
      unit: dbProduct.unit,
      expiresAt: dbProduct.expires_at,
      createdAt: dbProduct.created_at,
      isExpired,
      daysUntilExpiry
    };
  }

  /**
   * Builds repository filters from query parameters with validation
   * 
   * @param queryParams - Raw query parameters
   * @returns UserProductFilters Validated and sanitized filters
   */
  private buildFilters(queryParams: UserProductsQueryParams): UserProductFilters {
    const filters: UserProductFilters = {};

    // Search filter
    if (queryParams.search !== undefined && queryParams.search.trim().length >= 2) {
      filters.search = queryParams.search.trim();
    }

    // Category filter
    if (queryParams.category !== undefined) {
      if (typeof queryParams.category === 'number' && queryParams.category > 0) {
        filters.category = queryParams.category;
      }
    }

    // Expired filter
    if (queryParams.expired !== undefined) {
      filters.expired = Boolean(queryParams.expired);
    }

    // Expiring soon filter
    if (queryParams.expiring_soon !== undefined) {
      const days = Number(queryParams.expiring_soon);
      if (!isNaN(days) && days > 0 && days <= 365) {
        filters.expiring_soon = days;
      }
    }

    // Sort filter
    if (queryParams.sort) {
      const validSorts = ['name', 'expires_at', 'created_at'];
      if (validSorts.includes(queryParams.sort)) {
        filters.sort = queryParams.sort as 'name' | 'expires_at' | 'created_at';
      }
    }

    // Pagination
    if (queryParams.limit !== undefined) {
      const limit = Number(queryParams.limit);
      if (!isNaN(limit) && limit > 0 && limit <= 100) {
        filters.limit = limit;
      }
    }

    if (queryParams.offset !== undefined) {
      const offset = Number(queryParams.offset);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    return filters;
  }
}