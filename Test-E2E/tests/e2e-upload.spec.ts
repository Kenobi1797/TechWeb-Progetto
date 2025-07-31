import { test, expect } from '@playwright/test';

test.describe('Upload', () => {
  test('should show upload form', async ({ page }) => {
    await page.goto('/upload');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
  });

  test('should not upload without file', async ({ page }) => {
    await page.goto('/upload');
    await page.locator('form').click();
    await expect(page.locator('.error')).toBeVisible();
  });
});
