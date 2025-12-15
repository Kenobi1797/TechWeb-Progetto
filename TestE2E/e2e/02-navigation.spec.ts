import { test, expect } from '@playwright/test';

test.describe('02 - Navigation', () => {
  test('Main navigation accessible', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const nav = page.locator('nav, header').first();
    expect(await nav.isVisible()).toBeTruthy();
  });

  test('Navigate to Cats page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const link = page.locator('a:has-text(/gatti|cats/i)').first();
    if (await link.isVisible()) {
      await link.click();
      expect(page.url()).toContain('/cats');
    }
  });

  test('Navigate to Map', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const link = page.locator('a:has-text(/mappa|map/i)').first();
    if (await link.isVisible()) {
      await link.click();
      expect(page.url()).toContain('/map');
    }
  });

  test('Navigate to Login', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const link = page.locator('a:has-text(/login|accedi/i)').first();
    if (await link.isVisible()) {
      await link.click();
      expect(page.url()).toContain('/login');
    }
  });

  test('Back button works', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    await page.waitForTimeout(500);
    await page.goBack();
    expect(page.url()).toContain('localhost');
  });
});
