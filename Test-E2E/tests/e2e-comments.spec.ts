import { test, expect } from '@playwright/test';

test.describe('Comments', () => {
  test('should show comments on cat page', async ({ page }) => {
    await page.goto('/cats');
    const firstCat = page.locator('.cat-card').first();
    await firstCat.click();
    await expect(page.locator('.comment-list')).toBeVisible();
  });

  test('should add a comment', async ({ page }) => {
    await page.goto('/cats');
    const firstCat = page.locator('.cat-card').first();
    await firstCat.click();
    await page.fill('textarea[name="comment"]', 'Test comment');
    await page.click('button[type="submit"]');
    await expect(page.locator('.comment-list')).toContainText('Test comment');
  });
});
