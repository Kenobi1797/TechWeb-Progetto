import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should navigate through main menu', async ({ page }) => {
    await page.goto('/');
    const navLinks = [
      { text: 'Home', url: '/' },
      { text: 'About', url: '/about' },
      { text: 'Services', url: '/services' },
      { text: 'Contact', url: '/contact' }
    ];
    for (const link of navLinks) {
      await page.click(`nav a:has-text("${link.text}")`);
      await expect(page).toHaveURL(new RegExp(link.url));
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});
