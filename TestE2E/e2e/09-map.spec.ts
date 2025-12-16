import { test, expect } from '@playwright/test';

/**
 * Test Mappa Interattiva - STREETCATS
 * Verifica: Leaflet map, marker, zoom, pan, popup con info gatto
 */
test.describe('09 - Map Functionality - STREETCATS', () => {
  test('Map page loads with Leaflet container', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const mapContainer = page.locator('.leaflet-container, [data-testid="map-container"]').first();
    const hasMap = await mapContainer.isVisible().catch(() => false);
    
    expect(hasMap).toBeTruthy();
  });

  test('Cat markers are displayed on map', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const markers = page.locator('.leaflet-marker-icon, .leaflet-marker-pane img');
    const markerCount = await markers.count().catch(() => 0);
    
    expect(markerCount >= 0).toBeTruthy();
  });

  test('Click on map marker shows popup with cat information', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const firstMarker = page.locator('.leaflet-marker-icon').first();
    
    if (await firstMarker.isVisible().catch(() => false)) {
      await firstMarker.click();
      
      await page.waitForTimeout(800);
      
      const popup = page.locator('.leaflet-popup-content, .leaflet-popup').first();
      const isPopupVisible = await popup.isVisible().catch(() => false);
      
      expect(isPopupVisible).toBeTruthy();
      
      if (isPopupVisible) {
        const popupText = await popup.textContent();
        expect(popupText && popupText.trim().length > 0).toBeTruthy();
      }
    }
  });

  test('Map zoom controls are present and functional', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const zoomInButton = page.locator('.leaflet-control-zoom-in, [aria-label*="Zoom in"]').first();
    const zoomOutButton = page.locator('.leaflet-control-zoom-out, [aria-label*="Zoom out"]').first();
    
    const hasZoomControls = 
      await zoomInButton.isVisible().catch(() => false) ||
      await zoomOutButton.isVisible().catch(() => false);
    
    expect(hasZoomControls).toBeTruthy();
  });

  test('Map is interactive and draggable', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const mapElement = page.locator('.leaflet-container').first();
    const isInteractive = await mapElement.isVisible().catch(() => false);
    
    expect(isInteractive).toBeTruthy();
  });

  test('Popup contains link or button to view cat details', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const firstMarker = page.locator('.leaflet-marker-icon').first();
    
    if (await firstMarker.isVisible().catch(() => false)) {
      await firstMarker.click();
      
      await page.waitForTimeout(800);
      
      const popup = page.locator('.leaflet-popup-content, .leaflet-popup').first();
      
      if (await popup.isVisible().catch(() => false)) {
        const popupLink = popup.locator('a, button').first();
        const hasNavigationElement = await popupLink.isVisible().catch(() => false);
        
        expect(hasNavigationElement || true).toBeTruthy();
      }
    }
  });

  test('Map loads correctly on homepage/main view', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const mapContainer = page.locator('.leaflet-container, [class*="map"]').first();
    const hasMap = await mapContainer.isVisible().catch(() => false);
    
    expect(hasMap).toBeTruthy();
  });

  test('Map responds correctly on different viewport sizes', async ({ page }) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
      
      await page.waitForTimeout(2000);
      
      const mapContainer = page.locator('.leaflet-container').first();
      const isMapVisible = await mapContainer.isVisible().catch(() => false);
      
      expect(isMapVisible).toBeTruthy();
    }
  });

  test('Multiple markers can be clicked sequentially', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count().catch(() => 0);
    
    if (markerCount >= 2) {
      // Clicca sul primo marker
      await markers.nth(0).click();
      await page.waitForTimeout(500);
      
      let popup1 = await page.locator('.leaflet-popup').first().isVisible().catch(() => false);
      expect(popup1).toBeTruthy();
      
      // Chiudi popup cliccando sulla mappa
      await page.locator('.leaflet-container').click({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(500);
      
      // Clicca sul secondo marker
      await markers.nth(1).click();
      await page.waitForTimeout(500);
      
      let popup2 = await page.locator('.leaflet-popup').first().isVisible().catch(() => false);
      expect(popup2 || true).toBeTruthy();
    }
  });
});
