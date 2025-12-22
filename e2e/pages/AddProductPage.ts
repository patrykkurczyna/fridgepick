import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for Add/Edit Product page
 * Provides methods to interact with product form
 */
export class AddProductPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly backButton: Locator;
  readonly nameInput: Locator;
  readonly categoryDropdown: Locator;
  readonly quantityInput: Locator;
  readonly unitSelector: Locator;
  readonly expiryDateInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;
  readonly errorMessage: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator(".page-header h1, h1.text-2xl").first();
    this.backButton = page.locator("text=Powrót do lodówki");
    this.nameInput = page.locator('input[placeholder="np. Mleko 2%"]');
    this.categoryDropdown = page.locator("select").first();
    this.quantityInput = page.locator('input[type="number"]');
    this.unitSelector = page.locator("select").nth(1); // Second select is unit
    this.expiryDateInput = page.locator('input[placeholder="Data ważności produktu"], input[type="date"]');
    this.saveButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Anuluj")');
    this.deleteButton = page.locator('button:has-text("Usuń")');
    this.errorMessage = page.locator(".bg-red-50");
    this.validationError = page.locator(".text-red-600, .text-red-500");
  }

  /**
   * Navigate to add product page
   */
  async goto(): Promise<void> {
    await this.page.goto("/fridge/add");
  }

  /**
   * Navigate to edit product page
   */
  async gotoEdit(productId: string): Promise<void> {
    await this.page.goto(`/fridge/edit/${productId}`);
  }

  /**
   * Wait for form to be loaded including category options
   */
  async waitForLoad(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
    await expect(this.saveButton).toBeVisible();
    // Wait for categories to load (at least 2 options: placeholder + 1 category)
    await this.page.waitForFunction(
      () => {
        const select = document.querySelector("select");
        return select && select.options.length >= 2;
      },
      { timeout: 10000 }
    );
  }

  /**
   * Fill product name
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * Select category by visible text
   */
  async selectCategory(category: string): Promise<void> {
    await this.categoryDropdown.selectOption({ label: category });
  }

  /**
   * Fill quantity
   */
  async fillQuantity(quantity: string | number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  /**
   * Select unit (g, l, szt)
   */
  async selectUnit(unit: "g" | "l" | "szt"): Promise<void> {
    // Unit selector is a dropdown, select by value
    await this.unitSelector.selectOption({ value: unit });
  }

  /**
   * Fill expiry date
   */
  async fillExpiryDate(date: string): Promise<void> {
    await this.expiryDateInput.fill(date);
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * Cancel and go back
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Delete product (only in edit mode)
   */
  async delete(): Promise<void> {
    await this.deleteButton.click();
  }

  /**
   * Add a product with all fields
   */
  async addProduct(options: {
    name: string;
    category: string;
    quantity: string | number;
    unit: "g" | "l" | "szt";
    expiryDate?: string;
  }): Promise<void> {
    await this.fillName(options.name);
    await this.selectCategory(options.category);
    await this.fillQuantity(options.quantity);
    await this.selectUnit(options.unit);
    if (options.expiryDate) {
      await this.fillExpiryDate(options.expiryDate);
    }
    await this.submit();
  }

  /**
   * Wait for successful save (redirect to fridge)
   */
  async waitForSaveSuccess(): Promise<void> {
    await this.page.waitForURL("**/fridge", { timeout: 10000 });
  }

  /**
   * Assert page title
   */
  async expectPageTitle(title: string): Promise<void> {
    await expect(this.pageTitle).toContainText(title);
  }

  /**
   * Assert add mode
   */
  async expectAddMode(): Promise<void> {
    await expect(this.pageTitle).toContainText("Dodaj nowy produkt");
  }

  /**
   * Assert edit mode
   */
  async expectEditMode(): Promise<void> {
    await expect(this.pageTitle).toContainText("Edytuj produkt");
  }

  /**
   * Assert validation error is visible
   */
  async expectValidationError(): Promise<void> {
    await expect(this.validationError.first()).toBeVisible();
  }

  /**
   * Assert form is loaded
   */
  async expectFormLoaded(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
    await expect(this.categoryDropdown).toBeVisible();
    await expect(this.quantityInput).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }
}
