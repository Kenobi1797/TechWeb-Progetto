import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  test('should load data from API', async ({ page }) => {
    await page.route('**/api/data', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ])
      });
    });
    await page.goto('/data');
    await expect(page.locator('.data-item')).toHaveCount(2);
    await expect(page.locator('.data-item').first()).toContainText('Item 1');
  });
  // Test rimossi: pagina data/API integration non più testata
});
