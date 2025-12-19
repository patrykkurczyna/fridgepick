import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, DatabaseTables, Enums } from '../types';
import { DatabaseError } from './ProductCategoryRepository';

/**
 * Filter parameters for user products queries
 */
export interface UserProductFilters {
  search?: string;
  category?: number;
  expired?: boolean;
  expiring_soon?: number;
  sort?: 'name' | 'expires_at' | 'created_at';
  limit?: number;
  offset?: number;
}

/**
 * Raw database row with joined category information
 */
export interface UserProductWithCategory {
  id: string;
  user_id: string;
  name: string;
  category_id: number;
  quantity: number;
  unit: Enums['unit_type'];
  expires_at: string | null;
  created_at: string;
  updated_at: string | null;
  category_name: string;
  category_description: string | null;
}

/**
 * Input data for creating user product
 */
export interface CreateUserProductData {
  name: string;
  category_id: number;
  quantity: number;
  unit: Enums['unit_type'];
  expires_at?: string | null;
}

/**
 * Input data for updating user product
 */
export interface UpdateUserProductData {
  name: string;
  category_id: number;
  quantity: number;
  unit: Enums['unit_type'];
  expires_at?: string | null;
}

/**
 * Repository interface for user products data access
 */
export interface IUserProductRepository {
  findByUserId(userId: string, filters?: UserProductFilters): Promise<UserProductWithCategory[]>;
  countByUserId(userId: string, filters?: Omit<UserProductFilters, 'limit' | 'offset' | 'sort'>): Promise<number>;
  create(userId: string, productData: CreateUserProductData): Promise<UserProductWithCategory>;
  findById(id: string, userId: string): Promise<UserProductWithCategory | null>;
  update(id: string, userId: string, productData: UpdateUserProductData): Promise<UserProductWithCategory>;
  delete(id: string, userId: string): Promise<boolean>;
  categoryExists(categoryId: number): Promise<boolean>;
}

/**
 * Repository class responsible for user products data access layer
 * Handles all database interactions for user_products table with category joins
 */
export class UserProductRepository implements IUserProductRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Retrieves user products with category information and optional filtering
   * 
   * @param userId - User ID to filter products by
   * @param filters - Optional filters for category, expiration, sorting, pagination
   * @returns Promise<UserProductWithCategory[]> Array of user products with category data
   * @throws {DatabaseError} When database query fails
   */
  async findByUserId(userId: string, filters: UserProductFilters = {}): Promise<UserProductWithCategory[]> {
    try {
      console.info('UserProductRepository: Starting findByUserId query', {
        userId: userId.substring(0, 8) + '...',
        filters
      });

      const queryStartTime = Date.now();

      // Build the base query with category join
      let query = this.supabase
        .from('user_products')
        .select(`
          id,
          user_id,
          name,
          category_id,
          quantity,
          unit,
          expires_at,
          created_at,
          updated_at,
          product_categories!inner(
            name,
            description
          )
        `)
        .eq('user_id', userId);

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters.expired !== undefined) {
        if (filters.expired) {
          query = query.lt('expires_at', new Date().toISOString().split('T')[0]);
        } else {
          query = query.or(`expires_at.is.null,expires_at.gte.${new Date().toISOString().split('T')[0]}`);
        }
      }

      if (filters.expiring_soon) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + filters.expiring_soon);
        query = query
          .not('expires_at', 'is', null)
          .lte('expires_at', futureDate.toISOString().split('T')[0])
          .gte('expires_at', new Date().toISOString().split('T')[0]);
      }

      // Apply sorting
      if (filters.sort) {
        const sortField = filters.sort;
        query = query.order(sortField);
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;

      const queryTime = Date.now() - queryStartTime;

      if (error) {
        console.error('UserProductRepository: Database error in findByUserId', {
          error: error.message,
          code: error.code,
          userId: userId.substring(0, 8) + '...',
          queryTime: `${queryTime}ms`
        });
        
        throw new DatabaseError(
          'Failed to fetch user products from database',
          error,
          error.code || 'USER_PRODUCTS_QUERY_ERROR'
        );
      }

      // Transform the response to flatten category data
      const products = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        category_id: item.category_id,
        quantity: item.quantity,
        unit: item.unit,
        expires_at: item.expires_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        category_name: (item.product_categories as any).name,
        category_description: (item.product_categories as any).description
      })) as UserProductWithCategory[];

      console.debug('UserProductRepository: findByUserId query executed successfully', {
        queryTime: `${queryTime}ms`,
        rowCount: products.length,
        userId: userId.substring(0, 8) + '...'
      });

      return products;

    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      console.error('UserProductRepository: Unexpected error in findByUserId', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: userId.substring(0, 8) + '...'
      });
      
      throw new DatabaseError(
        'Unexpected error occurred while fetching user products',
        error,
        'UNEXPECTED_ERROR'
      );
    }
  }

  /**
   * Counts total user products matching filters (for pagination)
   * 
   * @param userId - User ID to filter products by
   * @param filters - Optional filters excluding pagination parameters
   * @returns Promise<number> Total count of matching products
   * @throws {DatabaseError} When database query fails
   */
  async countByUserId(userId: string, filters: Omit<UserProductFilters, 'limit' | 'offset' | 'sort'> = {}): Promise<number> {
    try {
      console.debug('UserProductRepository: Starting countByUserId query', {
        userId: userId.substring(0, 8) + '...',
        filters
      });

      let query = this.supabase
        .from('user_products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Apply the same filters as findByUserId (excluding pagination/sort)
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters.expired !== undefined) {
        if (filters.expired) {
          query = query.lt('expires_at', new Date().toISOString().split('T')[0]);
        } else {
          query = query.or(`expires_at.is.null,expires_at.gte.${new Date().toISOString().split('T')[0]}`);
        }
      }

      if (filters.expiring_soon) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + filters.expiring_soon);
        query = query
          .not('expires_at', 'is', null)
          .lte('expires_at', futureDate.toISOString().split('T')[0])
          .gte('expires_at', new Date().toISOString().split('T')[0]);
      }

      const { count, error } = await query;

      if (error) {
        console.error('UserProductRepository: Database error in countByUserId', {
          error: error.message,
          code: error.code,
          userId: userId.substring(0, 8) + '...'
        });
        
        throw new DatabaseError(
          'Failed to count user products',
          error,
          error.code || 'USER_PRODUCTS_COUNT_ERROR'
        );
      }

      return count || 0;

    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw new DatabaseError(
        'Unexpected error occurred while counting user products',
        error,
        'UNEXPECTED_ERROR'
      );
    }
  }

  /**
   * Creates a new user product
   * 
   * @param userId - User ID who owns the product
   * @param productData - Product data to create
   * @returns Promise<UserProductWithCategory> Created product with category information
   * @throws {DatabaseError} When database operation fails
   */
  async create(userId: string, productData: CreateUserProductData): Promise<UserProductWithCategory> {
    try {
      console.info('UserProductRepository: Starting create operation', {
        userId: userId.substring(0, 8) + '...',
        productName: productData.name,
        categoryId: productData.category_id
      });

      const queryStartTime = Date.now();

      const { data, error } = await this.supabase
        .from('user_products')
        .insert({
          user_id: userId,
          ...productData
        })
        .select(`
          id,
          user_id,
          name,
          category_id,
          quantity,
          unit,
          expires_at,
          created_at,
          updated_at,
          product_categories!inner(
            name,
            description
          )
        `)
        .single();

      const queryTime = Date.now() - queryStartTime;

      if (error) {
        console.error('UserProductRepository: Database error in create', {
          error: error.message,
          code: error.code,
          userId: userId.substring(0, 8) + '...',
          queryTime: `${queryTime}ms`
        });
        
        throw new DatabaseError(
          'Failed to create user product',
          error,
          error.code || 'USER_PRODUCT_CREATE_ERROR'
        );
      }

      if (!data) {
        throw new DatabaseError(
          'No data returned after creating user product',
          null,
          'CREATE_NO_DATA'
        );
      }

      // Transform the response
      const product: UserProductWithCategory = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        category_id: data.category_id,
        quantity: data.quantity,
        unit: data.unit,
        expires_at: data.expires_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        category_name: (data.product_categories as any).name,
        category_description: (data.product_categories as any).description
      };

      console.info('UserProductRepository: Product created successfully', {
        productId: product.id,
        userId: userId.substring(0, 8) + '...',
        queryTime: `${queryTime}ms`
      });

      return product;

    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw new DatabaseError(
        'Unexpected error occurred while creating user product',
        error,
        'UNEXPECTED_ERROR'
      );
    }
  }

  /**
   * Finds a specific user product by ID with ownership validation
   * 
   * @param id - Product ID to find
   * @param userId - User ID for ownership validation
   * @returns Promise<UserProductWithCategory | null> Product data or null if not found/not owned
   * @throws {DatabaseError} When database query fails
   */
  async findById(id: string, userId: string): Promise<UserProductWithCategory | null> {
    try {
      console.debug('UserProductRepository: Starting findById query', {
        productId: id,
        userId: userId.substring(0, 8) + '...'
      });

      const { data, error } = await this.supabase
        .from('user_products')
        .select(`
          id,
          user_id,
          name,
          category_id,
          quantity,
          unit,
          expires_at,
          created_at,
          updated_at,
          product_categories!inner(
            name,
            description
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - product not found or not owned by user
          console.debug('UserProductRepository: Product not found or not owned', {
            productId: id,
            userId: userId.substring(0, 8) + '...'
          });
          return null;
        }
        
        console.error('UserProductRepository: Database error in findById', {
          error: error.message,
          code: error.code,
          productId: id,
          userId: userId.substring(0, 8) + '...'
        });
        
        throw new DatabaseError(
          'Failed to find user product by ID',
          error,
          error.code || 'USER_PRODUCT_FINDBYID_ERROR'
        );
      }

      if (!data) {
        return null;
      }

      // Transform the response
      const product: UserProductWithCategory = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        category_id: data.category_id,
        quantity: data.quantity,
        unit: data.unit,
        expires_at: data.expires_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        category_name: (data.product_categories as any).name,
        category_description: (data.product_categories as any).description
      };

      console.debug('UserProductRepository: Product found successfully', {
        productId: id,
        userId: userId.substring(0, 8) + '...'
      });

      return product;

    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw new DatabaseError(
        'Unexpected error occurred while finding user product by ID',
        error,
        'UNEXPECTED_ERROR'
      );
    }
  }

  /**
   * Updates an existing user product with ownership validation
   * 
   * @param id - Product ID to update
   * @param userId - User ID for ownership validation
   * @param productData - Updated product data
   * @returns Promise<UserProductWithCategory> Updated product with category information
   * @throws {DatabaseError} When database operation fails
   */
  async update(id: string, userId: string, productData: UpdateUserProductData): Promise<UserProductWithCategory> {
    try {
      console.info('UserProductRepository: Starting update operation', {
        productId: id,
        userId: userId.substring(0, 8) + '...',
        productName: productData.name
      });

      const queryStartTime = Date.now();

      const { data, error } = await this.supabase
        .from('user_products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select(`
          id,
          user_id,
          name,
          category_id,
          quantity,
          unit,
          expires_at,
          created_at,
          updated_at,
          product_categories!inner(
            name,
            description
          )
        `)
        .single();

      const queryTime = Date.now() - queryStartTime;

      if (error) {
        if (error.code === 'PGRST116') {
          throw new DatabaseError(
            'Product not found or access denied',
            error,
            'PRODUCT_NOT_FOUND_OR_FORBIDDEN'
          );
        }
        
        console.error('UserProductRepository: Database error in update', {
          error: error.message,
          code: error.code,
          productId: id,
          userId: userId.substring(0, 8) + '...',
          queryTime: `${queryTime}ms`
        });
        
        throw new DatabaseError(
          'Failed to update user product',
          error,
          error.code || 'USER_PRODUCT_UPDATE_ERROR'
        );
      }

      if (!data) {
        throw new DatabaseError(
          'No data returned after updating user product',
          null,
          'UPDATE_NO_DATA'
        );
      }

      // Transform the response
      const product: UserProductWithCategory = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        category_id: data.category_id,
        quantity: data.quantity,
        unit: data.unit,
        expires_at: data.expires_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        category_name: (data.product_categories as any).name,
        category_description: (data.product_categories as any).description
      };

      console.info('UserProductRepository: Product updated successfully', {
        productId: id,
        userId: userId.substring(0, 8) + '...',
        queryTime: `${queryTime}ms`
      });

      return product;

    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw new DatabaseError(
        'Unexpected error occurred while updating user product',
        error,
        'UNEXPECTED_ERROR'
      );
    }
  }

  /**
   * Deletes a user product with ownership validation
   * 
   * @param id - Product ID to delete
   * @param userId - User ID for ownership validation
   * @returns Promise<boolean> True if deleted, false if not found/not owned
   * @throws {DatabaseError} When database operation fails
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      console.info('UserProductRepository: Starting delete operation', {
        productId: id,
        userId: userId.substring(0, 8) + '...'
      });

      const queryStartTime = Date.now();

      const { error, count } = await this.supabase
        .from('user_products')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('user_id', userId);

      const queryTime = Date.now() - queryStartTime;

      if (error) {
        console.error('UserProductRepository: Database error in delete', {
          error: error.message,
          code: error.code,
          productId: id,
          userId: userId.substring(0, 8) + '...',
          queryTime: `${queryTime}ms`
        });
        
        throw new DatabaseError(
          'Failed to delete user product',
          error,
          error.code || 'USER_PRODUCT_DELETE_ERROR'
        );
      }

      const wasDeleted = (count || 0) > 0;

      console.info('UserProductRepository: Delete operation completed', {
        productId: id,
        userId: userId.substring(0, 8) + '...',
        deleted: wasDeleted,
        queryTime: `${queryTime}ms`
      });

      return wasDeleted;

    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw new DatabaseError(
        'Unexpected error occurred while deleting user product',
        error,
        'UNEXPECTED_ERROR'
      );
    }
  }

  /**
   * Checks if a product category exists
   * 
   * @param categoryId - Category ID to check
   * @returns Promise<boolean> True if category exists
   * @throws {DatabaseError} When database query fails
   */
  async categoryExists(categoryId: number): Promise<boolean> {
    try {
      console.debug('UserProductRepository: Checking if category exists', { categoryId });

      const { data, error } = await this.supabase
        .from('product_categories')
        .select('id')
        .eq('id', categoryId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - category does not exist
          return false;
        }
        
        console.error('UserProductRepository: Database error in categoryExists', {
          error: error.message,
          code: error.code,
          categoryId
        });
        
        throw new DatabaseError(
          'Failed to check category existence',
          error,
          error.code || 'CATEGORY_EXISTS_ERROR'
        );
      }

      return !!data;

    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      throw new DatabaseError(
        'Unexpected error occurred while checking category existence',
        error,
        'UNEXPECTED_ERROR'
      );
    }
  }
}