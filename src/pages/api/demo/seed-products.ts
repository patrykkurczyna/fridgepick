import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { DEMO_PRODUCTS } from "@/data/demoProducts";

/**
 * POST /api/demo/seed-products
 * Seeds demo products for the current demo user
 * Only works for demo users (is_demo: true in user metadata)
 *
 * Response:
 * Success (200): { success: true, count: number, message: string }
 * Error (400/401/500): { success: false, error: string }
 */
export const POST: APIRoute = async ({ locals }) => {
  try {
    // Check if user is authenticated
    const {
      data: { session },
    } = await locals.supabase.auth.getSession();

    if (!session?.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Musisz być zalogowany, aby wygenerować produkty demo.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user is a demo user
    const isDemo = session.user.user_metadata?.is_demo === true;
    if (!isDemo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Ta funkcja jest dostępna tylko dla użytkowników demo.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = session.user.id;

    // Get env vars - support both Node.js and Cloudflare runtime
    const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
    const supabaseUrl =
      runtime?.env?.SUPABASE_URL || import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || "";
    const supabaseServiceRoleKey =
      runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseServiceRoleKey) {
      console.error("Seed products API: SUPABASE_SERVICE_ROLE_KEY is not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Funkcja generowania produktów jest tymczasowo niedostępna.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already has products
    const { count: existingCount } = await supabaseAdmin
      .from("user_products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (existingCount && existingCount > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Masz już ${existingCount} produktów w lodówce. Usuń je najpierw, aby wygenerować nowe.`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch all categories to map names to IDs
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from("product_categories")
      .select("id, name");

    if (categoriesError || !categories) {
      console.error("Failed to fetch categories for demo seeding:", categoriesError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nie udało się pobrać kategorii produktów.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a map of category name to ID
    const categoryMap = new Map<string, number>();
    for (const cat of categories) {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    }

    // Calculate expiry dates and prepare products for insertion
    const now = new Date();
    const productsToInsert = DEMO_PRODUCTS.map((product) => {
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + product.expiresInDays);

      const categoryId = categoryMap.get(product.category.toLowerCase());
      if (!categoryId) {
        console.warn(`Category not found for demo product: ${product.name} (${product.category})`);
      }

      return {
        user_id: userId,
        category_id: categoryId || 1, // Fallback to first category if not found
        name: product.name,
        quantity: product.quantity,
        unit: product.unit,
        expires_at: expiresAt.toISOString().split("T")[0], // Date only
      };
    }).filter((p) => p.category_id); // Filter out products without valid category

    // Insert products
    const { error: insertError } = await supabaseAdmin.from("user_products").insert(productsToInsert);

    if (insertError) {
      console.error("Failed to insert demo products:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nie udało się dodać produktów demo.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.info(`Successfully seeded ${productsToInsert.length} demo products for user ${userId.substring(0, 8)}...`);

    return new Response(
      JSON.stringify({
        success: true,
        count: productsToInsert.length,
        message: `Dodano ${productsToInsert.length} przykładowych produktów do Twojej lodówki!`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Seed products API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił błąd serwera. Spróbuj ponownie później.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
