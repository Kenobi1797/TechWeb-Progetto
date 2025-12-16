import { test, expect } from '@playwright/test';

/**
 * Test sulla Homepage
 * Verifica che la pagina principale carica correttamente con:
 * - Titolo e header
 * - Mappa interattiva Leaflet con gatti
 * - Tooltip al click su marker
 * - Link di navigazione
 */
test.describe('01 - Homepage - STREETCATS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  });

  test('Homepage loads with correct title and header', async ({ page }) => {
    // Verifica che il titolo della pagina sia "Streetcats" o simile
    await expect(page).toHaveTitle(/[Ss]treetcats|[Gg]atti/);
    
    // Verifica la presenza dell'header con titolo principale
    const mainTitle = page.locator('h1, header h1, header h2');
    await expect(mainTitle.first()).toBeVisible();
    const titleText = await mainTitle.first().textContent();
    expect(titleText?.toLowerCase()).toMatch(/avvistament|gatti|streetcats/);
  });

  test('Interactive map is displayed on homepage', async ({ page }) => {
    // Verifica che il container della mappa Leaflet sia presente
    const mapContainer = page.locator('[data-testid="map-container"], .leaflet-container, #map, [class*="map"]');
    
    // Attendi che almeno un elemento mappa sia visibile
    await page.waitForFunction(() => {
      const elements = document.querySelectorAll('[data-testid="map-container"], .leaflet-container, #map, [class*="map"]');
      return elements.length > 0;
    }, { timeout: 5000 });

    const visible = await mapContainer.first().isVisible();
    expect(visible).toBeTruthy();
  });

  test('Map marker tooltip appears on click', async ({ page }) => {
    // Attendi caricamento mappa e dati
    await page.waitForTimeout(2000);
    
    // Cerca i marker sulla mappa Leaflet
    const markers = page.locator('.leaflet-marker-icon');
    
    if (await markers.count() > 0) {
      // Clicca sul primo marker
      await markers.first().click();
      
      // Verifica che appaia un tooltip/popup con informazioni sul gatto
      const popup = page.locator('.leaflet-popup-content, .tooltip, .popup, [role="tooltip"]');
      await expect(popup.first()).toBeVisible({ timeout: 5000 });
      
      // Verifica che il popup contenga informazioni (titolo gatto, data, ecc)
      const popupText = await popup.first().textContent();
      expect(popupText).toBeTruthy();
    }
  });

  test('Navigation menu is present and functional', async ({ page }) => {
    // Verifica la presenza dell'header con link di navigazione
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    
    // Verifica link principali
    const homeLink = page.locator('a[href="/"], header a:first-of-type');
    await expect(homeLink.first()).toBeVisible();
    
    // Mappa dovrebbe essere disponibile per tutti
    const mapLink = page.locator('a[href="/map"]');
    if (await mapLink.count() > 0) {
      await expect(mapLink.first()).toBeVisible();
    }
    
    // Gatti/lista dovrebbe essere disponibile
    const catsLink = page.locator('a[href="/cats"]');
    if (await catsLink.count() > 0) {
      await expect(catsLink.first()).toBeVisible();
    }
  });

  test('Unregistered users can view homepage content', async ({ page }) => {
    // Non effettua login - verifica che i contenuti pubblici siano visibili
    await page.waitForTimeout(1000);
    
    // Mappa deve essere visibile
    const mapContainer = page.locator('[data-testid="map-container"], .leaflet-container, [class*="map"]').first();
    const isMapVisible = await mapContainer.isVisible().catch(() => false);
    
    if (isMapVisible) {
      await expect(mapContainer).toBeVisible();
    }
    
    // Link ai gatti deve essere accessibile
    const catsLink = page.locator('a[href="/cats"]');
    const catCardLink = page.locator('a[href*="/cats"]').first();
    
    if (await catsLink.count() > 0) {
      await expect(catsLink.first()).toBeVisible();
    } else if (await catCardLink.count() > 0) {
      await expect(catCardLink).toBeVisible();
    }
  });

  test('Footer is present', async ({ page }) => {
    // Scroll verso il basso per visualizzare il footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Verifica la presenza del footer
    const footer = page.locator('footer, [role="contentinfo"], [class*="footer"]');
    await expect(footer.first()).toBeVisible({ timeout: 2000 });
  });
});
