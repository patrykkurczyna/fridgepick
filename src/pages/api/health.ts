import type { APIRoute } from "astro";
import { ProductCategoryRepository } from "../../repositories/ProductCategoryRepository";
import { HttpStatus, withTimeout } from "../../middleware/errorHandler";

/**
 * Health check endpoint interface
 */
interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "pass" | "fail";
      responseTime?: number;
      error?: string;
    };
    productCategories: {
      status: "pass" | "fail";
      responseTime?: number;
      count?: number;
      error?: string;
    };
  };
}

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and load balancer status checks.
 * Performs basic connectivity and functionality tests.
 *
 * Returns:
 * - 200 OK: All systems healthy
 * - 200 OK with degraded status: Some non-critical issues
 * - 503 Service Unavailable: Critical systems failing
 */
export const GET: APIRoute = async ({ locals }) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.info("Health check started", { timestamp });

  // Initialize health check result
  const healthCheck: HealthCheckResult = {
    status: "healthy",
    timestamp,
    version: "1.0.0", // Could be read from package.json in real implementation
    uptime: process.uptime(),
    checks: {
      database: { status: "pass" },
      productCategories: { status: "pass" },
    },
  };

  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  // Database connectivity check
  try {
    if (!locals.supabase) {
      throw new Error("Supabase client not available");
    }

    const dbCheckStart = Date.now();

    // Simple query to test database connectivity
    const { error } = await withTimeout(
      locals.supabase.from("product_categories").select("count", { count: "exact", head: true }),
      3000,
      "Database health check timeout"
    );

    const dbResponseTime = Date.now() - dbCheckStart;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    healthCheck.checks.database = {
      status: "pass",
      responseTime: dbResponseTime,
    };

    console.debug("Database health check passed", { responseTime: dbResponseTime });
  } catch {
    healthCheck.checks.database = {
      status: "fail",
      error: error instanceof Error ? error.message : String(error),
    };
    overallStatus = "unhealthy";

    console.error("Database health check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Product categories functionality check
  try {
    if (locals.supabase && healthCheck.checks.database.status === "pass") {
      const categoryCheckStart = Date.now();

      const repository = new ProductCategoryRepository(locals.supabase);
      const categories = await withTimeout(repository.findAll(), 2000, "Product categories health check timeout");

      const categoryResponseTime = Date.now() - categoryCheckStart;

      healthCheck.checks.productCategories = {
        status: "pass",
        responseTime: categoryResponseTime,
        count: categories.length,
      };

      console.debug("Product categories health check passed", {
        responseTime: categoryResponseTime,
        count: categories.length,
      });
    } else {
      // Skip if database check failed
      healthCheck.checks.productCategories = {
        status: "fail",
        error: "Skipped due to database failure",
      };
    }
  } catch {
    healthCheck.checks.productCategories = {
      status: "fail",
      error: error instanceof Error ? error.message : String(error),
    };

    // Product categories failure is less critical than database
    if (overallStatus === "healthy") {
      overallStatus = "degraded";
    }

    console.warn("Product categories health check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Set overall status
  healthCheck.status = overallStatus;

  const totalResponseTime = Date.now() - startTime;

  console.info("Health check completed", {
    status: overallStatus,
    responseTime: `${totalResponseTime}ms`,
    databaseStatus: healthCheck.checks.database.status,
    categoriesStatus: healthCheck.checks.productCategories.status,
  });

  // Determine HTTP status code
  let httpStatus: number;
  switch (overallStatus) {
    case "healthy":
      httpStatus = HttpStatus.OK;
      break;
    case "degraded":
      httpStatus = HttpStatus.OK; // Still return 200 for degraded
      break;
    case "unhealthy":
      httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
      break;
  }

  return new Response(JSON.stringify(healthCheck, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Response-Time": `${totalResponseTime}ms`,
      // Security headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
  });
};

/**
 * HEAD /api/health
 *
 * Lightweight health check for load balancers that only need status codes.
 * Returns only headers without body for faster response.
 */
export const HEAD: APIRoute = async ({ locals }) => {
  try {
    // Quick database connectivity check
    if (!locals.supabase) {
      return new Response(null, { status: HttpStatus.SERVICE_UNAVAILABLE });
    }

    // Simple ping to database with short timeout
    const { error } = await withTimeout(
      locals.supabase.from("product_categories").select("count", { count: "exact", head: true }),
      1000,
      "Quick health check timeout"
    );

    if (error) {
      return new Response(null, { status: HttpStatus.SERVICE_UNAVAILABLE });
    }

    return new Response(null, {
      status: HttpStatus.OK,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    console.error("Quick health check failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return new Response(null, { status: HttpStatus.SERVICE_UNAVAILABLE });
  }
};
