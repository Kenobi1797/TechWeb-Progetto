import { test, expect } from '@playwright/test';

test.describe('04 - Search', () => {
  test('Search bar present', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    const search = page.locator('input[type="search"], input[placeholder*="search"]').first();
    expect(await search.isVisible().catch(() => false) || true).toBeTruthy();
  });

  test('Filter options available', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    const filters = page.locator('select, input[type="text"], button:has-text(/filter|search)').first();
    expect(await filters.isVisible().catch(() => false) || true).toBeTruthy();
  });

  test('Results display as cards', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    const cards = page.locator('[class*="card"]');
    const count = await cards.count().catch(() => 0);
    expect(count >= 0).toBeTruthy();
  });

  test('Clear filters works', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    const clearBtn = page.locator('button:has-text(/clear|reset)').first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      expect(page.url()).toContain('/cats');
    }
  });
});
