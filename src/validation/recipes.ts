import type { RecipesQueryParams } from "../types";

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data: T;
  errors: ValidationError[];
}

/**
 * Validation error type
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valid meal categories
 */
const VALID_MEAL_CATEGORIES = ["śniadanie", "obiad", "kolacja", "przekąska"] as const;

/**
 * Valid protein types
 */
const VALID_PROTEIN_TYPES = ["ryba", "drób", "czerwone mięso", "vege"] as const;

/**
 * Valid sort options
 */
const VALID_SORT_OPTIONS = ["name", "prep_time", "created_at"] as const;

/**
 * Validates and parses recipes query parameters
 *
 * @param params - Raw query parameters object
 * @returns ValidationResult<RecipesQueryParams> Validated parameters
 */
export function validateRecipesQuery(params: Record<string, string | undefined>): ValidationResult<RecipesQueryParams> {
  const errors: ValidationError[] = [];
  const data: RecipesQueryParams = {};

  // Validate search
  if (params.search !== undefined) {
    const search = params.search.trim();
    if (search.length > 100) {
      errors.push({
        field: "search",
        message: "Search query must be at most 100 characters",
      });
    } else {
      data.search = search;
    }
  }

  // Validate meal_category
  if (params.meal_category !== undefined) {
    if (!VALID_MEAL_CATEGORIES.includes(params.meal_category as (typeof VALID_MEAL_CATEGORIES)[number])) {
      errors.push({
        field: "meal_category",
        message: `Invalid meal category. Must be one of: ${VALID_MEAL_CATEGORIES.join(", ")}`,
      });
    } else {
      data.meal_category = params.meal_category as (typeof VALID_MEAL_CATEGORIES)[number];
    }
  }

  // Validate protein_type
  if (params.protein_type !== undefined) {
    if (!VALID_PROTEIN_TYPES.includes(params.protein_type as (typeof VALID_PROTEIN_TYPES)[number])) {
      errors.push({
        field: "protein_type",
        message: `Invalid protein type. Must be one of: ${VALID_PROTEIN_TYPES.join(", ")}`,
      });
    } else {
      data.protein_type = params.protein_type as (typeof VALID_PROTEIN_TYPES)[number];
    }
  }

  // Validate max_prep_time
  if (params.max_prep_time !== undefined) {
    const maxTime = parseInt(params.max_prep_time, 10);
    if (isNaN(maxTime) || maxTime <= 0) {
      errors.push({
        field: "max_prep_time",
        message: "max_prep_time must be a positive integer",
      });
    } else if (maxTime > 1440) {
      errors.push({
        field: "max_prep_time",
        message: "max_prep_time must be at most 1440 minutes (24 hours)",
      });
    } else {
      data.max_prep_time = maxTime;
    }
  }

  // Validate sort
  if (params.sort !== undefined) {
    if (!VALID_SORT_OPTIONS.includes(params.sort as (typeof VALID_SORT_OPTIONS)[number])) {
      errors.push({
        field: "sort",
        message: `Invalid sort option. Must be one of: ${VALID_SORT_OPTIONS.join(", ")}`,
      });
    } else {
      data.sort = params.sort;
    }
  }

  // Validate limit
  if (params.limit !== undefined) {
    const limit = parseInt(params.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      errors.push({
        field: "limit",
        message: "limit must be a positive integer",
      });
    } else if (limit > 100) {
      errors.push({
        field: "limit",
        message: "limit must be at most 100",
      });
    } else {
      data.limit = limit;
    }
  }

  // Validate offset
  if (params.offset !== undefined) {
    const offset = parseInt(params.offset, 10);
    if (isNaN(offset) || offset < 0) {
      errors.push({
        field: "offset",
        message: "offset must be a non-negative integer",
      });
    } else {
      data.offset = offset;
    }
  }

  return {
    success: errors.length === 0,
    data,
    errors,
  };
}

/**
 * Formats validation errors for API response
 *
 * @param errors - Array of validation errors
 * @returns Record<string, unknown> Formatted errors object
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, unknown> {
  return {
    validationErrors: errors.map((e) => ({
      field: e.field,
      message: e.message,
    })),
  };
}
