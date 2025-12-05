import { z } from 'zod';
import { UNIT_TYPES } from '../types';

/**
 * Validation schema for creating user products
 */
export const CreateUserProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be at most 255 characters')
    .trim(),
  
  categoryId: z
    .number()
    .int('Category ID must be an integer')
    .positive('Category ID must be positive'),
  
  quantity: z
    .number()
    .nonnegative('Quantity cannot be negative')
    .refine(
      (val) => {
        // Check for max 3 decimal places
        const decimalString = val.toString();
        if (decimalString.includes('.')) {
          const decimalPlaces = decimalString.split('.')[1].length;
          return decimalPlaces <= 3;
        }
        return true;
      },
      'Quantity can have at most 3 decimal places'
    )
    .refine(
      (val) => val < 1000000,
      'Quantity cannot exceed 999,999'
    ),
  
  unit: z
    .enum(['g', 'l', 'szt'] as const, {
      errorMap: () => ({ message: 'Unit must be one of: g, l, szt' })
    }),
  
  expiresAt: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        
        // Validate ISO date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(val)) {
          return false;
        }
        
        // Validate it's a real date
        const date = new Date(val);
        return !isNaN(date.getTime()) && val === date.toISOString().split('T')[0];
      },
      'Expiration date must be in YYYY-MM-DD format'
    )
    .refine(
      (val) => {
        if (!val) return true;
        
        const expiryDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return expiryDate >= today;
      },
      'Expiration date must be today or in the future'
    )
}).strict(); // Reject additional properties

/**
 * Validation schema for updating user products
 * Same as create schema but all fields are required
 */
export const UpdateUserProductSchema = CreateUserProductSchema;

/**
 * Validation schema for user products query parameters
 */
export const UserProductsQuerySchema = z.object({
  category: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .refine(
      (val) => val === undefined || (!isNaN(val) && val > 0),
      'Category must be a positive integer'
    ),
  
  expired: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    })
    .refine(
      (val) => val === undefined || typeof val === 'boolean',
      'Expired must be true or false'
    ),
  
  expiring_soon: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .refine(
      (val) => val === undefined || (!isNaN(val) && val > 0 && val <= 365),
      'Expiring soon must be a positive integer between 1 and 365'
    ),
  
  sort: z
    .enum(['name', 'expires_at', 'created_at'], {
      errorMap: () => ({ message: 'Sort must be one of: name, expires_at, created_at' })
    })
    .optional(),
  
  limit: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .refine(
      (val) => val === undefined || (!isNaN(val) && val > 0 && val <= 100),
      'Limit must be a positive integer between 1 and 100'
    ),
  
  offset: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined)
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      'Offset must be a non-negative integer'
    )
}).strict();

/**
 * Validation schema for product ID parameter
 */
export const ProductIdSchema = z.object({
  id: z
    .string()
    .uuid('Product ID must be a valid UUID')
}).strict();

/**
 * Custom validation errors type
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation result type
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: ValidationError[];
};

/**
 * Validates create user product request
 * 
 * @param data - Raw request data to validate
 * @returns ValidationResult<CreateUserProductRequest>
 */
export function validateCreateUserProduct(data: unknown): ValidationResult<z.infer<typeof CreateUserProductSchema>> {
  try {
    const validatedData = CreateUserProductSchema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.path.reduce((obj, path) => (obj as any)?.[path], data)
      }));
      
      return {
        success: false,
        errors
      };
    }
    
    return {
      success: false,
      errors: [{
        field: 'root',
        message: 'Invalid data format'
      }]
    };
  }
}

/**
 * Validates update user product request
 * 
 * @param data - Raw request data to validate
 * @returns ValidationResult<UpdateUserProductRequest>
 */
export function validateUpdateUserProduct(data: unknown): ValidationResult<z.infer<typeof UpdateUserProductSchema>> {
  return validateCreateUserProduct(data); // Same validation rules
}

/**
 * Validates user products query parameters
 * 
 * @param queryParams - Raw query parameters to validate
 * @returns ValidationResult<UserProductsQueryParams>
 */
export function validateUserProductsQuery(queryParams: Record<string, string | string[] | undefined>): ValidationResult<z.infer<typeof UserProductsQuerySchema>> {
  try {
    // Convert query params to simple string values
    const normalizedParams: Record<string, string | undefined> = {};
    
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        // Handle array values by taking the first element
        normalizedParams[key] = Array.isArray(value) ? value[0] : value;
      }
    }
    
    const validatedData = UserProductsQuerySchema.parse(normalizedParams);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.path.reduce((obj, path) => (obj as any)?.[path], queryParams)
      }));
      
      return {
        success: false,
        errors
      };
    }
    
    return {
      success: false,
      errors: [{
        field: 'root',
        message: 'Invalid query parameters format'
      }]
    };
  }
}

/**
 * Validates product ID parameter
 * 
 * @param params - Raw path parameters to validate
 * @returns ValidationResult<{id: string}>
 */
export function validateProductId(params: Record<string, string | undefined>): ValidationResult<z.infer<typeof ProductIdSchema>> {
  try {
    const validatedData = ProductIdSchema.parse(params);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.path.reduce((obj, path) => (obj as any)?.[path], params)
      }));
      
      return {
        success: false,
        errors
      };
    }
    
    return {
      success: false,
      errors: [{
        field: 'root',
        message: 'Invalid parameters format'
      }]
    };
  }
}

/**
 * Helper function to format validation errors for API response
 * 
 * @param errors - Array of validation errors
 * @returns Formatted error details object
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  for (const error of errors) {
    formatted[error.field] = error.message;
  }
  
  return formatted;
}

/**
 * Custom validators for specific business rules
 */
export const CustomValidators = {
  /**
   * Validates that a quantity value has appropriate precision for the unit
   */
  validateQuantityPrecision: (quantity: number, unit: 'g' | 'l' | 'szt'): boolean => {
    switch (unit) {
      case 'szt':
        // Items should be whole numbers
        return Number.isInteger(quantity);
      case 'g':
      case 'l':
        // Weight and volume can have decimals, already validated for 3 decimal places
        return true;
      default:
        return false;
    }
  },
  
  /**
   * Validates that expiration date is reasonable (not too far in future)
   */
  validateReasonableExpiryDate: (expiresAt: string): boolean => {
    const expiryDate = new Date(expiresAt);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10); // 10 years max
    
    return expiryDate <= maxDate;
  },
  
  /**
   * Validates product name doesn't contain harmful characters
   */
  validateSafeName: (name: string): boolean => {
    // Basic check for potentially harmful characters
    const dangerousPattern = /[<>\"'&]/;
    return !dangerousPattern.test(name);
  }
};

/**
 * Enhanced validation function with custom business rules
 * 
 * @param data - Product data to validate
 * @returns ValidationResult with additional business rule validation
 */
export function validateCreateUserProductWithBusinessRules(data: unknown): ValidationResult<z.infer<typeof CreateUserProductSchema>> {
  // First, run standard validation
  const standardValidation = validateCreateUserProduct(data);
  
  if (!standardValidation.success) {
    return standardValidation;
  }
  
  const validData = standardValidation.data;
  const additionalErrors: ValidationError[] = [];
  
  // Apply custom business rules
  if (!CustomValidators.validateQuantityPrecision(validData.quantity, validData.unit)) {
    additionalErrors.push({
      field: 'quantity',
      message: 'Items (szt) must be whole numbers',
      value: validData.quantity
    });
  }
  
  if (validData.expiresAt && !CustomValidators.validateReasonableExpiryDate(validData.expiresAt)) {
    additionalErrors.push({
      field: 'expiresAt',
      message: 'Expiration date cannot be more than 10 years in the future',
      value: validData.expiresAt
    });
  }
  
  if (!CustomValidators.validateSafeName(validData.name)) {
    additionalErrors.push({
      field: 'name',
      message: 'Product name contains invalid characters',
      value: validData.name
    });
  }
  
  if (additionalErrors.length > 0) {
    return {
      success: false,
      errors: additionalErrors
    };
  }
  
  return standardValidation;
}

/**
 * Enhanced validation function for updates with custom business rules
 */
export function validateUpdateUserProductWithBusinessRules(data: unknown): ValidationResult<z.infer<typeof UpdateUserProductSchema>> {
  return validateCreateUserProductWithBusinessRules(data); // Same rules apply
}