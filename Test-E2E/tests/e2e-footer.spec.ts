import { test, expect } from '@playwright/test';

test.describe('Footer', () => {
  test('should show footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should show copyright', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toContainText('Copyright');
  });
});
