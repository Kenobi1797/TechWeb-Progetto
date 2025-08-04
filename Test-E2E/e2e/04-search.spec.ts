import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should perform search and display results', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[type="search"], input[placeholder*="cerca"]');
    await searchInput.fill('react');
    await searchInput.press('Enter');
    await page.waitForSelector('.search-results', { timeout: 5000 });
    await expect(page.locator('.search-results')).toBeVisible();
    const resultCount = await page.locator('.search-result-item').count();
    expect(resultCount).toBeGreaterThan(0);
  });
});
