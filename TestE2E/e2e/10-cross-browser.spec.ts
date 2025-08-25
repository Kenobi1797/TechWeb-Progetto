import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Tests - STREETCATS', () => {
  test('should work correctly in Firefox', async ({ page }) => {
    await page.goto('/');
    
    // Verifica funzionalità core in Firefox
    await expect(page.locator('h1')).toContainText(/avvistamenti.*gatti/i);
    
    // Verifica la mappa solo se presente
    const mapContainer = page.locator('.leaflet-container');
    if (await mapContainer.count() > 0) {
      await expect(mapContainer).toBeVisible();
      
      // Verifica che i marker si carichino (opzionale)
      try {
        await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });
        const markers = await page.locator('.leaflet-marker-icon').count();
        expect(markers).toBeGreaterThan(0);
      } catch (e) {
        console.log('No markers found, continuing test:', e instanceof Error ? e.message : String(e));
      }
    }
    
    // Verifica il funzionamento dei filtri nella pagina gatti
    await page.getByRole('link', { name: /gatti/i }).click();
    await expect(page.getByText('🔍 Filtri di ricerca')).toBeVisible();
    
    // Test dropdown filtri
    const sortSelect = page.getByLabel('Ordina per:');
    await sortSelect.selectOption('title');
    
    // Verifica che le card dei gatti siano visualizzate
    const catCards = page.locator('.cat-card');
    if (await catCards.count() > 0) {
      await expect(catCards.first()).toBeVisible();
    }
  });

  test('should work consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Verifica supporto CSS Grid (importante per il layout delle card)
    const gridSupport = await page.evaluate(() => {
      return CSS.supports('display', 'grid');
    });
    expect(gridSupport).toBe(true);
    
    // Verifica supporto Flexbox
    const flexSupport = await page.evaluate(() => {
      return CSS.supports('display', 'flex');
    });
    expect(flexSupport).toBe(true);
    
    if (browserName === 'webkit') {
      await expect(page.locator('nav, header')).toBeVisible();
    }
  });

  test('should handle browser-specific features', async ({ page }) => {
    await page.goto('/');
    
    // Test localStorage (per memorizzare preferenze utente)
    await page.evaluate(() => {
      localStorage.setItem('streetcats-test', 'value');
    });
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('streetcats-test');
    });
    expect(storedValue).toBe('value');
    
    // Test sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('streetcats-session', 'session-value');
    });
    const sessionValue = await page.evaluate(() => {
      return sessionStorage.getItem('streetcats-session');
    });
    expect(sessionValue).toBe('session-value');
  });

  test('should handle geolocation API availability', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se l'API di geolocalizzazione è disponibile
    const geolocationSupport = await page.evaluate(() => {
      return 'geolocation' in navigator;
    });
    
    expect(geolocationSupport).toBeTruthy();
    
    // Se supportata, dovrebbe esserci un pulsante di geolocalizzazione
    if (geolocationSupport) {
      const geoButton = page.locator('button').filter({ hasText: /posizione|geo/i });
      if (await geoButton.count() > 0) {
        await expect(geoButton).toBeVisible();
      }
    }
  });
});
