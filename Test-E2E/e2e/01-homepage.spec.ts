import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test('should load homepage correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Home/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});
