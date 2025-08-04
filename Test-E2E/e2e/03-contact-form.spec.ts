import { test, expect } from '@playwright/test';

test.describe('Contact Form Tests', () => {
  test('should submit contact form successfully', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'mario.rossi@example.com');
    await page.fill('textarea[name="message"]', 'Questo è un messaggio di test');
    await page.click('button[type="submit"]');
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('inviato con successo');
  });
  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/contact');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('input[name="name"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
  });
});
