import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const testUserId = process.env.E2E_USERNAME_ID || "";

/**
 * Global teardown function for Playwright tests
 * Cleans up test data created during E2E test runs
 *
 * This function:
 * 1. Connects to Supabase database
 * 2. Deletes all products created by the test user that start with "E2E"
 * 3. Logs the cleanup results
 */
async function globalTeardown(): Promise<void> {
  console.log("\n🧹 Starting E2E test cleanup...\n");

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  Supabase credentials not found. Skipping cleanup.");
    return;
  }

  if (!testUserId) {
    console.warn("⚠️  Test user ID not found. Skipping cleanup.");
    return;
  }

  try {
    // Create Supabase client for cleanup
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete all products created by test user that start with "E2E"
    // This ensures we only clean up test data, not real user data
    const { data: deletedProducts, error: deleteError } = await supabase
      .from("user_products")
      .delete()
      .eq("user_id", testUserId)
      .like("name", "E2E%")
      .select("id, name");

    if (deleteError) {
      console.error("❌ Error deleting test products:", deleteError.message);
      return;
    }

    const deletedCount = deletedProducts?.length || 0;

    if (deletedCount > 0) {
      console.log(`✅ Deleted ${deletedCount} test products:`);
      deletedProducts?.forEach((product) => {
        console.log(`   - ${product.name} (${product.id})`);
      });
    } else {
      console.log("ℹ️  No test products to clean up.");
    }

    console.log("\n🎉 E2E test cleanup completed successfully!\n");
  } catch (error) {
    console.error("❌ Unexpected error during cleanup:", error);
  }
}

export default globalTeardown;
