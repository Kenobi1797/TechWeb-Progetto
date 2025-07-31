import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to cats page', async ({ page }) => {
    await page.goto('/');
    await page.click('nav a[href="/cats"]');
    await expect(page).toHaveURL(/\/cats/);
  });

  test('should navigate to map page', async ({ page }) => {
    await page.goto('/');
    await page.click('nav a[href="/map"]');
    await expect(page).toHaveURL(/\/map/);
  });
});
