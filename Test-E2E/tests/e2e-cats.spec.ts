import { test, expect } from '@playwright/test';

test.describe('Cats Page', () => {
  test('should display cat grid', async ({ page }) => {
    await page.goto('/cats');
    await expect(page.locator('h1')).toHaveText(/Gatti/);
    const count = await page.locator('.cat-card').count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open cat details', async ({ page }) => {
    await page.goto('/cats');
    const firstCat = page.locator('.cat-card').first();
    await firstCat.click();
    await expect(page).toHaveURL(/\/cats\//);
    await expect(page.locator('h2')).toBeVisible();
  });
});
