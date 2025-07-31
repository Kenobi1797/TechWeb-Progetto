import { test, expect } from '@playwright/test';

test.describe('Map', () => {
  test('should show map page', async ({ page }) => {
    await page.goto('/map');
    await expect(page.locator('#map')).toBeVisible();
  });

  test('should show markers', async ({ page }) => {
    await page.goto('/map');
    const count = await page.locator('.leaflet-marker-icon').count();
    expect(count).toBeGreaterThan(0);
  });
});
