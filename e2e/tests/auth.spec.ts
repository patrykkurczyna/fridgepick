import { test, expect, TEST_USER } from "../fixtures";

/**
 * E2E tests for authentication functionality
 * Tests login flow with valid and invalid credentials
 */
test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test("should display login form correctly", async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.expectPageLoaded();

      // Verify all form elements are visible
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.rememberMeCheckbox).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
      await expect(loginPage.forgotPasswordLink).toBeVisible();
      await expect(loginPage.registerLink).toBeVisible();
    });

    test("should show validation error for empty email", async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.fillPassword("somepassword");
      await loginPage.submit();

      // HTML5 validation should prevent submission
      const emailInput = loginPage.emailInput;
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });

    test("should show error for invalid credentials", async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login("invalid@example.com", "wrongpassword123");

      // Wait for error message (case-sensitive match)
      await loginPage.expectError("Nieprawidłowy email lub hasło");
    });

    test("should show error for short password", async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.fillEmail(TEST_USER.email);
      await loginPage.fillPassword("short");
      await loginPage.submit();

      // Wait for client-side validation error
      await loginPage.expectError("minimum 8 znaków");
    });

    test("should login successfully with valid credentials", async ({ loginPage, fridgePage }) => {
      await loginPage.goto();
      await loginPage.login(TEST_USER.email, TEST_USER.password);

      // Wait for redirect to fridge page
      await loginPage.waitForLoginSuccess();

      // Verify we're on the fridge page
      await fridgePage.expectPageLoaded();
    });

    test("should navigate to register page", async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.registerLink.click();

      await expect(page).toHaveURL(/\/auth\/register/);
    });

    test("should navigate to forgot password page", async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.forgotPasswordLink.click();

      await expect(page).toHaveURL(/\/auth\/forgot-password/);
    });

    test("should navigate back to home page", async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.homeLink.click();

      await expect(page).toHaveURL("/");
    });
  });
});
