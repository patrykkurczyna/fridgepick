/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";
import { LoginPage, FridgePage, AddProductPage } from "./pages";

/**
 * Test fixtures for FridgePick E2E tests
 * Provides page objects and test data
 */

// Test user credentials from environment
export const TEST_USER = {
  id: process.env.E2E_USERNAME_ID || "",
  email: process.env.E2E_USERNAME || "e2etests@example.com",
  password: process.env.E2E_PASSWORD || "e2etests",
};

// Test data for products
export const TEST_PRODUCTS = {
  milk: {
    name: "E2E Mleko testowe",
    category: "Nabiał",
    quantity: "1",
    unit: "l" as const,
  },
  bread: {
    name: "E2E Chleb testowy",
    category: "Pieczywo",
    quantity: "1",
    unit: "szt" as const,
  },
  chicken: {
    name: "E2E Kurczak testowy",
    category: "Mięso",
    quantity: "500",
    unit: "g" as const,
  },
};

// Extended test with page objects
interface Fixtures {
  loginPage: LoginPage;
  fridgePage: FridgePage;
  addProductPage: AddProductPage;
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  fridgePage: async ({ page }, use) => {
    await use(new FridgePage(page));
  },
  addProductPage: async ({ page }, use) => {
    await use(new AddProductPage(page));
  },
});

export { expect } from "@playwright/test";

/**
 * Helper function to generate future date for expiry
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

/**
 * Helper function to generate unique product name for tests
 */
export function getUniqueProductName(baseName: string): string {
  const timestamp = Date.now();
  return `${baseName} ${timestamp}`;
}
