import { test, expect, TEST_USER, getFutureDate, getUniqueProductName } from "../fixtures";

/**
 * E2E tests for product management functionality
 * Tests adding products, viewing product list, editing, and deleting
 */
test.describe("Product Management", () => {
  // Login before each test in this suite
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await loginPage.waitForLoginSuccess();
  });

  test.describe("Fridge Page - Product List", () => {
    test("should display fridge page after login", async ({ fridgePage }) => {
      await fridgePage.expectPageLoaded();

      // Verify key elements are visible
      await expect(fridgePage.pageTitle).toBeVisible();
      await expect(fridgePage.addProductButton).toBeVisible();
    });

    test("should have add product button visible", async ({ fridgePage }) => {
      await fridgePage.waitForLoad();

      // Desktop button should be visible
      await expect(fridgePage.addProductButton).toBeVisible();
    });

    test("should navigate to add product page when clicking add button", async ({
      fridgePage,
      addProductPage,
      page,
    }) => {
      await fridgePage.waitForLoad();
      await fridgePage.clickAddProduct();

      // Verify navigation to add product page
      await expect(page).toHaveURL(/\/fridge\/add/);
      await addProductPage.expectAddMode();
    });

    test("should display product cards when products exist", async ({ fridgePage }) => {
      await fridgePage.waitForLoad();

      // If products exist, they should be displayed as cards
      const productCount = await fridgePage.getProductCount();
      if (productCount > 0) {
        await expect(fridgePage.productCards.first()).toBeVisible();
      }
    });

    test("should allow searching products", async ({ fridgePage }) => {
      await fridgePage.waitForLoad();

      // Search for a product
      await fridgePage.search("mleko");
      await fridgePage.page.waitForTimeout(500); // Wait for search to complete

      // Verify search was performed (no crash)
      await expect(fridgePage.searchInput).toHaveValue("mleko");
    });
  });

  test.describe("Add Product", () => {
    test("should display add product form correctly", async ({ fridgePage, addProductPage }) => {
      await fridgePage.waitForLoad();
      await fridgePage.clickAddProduct();

      await addProductPage.expectFormLoaded();
      await addProductPage.expectAddMode();
    });

    test("should show validation error when submitting empty form", async ({ fridgePage, addProductPage }) => {
      await fridgePage.waitForLoad();
      await fridgePage.clickAddProduct();
      await addProductPage.waitForLoad();

      // Form should have submit button disabled when form is empty/invalid
      await expect(addProductPage.saveButton).toBeDisabled();
    });

    test("should successfully add a new product", async ({ fridgePage, addProductPage }) => {
      const uniqueProductName = getUniqueProductName("E2E Mleko");
      const expiryDate = getFutureDate(7); // 7 days from now

      await fridgePage.waitForLoad();
      await fridgePage.clickAddProduct();
      await addProductPage.waitForLoad();

      // Fill the form
      await addProductPage.addProduct({
        name: uniqueProductName,
        category: "nabiał",
        quantity: "2",
        unit: "l",
        expiryDate: expiryDate,
      });

      // Wait for redirect back to fridge
      await addProductPage.waitForSaveSuccess();

      // Verify product appears in the list
      await fridgePage.waitForLoad();
      await fridgePage.expectProductExists(uniqueProductName);
    });

    test("should cancel adding product and return to fridge", async ({ fridgePage, addProductPage, page }) => {
      await fridgePage.waitForLoad();
      await fridgePage.clickAddProduct();
      await addProductPage.waitForLoad();

      // Fill some data
      await addProductPage.fillName("Test Product");

      // Cancel
      await addProductPage.cancel();

      // Should be back on fridge page
      await expect(page).toHaveURL(/\/fridge$/);
    });

    test("should add product without expiry date", async ({ fridgePage, addProductPage }) => {
      const uniqueProductName = getUniqueProductName("E2E Chleb bez daty");

      await fridgePage.waitForLoad();
      await fridgePage.clickAddProduct();
      await addProductPage.waitForLoad();

      // Fill the form without expiry date
      await addProductPage.fillName(uniqueProductName);
      await addProductPage.selectCategory("pieczywo");
      await addProductPage.fillQuantity("1");
      await addProductPage.selectUnit("szt");
      await addProductPage.submit();

      // Wait for redirect back to fridge
      await addProductPage.waitForSaveSuccess();

      // Verify product appears in the list
      await fridgePage.waitForLoad();
      await fridgePage.expectProductExists(uniqueProductName);
    });
  });

  test.describe("Product Operations", () => {
    // Create a product before these tests
    let testProductName: string;

    test.beforeEach(async ({ fridgePage, addProductPage }) => {
      testProductName = getUniqueProductName("E2E Test Operacje");

      await fridgePage.waitForLoad();
      await fridgePage.clickAddProduct();
      await addProductPage.waitForLoad();

      await addProductPage.addProduct({
        name: testProductName,
        category: "warzywa",
        quantity: "500",
        unit: "g",
        expiryDate: getFutureDate(5),
      });

      await addProductPage.waitForSaveSuccess();
      await fridgePage.waitForLoad();
    });

    test("should navigate to edit page when clicking edit button", async ({ fridgePage, addProductPage, page }) => {
      await fridgePage.editProduct(testProductName);

      // Should navigate to edit page
      await expect(page).toHaveURL(/\/fridge\/edit\//);
      await addProductPage.expectEditMode();
    });

    test("should delete product when clicking delete button", async ({ fridgePage, page }) => {
      // Set up dialog handler before triggering delete (handles both confirm and success alert)
      page.on("dialog", async (dialog) => {
        await dialog.accept();
      });

      // Delete the product
      await fridgePage.deleteProduct(testProductName);

      // Wait a moment for the deletion to complete and alert to be dismissed
      await page.waitForTimeout(2000);

      // Refresh to see updated list
      await fridgePage.goto();
      await fridgePage.waitForLoad();

      // Product should no longer exist
      await fridgePage.expectProductNotExists(testProductName);
    });
  });
});
