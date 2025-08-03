import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form'), 'Il form di login non è visibile').toBeVisible();
    await expect(page.locator('input[name="username"]'), 'Il campo username non è visibile').toBeVisible();
    await expect(page.locator('input[name="password"]'), 'Il campo password non è visibile').toBeVisible();
  });

  test('should show register form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('form'), 'Il form di registrazione non è visibile').toBeVisible();
    await expect(page.locator('input[name="username"]'), 'Il campo username non è visibile').toBeVisible();
    await expect(page.locator('input[name="password"]'), 'Il campo password non è visibile').toBeVisible();
  });
});
