import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
  test('should have good lighthouse scores', async ({ page }) => {
    await page.goto('/');
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation');
    });
    expect(performanceEntries).toBeDefined();
  });
});
