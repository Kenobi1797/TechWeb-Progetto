import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('should work consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    if (browserName === 'webkit') {
      await expect(page.locator('nav')).toBeVisible();
    }
    const gridSupport = await page.evaluate(() => {
      return CSS.supports('display', 'grid');
    });
    expect(gridSupport).toBe(true);
  });
  test('should handle browser-specific features', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('test', 'value');
    });
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test');
    });
    expect(storedValue).toBe('value');
  });
});
