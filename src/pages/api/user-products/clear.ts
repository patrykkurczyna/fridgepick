import type { APIRoute } from "astro";
import { requireDemoFriendlyAuth } from "../../../middleware/auth";
import { HttpStatus, ErrorCode, ApiError, createErrorResponse } from "../../../middleware/errorHandler";

/**
 * DELETE /api/user-products/clear
 *
 * Deletes ALL products for the authenticated user.
 * Requires confirmation via query parameter.
 *
 * Query params:
 * - confirm=true (required for safety)
 *
 * Response:
 * Success (200): { success: true, deletedCount: number, message: string }
 * Error (400/401/500): { success: false, error: string }
 */
export const DELETE: APIRoute = async ({ locals, request, url }) => {
  const requestId = crypto.randomUUID();

  try {
    // Check confirmation parameter for safety
    const confirmed = url.searchParams.get("confirm") === "true";
    if (!confirmed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Wymagane potwierdzenie. Dodaj ?confirm=true do żądania.",
        }),
        {
          status: HttpStatus.BAD_REQUEST,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Authentication
    if (!locals.supabase) {
      throw new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.DATABASE_UNAVAILABLE,
        "Database connection not available"
      );
    }

    const user = await requireDemoFriendlyAuth(request, locals.supabase);

    console.info("Clear fridge: Starting deletion", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      isDemo: user.isDemo,
    });

    // Count products before deletion
    const { count: beforeCount, error: countError } = await locals.supabase
      .from("user_products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Clear fridge: Error counting products", {
        requestId,
        error: countError.message,
      });
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR, "Błąd podczas liczenia produktów");
    }

    const productCount = beforeCount || 0;

    if (productCount === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          deletedCount: 0,
          message: "Lodówka jest już pusta.",
        }),
        {
          status: HttpStatus.OK,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete all products for this user
    const { error: deleteError } = await locals.supabase.from("user_products").delete().eq("user_id", user.id);

    if (deleteError) {
      console.error("Clear fridge: Error deleting products", {
        requestId,
        error: deleteError.message,
        code: deleteError.code,
      });
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR, "Błąd podczas usuwania produktów");
    }

    console.info("Clear fridge: Successfully deleted all products", {
      requestId,
      userId: user.id.substring(0, 8) + "...",
      deletedCount: productCount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: productCount,
        message: `Usunięto ${productCount} ${productCount === 1 ? "produkt" : productCount < 5 ? "produkty" : "produktów"} z lodówki.`,
      }),
      {
        status: HttpStatus.OK,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
      }
    );
  } catch (error) {
    console.error("Clear fridge: Unexpected error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(error, requestId);
  }
};
