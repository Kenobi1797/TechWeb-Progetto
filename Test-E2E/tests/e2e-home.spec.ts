import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should show homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
  });

  test('should show navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    const count = await page.locator('a').count();
    expect(count).toBeGreaterThan(2);
  });
});
