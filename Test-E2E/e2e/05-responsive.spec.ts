import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests - STREETCATS', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`should display correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Verifica che gli elementi principali siano visibili
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
      
      // Verifica che la mappa sia responsiva (se presente)
      const mapContainer = page.locator('.leaflet-container, .map-container, [class*="map"]');
      if (await mapContainer.count() > 0) {
        await expect(mapContainer.first()).toBeVisible();
      }
      
      // Verifica che le card dei gatti si adattino al viewport
      const catCards = page.locator('.cat-card');
      if (await catCards.count() > 0) {
        await expect(catCards.first()).toBeVisible();
        
        // Su mobile, verifica che le card siano in colonna singola
        if (viewport.width <= 640) {
          const cardWidth = await catCards.first().boundingBox();
          if (cardWidth) {
            expect(cardWidth.width).toBeGreaterThan(viewport.width * 0.8);
          }
        }
      }
      
      // Verifica che il campo di ricerca sia accessibile
      await expect(page.locator('input[type="search"]')).toBeVisible();
    });
  }

  test('should handle navigation menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Su mobile, il menu potrebbe essere nascosto in un hamburger
    const hamburgerMenu = page.locator('button').filter({ hasText: /menu|☰|≡/ });
    if (await hamburgerMenu.count() > 0) {
      await hamburgerMenu.click();
      
      // Verifica che il menu si apra
      await expect(page.locator('nav, .menu')).toBeVisible();
    }
  });

  test('should display map responsively', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/map');
      
      // Verifica che la mappa si adatti al viewport
      const mapContainer = page.locator('.leaflet-container');
      await expect(mapContainer).toBeVisible();
      
      const mapBox = await mapContainer.boundingBox();
      if (mapBox) {
        expect(mapBox.width).toBeLessThanOrEqual(viewport.width);
        expect(mapBox.height).toBeGreaterThan(200); // Altezza minima
      }
    }
  });
});
