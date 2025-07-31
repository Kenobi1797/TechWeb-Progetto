import { test, expect } from '@playwright/test';

test.describe('Register', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.success')).toBeVisible();
  });

  test('should show error for duplicate user', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible();
  });
});
