import { test, expect } from '@playwright/test';

test.describe('Header', () => {
  test('should show header', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should show site logo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header img')).toBeVisible();
  });
});
