import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Login page
 * Provides methods to interact with login form elements
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly homeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.rememberMeCheckbox = page.locator("#remember-me");
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator(".bg-red-50 p");
    this.forgotPasswordLink = page.locator('a[href="/auth/forgot-password"]');
    this.registerLink = page.locator('a[href="/auth/register"]');
    this.homeLink = page.locator('a[aria-label="FridgePick - Strona główna"]');
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto("/auth/login");
    // Wait for the form to be fully hydrated (React client:load)
    await this.emailInput.waitFor({ state: "visible" });
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.click();
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Toggle remember me checkbox
   */
  async toggleRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.click();
  }

  /**
   * Click submit button
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Perform login with given credentials
   */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.toggleRememberMe();
    }
    await this.submit();
  }

  /**
   * Wait for successful login (redirect to fridge page)
   */
  async waitForLoginSuccess(): Promise<void> {
    await this.page.waitForURL("**/fridge", { timeout: 10000 });
  }

  /**
   * Check if error message is visible
   */
  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.errorMessage.isVisible();
    if (isVisible) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Assert error message contains text
   */
  async expectError(text: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
    await expect(this.errorMessage).toContainText(text);
  }

  /**
   * Assert login page is loaded
   */
  async expectPageLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toContainText("Zaloguj się");
  }
}
