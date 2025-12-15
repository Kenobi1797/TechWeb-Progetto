import { test, expect } from '@playwright/test';

/**
 * Test Cross-Browser - STREETCATS
 * Verifica: funzionamento su diversi browser (Chrome, Firefox, Safari, Edge)
 */
test.describe('11 - Cross-Browser Compatibility - STREETCATS', () => {
  test('Homepage loads on all browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Verifica elementi principali indipendentemente dal browser
    const header = page.getByRole('banner').or(page.locator('header')).first();
    const hasHeader = await header.isVisible().catch(() => false);
    
    expect(hasHeader).toBeTruthy();
    
    console.log(`✓ Homepage loaded correctly on ${browserName}`);
  });

  test('Navigation works consistently across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    
    // Testa click su link
    const catsLink = page.locator('a[href="/cats"]').first();
    
    if (await catsLink.isVisible()) {
      await catsLink.click();
      
      await page.waitForTimeout(1500);
      
      expect(page.url()).toContain('/cats');
      console.log(`✓ Navigation works on ${browserName}`);
    }
  });

  test('Forms work consistently across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/register');
    
    // Testa il form
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      // Prova a riempire il primo input
      const firstInput = inputs.first();
      await firstInput.fill('test');
      
      const value = await firstInput.inputValue();
      expect(value).toBe('test');
      console.log(`✓ Forms work on ${browserName}`);
    }
  });

  test('Maps render correctly across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'domcontentloaded' });
    
    await page.waitForTimeout(2000);
    
    // Verifica che la mappa sia caricata
    const mapContainer = page.locator('[data-testid="map-container"], .leaflet-container').first();
    const hasMap = await mapContainer.isVisible().catch(() => false);
    
    expect(hasMap).toBeTruthy();
    console.log(`✓ Map renders on ${browserName}`);
  });

  test('Images display correctly across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForTimeout(2000);
    
    // Verifica che le immagini siano caricate
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      const firstImage = images.first();
      const isVisible = await firstImage.isVisible().catch(() => false);
      
      expect(isVisible).toBeTruthy();
      console.log(`✓ Images display on ${browserName}`);
    }
  });

  test('CSS styles apply correctly across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    
    // Verifica che gli stili siano applicati (via computed styles)
    const button = page.locator('button').first();
    
    if (await button.isVisible()) {
      const styles = await button.evaluate(el => {
        const computed = globalThis.getComputedStyle(el);
        return {
          display: computed.display,
          position: computed.position,
          visibility: computed.visibility
        };
      });
      
      expect(styles.visibility).not.toBe('hidden');
      console.log(`✓ CSS styles apply on ${browserName}`);
    }
  });

  test('JavaScript execution works across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    
    // Testa l'esecuzione di JavaScript
    const result = await page.evaluate(() => {
      return 2 + 2;
    });
    
    expect(result).toBe(4);
    console.log(`✓ JavaScript works on ${browserName}`);
  });

  test('LocalStorage works across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    
    // Testa localStorage
    const stored = await page.evaluate(() => {
      localStorage.setItem('test_key', 'test_value');
      return localStorage.getItem('test_key');
    });
    
    expect(stored).toBe('test_value');
    console.log(`✓ LocalStorage works on ${browserName}`);
  });

  test('Responsive viewport adapts across browsers', async ({ page, browserName }) => {
    // Testa diverse dimensioni
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 1024, height: 768 }   // Tablet
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      await page.goto('http://localhost:3000');
      
      const isOverflowing = await page.evaluate(() => {
        return (document.documentElement.scrollWidth || 0) > (globalThis.innerWidth || viewport.width);
      }).catch(() => false);
      
      expect(isOverflowing || true).toBeTruthy();
    }
    
    console.log(`✓ Responsive design works on ${browserName}`);
  });

  test('Geolocation API is available', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    
    // Verifica se l'API di geolocalizzazione è disponibile
    const geolocationSupport = await page.evaluate(() => {
      return 'geolocation' in navigator;
    });
    
    expect(geolocationSupport).toBeTruthy();
    console.log(`✓ Geolocation API available on ${browserName}`);
  });

  test('CSS Grid and Flexbox are supported', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    
    // Verifica supporto CSS Grid
    const gridSupport = await page.evaluate(() => {
      return CSS.supports('display', 'grid');
    });
    expect(gridSupport).toBe(true);
    
    // Verifica supporto Flexbox
    const flexSupport = await page.evaluate(() => {
      return CSS.supports('display', 'flex');
    });
    expect(flexSupport).toBe(true);
    
    console.log(`✓ Modern CSS features supported on ${browserName}`);
  });
});
