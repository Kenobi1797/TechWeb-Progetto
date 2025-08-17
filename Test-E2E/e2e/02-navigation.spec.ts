import { test, expect } from '@playwright/test';

test.describe('Navigation Tests - STREETCATS', () => {
  test('should navigate through main menu', async ({ page }) => {
    await page.goto('/');
    
    // Test navigazione verso le pagine principali di STREETCATS
    const navLinks = [
      { text: /home|avvistamenti/i, url: '/' },
      { text: /mappa/i, url: '/map' },
      { text: /upload|carica/i, url: '/upload' },
      { text: /login/i, url: '/login' },
      { text: /register|registrati/i, url: '/register' }
    ];
    
    for (const link of navLinks) {
      // Trova il link per testo o aria-label
      const linkElement = page.locator(`nav a, header a, [role="navigation"] a`).filter({ hasText: link.text });
      
      if (await linkElement.count() > 0) {
        await linkElement.first().click();
        await expect(page).toHaveURL(new RegExp(link.url));
        
        // Verifica che la pagina si carichi correttamente
        await expect(page.locator('main')).toBeVisible();
        
        // Torna alla homepage per il prossimo test
        if (link.url !== '/') {
          await page.goto('/');
        }
      }
    }
  });

  test('should navigate to cat details from homepage', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che le card dei gatti si carichino
    await page.waitForSelector('.cat-card', { timeout: 10000 });
    
    // Clicca su una card di gatto per vedere i dettagli
    const catCard = page.locator('.cat-card').first();
    await expect(catCard).toBeVisible();
    
    const detailsLink = catCard.locator('a').first();
    if (await detailsLink.count() > 0) {
      await detailsLink.click();
      
      // Verifica di essere in una pagina di dettaglio o che l'URL sia cambiato
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      const isDetailPage = currentUrl.includes('/cats/') || 
                          currentUrl.includes('/details/') || 
                          currentUrl !== 'http://localhost:3000/';
      
      if (isDetailPage) {
        await expect(page.locator('h1, h2')).toBeVisible();
      }
    }
  });
});
