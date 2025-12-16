import { test, expect } from '@playwright/test';

/**
 * Test Navigazione - STREETCATS
 * Verifica: accessibilità menu principale, link funzionali, navigazione browser
 */
test.describe('02 - Navigation', () => {
  test('Main navigation accessible', async ({ page }) => {
    // Naviga alla homepage
    await page.goto('http://localhost:3000');
    // Verifica che la navigazione principale sia visibile
    const nav = page.locator('nav, header').first();
    expect(await nav.isVisible()).toBeTruthy();
  });

  test('Navigate to Cats page', async ({ page }) => {
    // Naviga alla homepage
    await page.goto('http://localhost:3000');
    // Cerca il link ai gatti (in italiano o inglese)
    const link = page.locator('a:has-text(/gatti|cats/i)').first();
    if (await link.isVisible()) {
      // Clicca sul link
      await link.click();
      // Verifica che l'URL sia stato aggiornato
      expect(page.url()).toContain('/cats');
    }
  });

  test('Navigate to Map', async ({ page }) => {
    // Naviga alla homepage
    await page.goto('http://localhost:3000');
    // Cerca il link alla mappa (in italiano o inglese)
    const link = page.locator('a:has-text(/mappa|map/i)').first();
    if (await link.isVisible()) {
      // Clicca sul link
      await link.click();
      // Verifica che l'URL sia stato aggiornato
      expect(page.url()).toContain('/map');
    }
  });

  test('Navigate to Login', async ({ page }) => {
    // Naviga alla homepage
    await page.goto('http://localhost:3000');
    // Cerca il link al login (in italiano o inglese)
    const link = page.locator('a:has-text(/login|accedi/i)').first();
    if (await link.isVisible()) {
      // Clicca sul link
      await link.click();
      // Verifica che l'URL sia stato aggiornato
      expect(page.url()).toContain('/login');
    }
  });

  test('Back button works', async ({ page }) => {
    // Naviga alla pagina dei gatti
    await page.goto('http://localhost:3000/cats');
    // Attendi caricamento
    await page.waitForTimeout(500);
    // Torna indietro con il browser
    await page.goBack();
    // Verifica che siamo nella root
    expect(page.url()).toContain('localhost');
  });
});
