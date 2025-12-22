import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Fridge (product list) page
 * Provides methods to interact with product list and perform CRUD operations
 */
export class FridgePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addProductButton: Locator;
  readonly addProductButtonMobile: Locator;
  readonly searchInput: Locator;
  readonly productCards: Locator;
  readonly emptyState: Locator;
  readonly loadingSkeleton: Locator;
  readonly errorState: Locator;
  readonly pagination: Locator;
  readonly sortControls: Locator;
  readonly quickAddPanel: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("h1:has-text('Moja Lodówka')");
    this.addProductButton = page.locator("button:has-text('Dodaj produkt')").first();
    this.addProductButtonMobile = page.locator('button[aria-label="Dodaj produkt"]');
    this.searchInput = page.locator('input[placeholder*="Szukaj"]');
    this.productCards = page.locator(".product-card");
    this.emptyState = page.locator("text=Twoja lodówka jest pusta");
    this.loadingSkeleton = page.locator(".animate-pulse");
    this.errorState = page.locator("text=Wystąpił błąd");
    this.pagination = page.locator(".pagination");
    this.sortControls = page.locator("select").first();
    this.quickAddPanel = page.locator("text=Szybkie dodawanie");
    this.userMenu = page.locator('[class*="user-menu"]');
  }

  /**
   * Navigate to fridge page
   */
  async goto(): Promise<void> {
    await this.page.goto("/fridge");
  }

  /**
   * Click add product button (desktop)
   */
  async clickAddProduct(): Promise<void> {
    await this.addProductButton.click();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad(): Promise<void> {
    // Wait for either products to load or empty state to appear
    await this.page.waitForLoadState("networkidle");
    // Wait for loading skeleton to disappear
    await expect(this.loadingSkeleton.first()).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Search for products
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // Debounce
  }

  /**
   * Clear search input
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  /**
   * Get count of visible product cards
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * Find product by name
   */
  getProductByName(name: string): Locator {
    return this.page.locator(`.product-card:has-text("${name}")`);
  }

  /**
   * Click edit button on product card
   */
  async editProduct(productName: string): Promise<void> {
    const productCard = this.getProductByName(productName);
    await productCard.locator('button[aria-label="Edytuj produkt"]').click();
  }

  /**
   * Click delete button on product card
   */
  async deleteProduct(productName: string): Promise<void> {
    const productCard = this.getProductByName(productName);
    await productCard.locator('button[aria-label="Usuń produkt"]').click();
  }

  /**
   * Confirm deletion in dialog
   */
  async confirmDelete(): Promise<void> {
    this.page.on("dialog", (dialog) => dialog.accept());
  }

  /**
   * Cancel deletion in dialog
   */
  async cancelDelete(): Promise<void> {
    this.page.on("dialog", (dialog) => dialog.dismiss());
  }

  /**
   * Assert page is loaded
   */
  async expectPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.addProductButton).toBeVisible();
  }

  /**
   * Assert empty state is visible
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Assert product exists in list
   */
  async expectProductExists(productName: string): Promise<void> {
    await expect(this.getProductByName(productName)).toBeVisible();
  }

  /**
   * Assert product does not exist in list
   */
  async expectProductNotExists(productName: string): Promise<void> {
    await expect(this.getProductByName(productName)).not.toBeVisible();
  }

  /**
   * Assert minimum number of products visible
   */
  async expectMinProducts(count: number): Promise<void> {
    await expect(this.productCards.first()).toBeVisible();
    const actualCount = await this.getProductCount();
    expect(actualCount).toBeGreaterThanOrEqual(count);
  }
}
