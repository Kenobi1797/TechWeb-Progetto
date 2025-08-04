import { Page, expect } from '@playwright/test';

export class PageHelper {
  constructor(private page: Page) {}

  async login(email: string = 'test@example.com', password: string = 'password123') {
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/dashboard');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  async checkNoJSErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await this.page.waitForTimeout(1000);
    return errors;
  }

  async takeScreenshotOnFailure(testName: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${testName}-${Date.now()}.png`,
      fullPage: true
    });
  }

  async validateFormField(selector: string, expectedError: string) {
    const field = this.page.locator(selector);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    const errorElement = this.page.locator(`${selector} + .error, [data-error-for="${selector}"]`);
    await expect(errorElement).toContainText(expectedError);
  }

  async testResponsiveBreakpoints() {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
    for (const bp of breakpoints) {
      await this.page.setViewportSize({ width: bp.width, height: bp.height });
      await expect(this.page.locator('main')).toBeVisible();
      await this.page.waitForTimeout(500);
    }
  }
}
