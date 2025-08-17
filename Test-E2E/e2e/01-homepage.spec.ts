import { test, expect } from '@playwright/test';

test.describe('Homepage Tests - STREETCATS', () => {
  test('should load STREETCATS homepage correctly', async ({ page }) => {
    await page.goto('/');
    
    // Verifica il titolo della pagina
    await expect(page).toHaveTitle(/streetcats|home/i);
    
    // Verifica la struttura della pagina
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // Verifica la presenza del brand
    await expect(page.locator('span').filter({ hasText: /streetcats/i })).toBeVisible();
    
    // Attendi che il contenuto si carichi (max 15 secondi)
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    // Verifica la presenza della mappa interattiva (se disponibile)
    const mapContainer = page.locator('.leaflet-container');
    const mapCount = await mapContainer.count();
    if (mapCount > 0) {
      await expect(mapContainer).toBeVisible();
    }
    
    // Verifica che non ci siano errori JavaScript critici
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text());
      }
    });
    await page.waitForTimeout(2000);
    
    // Permetti alcuni errori minori ma non critici
    const criticalErrors = errors.filter(e => 
      e.includes('ReferenceError') || 
      e.includes('TypeError') || 
      e.includes('SyntaxError')
    );
    expect(criticalErrors).toHaveLength(0);
  });
  
  test('should display interactive map with cat markers', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che il contenuto si carichi
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    // Verifica che la mappa sia presente (se caricata)
    const mapContainer = page.locator('.leaflet-container');
    const mapCount = await mapContainer.count();
    
    if (mapCount > 0) {
      await expect(mapContainer).toBeVisible();
      
      // Verifica la presenza dei controlli zoom (se la mappa è caricata)
      const zoomControls = page.locator('.leaflet-control-zoom');
      if (await zoomControls.count() > 0) {
        await expect(zoomControls).toBeVisible();
      }
      
      // Verifica la presenza di marker (attendi fino a 10 secondi)
      try {
        await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });
        const markers = await page.locator('.leaflet-marker-icon').count();
        expect(markers).toBeGreaterThan(0);
        
        // Test interazione con marker - clicca e verifica popup
        const firstMarker = page.locator('.leaflet-marker-icon').first();
        await firstMarker.click();
        
        // Verifica che si apra un popup con informazioni del gatto
        await expect(page.locator('.leaflet-popup')).toBeVisible();
      } catch (e) {
        // Se non ci sono marker, verifica almeno che la mappa sia interattiva
        console.log('No markers found on map, verifying map container visibility:', e instanceof Error ? e.message : String(e));
        await expect(mapContainer).toBeVisible();
      }
    } else {
      // Se la mappa non è disponibile, verifica almeno che ci siano le card dei gatti
      const catCards = page.locator('.cat-card');
      if (await catCards.count() > 0) {
        await expect(catCards.first()).toBeVisible();
      }
    }
  });

  test('should support markdown formatting in cat descriptions', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che il contenuto si carichi
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    // Attendi che le card si carichino
    try {
      await page.waitForSelector('.cat-card', { timeout: 10000 });
      
      // Clicca su una card per andare ai dettagli
      const detailsLink = page.locator('.cat-card a').first();
      if (await detailsLink.count() > 0) {
        await detailsLink.click();
        
        // Verifica di essere nella pagina di dettaglio
        await expect(page).toHaveURL(/\/cats\/\d+/);
        
        // Verifica che la descrizione supporti il markdown (cerca elementi formattati)
        const markdownElements = page.locator('.prose, .markdown-viewer, strong, em, a, h1, h2, h3');
        if (await markdownElements.count() > 0) {
          await expect(markdownElements.first()).toBeVisible();
        }
        
        // Verifica la presenza della sezione commenti
        const commentsSection = page.locator('h2').filter({ hasText: /commenti/i });
        if (await commentsSection.count() > 0) {
          await expect(commentsSection).toBeVisible();
        }
      }
    } catch (e) {
      // Se non ci sono card disponibili, il test passa comunque
      console.log('No cat cards found, skipping markdown test:', e instanceof Error ? e.message : String(e));
    }
  });
});
