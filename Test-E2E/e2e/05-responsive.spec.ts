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
      
      // Verifica che i filtri siano accessibili nella pagina gatti
      await page.getByRole('link', { name: /gatti/i }).click();
      await expect(page.getByText('🔍 Filtri di ricerca')).toBeVisible();
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
    const viewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Verifica che la mappa si adatti al viewport
      const mapContainer = page.locator('.leaflet-container, .map-container, [data-testid="map"]');
      
      if (await mapContainer.count() > 0) {
        await expect(mapContainer).toBeVisible();
        
        const mapBox = await mapContainer.boundingBox();
        if (mapBox) {
          expect(mapBox.width).toBeGreaterThan(0);
          expect(mapBox.height).toBeGreaterThan(0);
          
          // Verifica che la mappa non superi la larghezza del viewport
          expect(mapBox.width).toBeLessThanOrEqual(viewport.width);
        }
      } else {
        console.log(`Map container not found for viewport ${viewport.width}x${viewport.height}`);
      }
    }
  });
});
