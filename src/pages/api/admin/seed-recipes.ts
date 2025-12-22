import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { SEED_RECIPES } from "@/data/seedRecipes";

/**
 * POST /api/admin/seed-recipes
 * Seeds the database with 40 recipes (10 per category)
 * Requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS
 *
 * Query params:
 * - force=true: Delete existing recipes before seeding
 *
 * Response:
 * Success (200): { success: true, recipesCount: number, ingredientsCount: number }
 * Error (400/500): { success: false, error: string }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    // Get env vars - support both Node.js and Cloudflare runtime
    const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
    const supabaseUrl =
      runtime?.env?.SUPABASE_URL || import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || "";
    const supabaseServiceRoleKey =
      runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseServiceRoleKey) {
      console.error("Seed recipes API: SUPABASE_SERVICE_ROLE_KEY is not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Brak uprawnień administratora. Skonfiguruj SUPABASE_SERVICE_ROLE_KEY.",
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

    // Check if recipes already exist
    const { count: existingCount } = await supabaseAdmin.from("recipes").select("id", { count: "exact", head: true });

    if (existingCount && existingCount > 0 && !force) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Baza zawiera już ${existingCount} przepisów. Użyj ?force=true aby nadpisać.`,
          existingCount,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If force mode, delete existing recipes (cascade will delete ingredients)
    if (force && existingCount && existingCount > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from("recipes")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        console.error("Failed to delete existing recipes:", deleteError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Nie udało się usunąć istniejących przepisów.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      console.info(`Deleted ${existingCount} existing recipes`);
    }

    let totalRecipes = 0;
    let totalIngredients = 0;

    // Insert recipes one by one to get their IDs for ingredients
    for (const recipe of SEED_RECIPES) {
      const { data: insertedRecipe, error: recipeError } = await supabaseAdmin
        .from("recipes")
        .insert({
          name: recipe.name,
          description: recipe.description,
          instructions: recipe.instructions,
          prep_time_minutes: recipe.prepTimeMinutes,
          servings: recipe.servings,
          meal_category: recipe.mealCategory,
          protein_type: recipe.proteinType,
          nutritional_values: recipe.nutritionalValues,
          is_active: true,
        })
        .select("id")
        .single();

      if (recipeError || !insertedRecipe) {
        console.error(`Failed to insert recipe "${recipe.name}":`, recipeError);
        continue;
      }

      totalRecipes++;

      // Insert ingredients for this recipe
      const ingredientsToInsert = recipe.ingredients.map((ingredient) => ({
        recipe_id: insertedRecipe.id,
        ingredient_name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        is_required: ingredient.isRequired,
      }));

      const { error: ingredientsError } = await supabaseAdmin.from("recipe_ingredients").insert(ingredientsToInsert);

      if (ingredientsError) {
        console.error(`Failed to insert ingredients for "${recipe.name}":`, ingredientsError);
      } else {
        totalIngredients += ingredientsToInsert.length;
      }
    }

    console.info(`Successfully seeded ${totalRecipes} recipes with ${totalIngredients} ingredients`);

    return new Response(
      JSON.stringify({
        success: true,
        recipesCount: totalRecipes,
        ingredientsCount: totalIngredients,
        message: `Dodano ${totalRecipes} przepisów z ${totalIngredients} składnikami.`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Seed recipes API error:", error);
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

/**
 * GET /api/admin/seed-recipes
 * Returns info about the seed recipes without inserting them
 */
export const GET: APIRoute = async () => {
  const categoryCounts = SEED_RECIPES.reduce(
    (acc, recipe) => {
      acc[recipe.mealCategory] = (acc[recipe.mealCategory] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const proteinCounts = SEED_RECIPES.reduce(
    (acc, recipe) => {
      acc[recipe.proteinType] = (acc[recipe.proteinType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return new Response(
    JSON.stringify({
      totalRecipes: SEED_RECIPES.length,
      totalIngredients: SEED_RECIPES.reduce((sum, r) => sum + r.ingredients.length, 0),
      byCategory: categoryCounts,
      byProteinType: proteinCounts,
      recipes: SEED_RECIPES.map((r) => ({
        name: r.name,
        category: r.mealCategory,
        proteinType: r.proteinType,
        prepTime: r.prepTimeMinutes,
        servings: r.servings,
        ingredientsCount: r.ingredients.length,
      })),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
