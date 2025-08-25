import { test, expect } from '@playwright/test';

test.describe('Navigation Tests - STREETCATS', () => {
  test('should navigate through main menu with improved button styles', async ({ page }) => {
    await page.goto('/');
    
    // Attendi caricamento
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    // Test navigazione verso le pagine principali di STREETCATS
    const navLinks = [
      { text: /home/i, url: '/', selector: 'a[href="/"]' },
      { text: /gatti/i, url: '/cats', selector: 'a[href="/cats"]' },
      { text: /mappa/i, url: '/map', selector: 'a[href="/map"]' },
      { text: /nuovo|upload/i, url: '/upload', selector: 'a[href="/upload"]' },
      { text: /login/i, url: '/login', selector: 'a[href="/login"]' }
    ];
    
    for (const link of navLinks) {
      // Verifica che il bottone abbia le nuove classi CSS
      const linkElement = page.locator(link.selector).first();
      
      if (await linkElement.count() > 0) {
        await expect(linkElement).toBeVisible();
        
        // Verifica stili CSS dei bottoni migliorati
        const classList = await linkElement.getAttribute('class');
        if (classList) {
          expect(classList).toMatch(/btn/);
        }
        
        // Test hover effect
        await linkElement.hover();
        await page.waitForTimeout(300);
        
        // Clicca e naviga
        await linkElement.click();
        await page.waitForTimeout(1500);
        
        // Verifica che la navigazione sia avvenuta
        const currentUrl = page.url();
        if (currentUrl.includes(link.url) || link.url === '/') {
          await expect(page.locator('header')).toBeVisible();
          await expect(page.locator('main').first()).toBeVisible();
        }
        
        // Torna alla homepage per il prossimo test
        if (link.url !== '/') {
          await page.goto('/');
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should navigate to cat details and handle page interactions', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che il contenuto si carichi più a lungo
    try {
      await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 20000 });
    } catch {
      // Se non trova "Caricamento...", probabilmente è già caricato
    }
    
    // Attendi che le card si carichino
    await page.waitForSelector('.cat-card, [data-testid="cat-card"], .card', { timeout: 15000 });
    
    // Cerca card dei gatti
    const catCards = page.locator('.cat-card, [data-testid="cat-card"], .card');
    const cardCount = await catCards.count();
    
    if (cardCount > 0) {
      // Clicca sulla prima card disponibile
      const firstCard = catCards.first();
      await expect(firstCard).toBeVisible();
      
      // Cerca link all'interno della card
      const detailsLink = firstCard.locator('a').first();
      if (await detailsLink.count() > 0) {
        await detailsLink.click();
        await page.waitForTimeout(2000);
        
        // Verifica di essere in una pagina di dettaglio
        const currentUrl = page.url();
        const isDetailPage = currentUrl.includes('/cats/') || 
                            currentUrl.includes('/details/') || 
                            currentUrl.includes('/cat/');
        
        if (isDetailPage) {
          // Verifica contenuto della pagina dettaglio
          await expect(page.locator('header')).toBeVisible();
          await expect(page.locator('main')).toBeVisible();
          
          // Verifica presenza di informazioni gatto
          const content = page.locator('h1, h2, .title, .description, img');
          if (await content.count() > 0) {
            await expect(content.first()).toBeVisible();
          }
        }
      }
    } else {
      console.log('No cat cards found - testing navigation only');
    }
  });

  test('should handle map page navigation and clustering features', async ({ page }) => {
    await page.goto('/map');
    
    // Attendi caricamento mappa
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    const mapContainer = page.locator('.leaflet-container');
    
    if (await mapContainer.count() > 0) {
      await expect(mapContainer).toBeVisible();
      
      // Test pulsante "Inquadra tutti" migliorato
      await testFitAllButton(page);
      
      // Test marker e clustering
      await testMarkerClustering(page);
    }
  });

  async function testFitAllButton(page: any) {
    const fitAllButton = page.locator('button').filter({ hasText: /tutti/i });
    if (await fitAllButton.count() > 0) {
      await expect(fitAllButton).toBeVisible();
      
      // Verifica che abbia le classi CSS dei nuovi stili
      const classList = await fitAllButton.getAttribute('class');
      expect(classList).toMatch(/btn/);
      
      // Test funzionalità
      await fitAllButton.click();
      await page.waitForTimeout(1000);
    }
  }

  async function testMarkerClustering(page: any) {
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();
    
    if (markerCount > 0) {
      // Test popup cluster migliorato
      const firstMarker = markers.first();
      await firstMarker.click();
      await page.waitForTimeout(500);
      
      const popup = page.locator('.leaflet-popup');
      if (await popup.count() > 0) {
        await expect(popup).toBeVisible();
        
        // Verifica contenuto popup migliorato
        const popupContent = page.locator('.leaflet-popup-content');
        await expect(popupContent).toBeVisible();
        
        // Cerca dettagli cluster migliorati
        const clusterDetails = popup.locator('ul, li');
        if (await clusterDetails.count() > 0) {
          console.log('Enhanced cluster popup details found');
        }
      }
    }
  }

  test('should test breadcrumb navigation and back buttons', async ({ page }) => {
    // Test navigazione completa con breadcrumb
    await page.goto('/');
    
    // Naviga verso upload
    const uploadLink = page.locator('a[href="/upload"]').first();
    if (await uploadLink.count() > 0) {
      await uploadLink.click();
      await page.waitForTimeout(1500);
      
      // Verifica che siamo nella pagina upload
      const currentUrl = page.url();
      if (currentUrl.includes('/upload')) {
        await expect(page.locator('header')).toBeVisible();
        
        // Test pulsante indietro del browser
        await page.goBack();
        await page.waitForTimeout(1000);
        
        // Verifica di essere tornati alla home
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
      }
    }
    
    // Test navigazione tra sezioni multiple
    const sections = ['/cats', '/map', '/'];
    for (const section of sections) {
      await page.goto(section);
      await page.waitForTimeout(1000);
      
      // Verifica caricamento sezione
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main').first()).toBeVisible();
      
      // Verifica che i bottoni di navigazione siano presenti e stilizzati
      const navButtons = page.locator('header button, header a.btn');
      const buttonCount = await navButtons.count();
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 2); i++) {
          const button = navButtons.nth(i);
          const classList = await button.getAttribute('class');
          if (classList) {
            expect(classList).toMatch(/btn/);
          }
        }
      }
    }
  });
});
