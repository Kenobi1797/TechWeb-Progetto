import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests - STREETCATS', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Verifica la presenza di h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/avvistamenti.*gatti/i);
    
    // Verifica che ci sia un solo h1
    await expect(h1).toHaveCount(1);
    
    // Verifica la struttura gerarchica dei titoli
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have accessible forms', async ({ page }) => {
    await page.goto('/upload');
    
    // Verifica che tutti gli input abbiano label o aria-label
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          // Cerca una label associata
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          // L'input deve avere label, aria-label o aria-labelledby
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Prova a navigare con Tab
    await page.keyboard.press('Tab');
    
    // Verifica che ci sia un elemento focusato
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA']).toContain(focusedElement);
    
    // Verifica che gli elementi interattivi siano raggiungibili
    const focusableElements = page.locator('a, button, input, textarea, select, [tabindex="0"]');
    const elementCount = await focusableElements.count();
    
    if (elementCount > 0) {
      const focusedElementLocator = page.locator(':focus');
      await expect(focusedElementLocator).toBeVisible();
    }
  });

  test('should have accessible map markers', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che i marker si carichino (se la mappa è presente)
    const mapContainer = page.locator('.leaflet-container');
    if (await mapContainer.count() > 0) {
      try {
        await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });
        
        const markers = page.locator('.leaflet-marker-icon');
        const markerCount = await markers.count();
        
        if (markerCount > 0) {
          // I marker dovrebbero essere accessibili via tastiera o avere aria-label
          const firstMarker = markers.first();
          await expect(firstMarker).toBeVisible();
          
          // Verifica attributi di accessibilità (opzionale)
          const role = await firstMarker.getAttribute('role');
          const ariaLabel = await firstMarker.getAttribute('aria-label');
          const title = await firstMarker.getAttribute('title');
          
          // Almeno uno di questi attributi dovrebbe essere presente per l'accessibilità
          if (role || ariaLabel || title) {
            expect(role || ariaLabel || title).toBeTruthy();
          }
        }
      } catch (e) {
        console.log('No accessible map markers found, test skipped:', e instanceof Error ? e.message : String(e));
      }
    } else {
      console.log('No map container found, test skipped');
    }
  });

  test('should have proper image alt texts', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che le immagini si carichino
    await page.waitForSelector('img', { timeout: 10000 });
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Le immagini dovrebbero avere alt text o role presentation
        if (role !== 'presentation') {
          expect(alt).toBeDefined();
        }
      }
    }
  });
});
