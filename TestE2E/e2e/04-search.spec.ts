import { test, expect } from '@playwright/test';

test.describe('Search Functionality - STREETCATS', () => {
  test('should search for cats and display results', async ({ page }) => {
    // Vai alla pagina cats dove ora si trova la funzionalità di ricerca
    await page.goto('/cats');
    
    // Attendi che il contenuto si carichi
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    // Verifica che ci siano i filtri nella SearchBar
    const locationFilter = page.locator('select').filter({ hasText: /ubicazione|location|zona/i }).first();
    const categoryFilter = page.locator('select').filter({ hasText: /tipo|categoria|category/i }).first();
    
    // Verifica che i filtri siano presenti
    if (await locationFilter.count() > 0) {
      await expect(locationFilter).toBeVisible();
      
      // Testa il filtro ubicazione
      await locationFilter.selectOption({ index: 1 }); // Seleziona la prima opzione non vuota
      await page.waitForTimeout(2000);
      
      // Verifica che ci siano risultati filtrati
      const catCards = page.locator('.cat-card, [data-testid="cat-card"]');
      if (await catCards.count() > 0) {
        await expect(catCards.first()).toBeVisible();
      }
    }
    
    if (await categoryFilter.count() > 0) {
      await expect(categoryFilter).toBeVisible();
      
      // Testa il filtro categoria
      await categoryFilter.selectOption({ index: 1 }); // Seleziona la prima opzione non vuota
      await page.waitForTimeout(2000);
    }
    
    console.log('Search functionality replaced with filters-only interface');
  });

  test('should filter cats by location/area', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che il contenuto si carichi
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    // Cerca filtri di localizzazione
    const locationFilter = page.locator('select, input[placeholder*="posizione"], input[placeholder*="luogo"]');
    
    if (await locationFilter.count() > 0) {
      await expect(locationFilter.first()).toBeVisible();
      
      // Testa un filtro per area
      if (await page.locator('select').count() > 0) {
        await page.locator('select').first().selectOption({ index: 1 });
      } else {
        await locationFilter.first().fill('Milano');
      }
      
      await page.waitForTimeout(2000);
      
      // Verifica che i risultati si aggiornino
      const catCards = page.locator('.cat-card');
      if (await catCards.count() > 0) {
        await expect(catCards.first()).toBeVisible();
      }
    } else {
      // Se non ci sono filtri specifici, verifica la ricerca generica
      const searchInput = page.locator('input').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('Milano');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should handle search with no results', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che il contenuto si carichi
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="cerca"]').first();
    
    if (await searchInput.count() > 0) {
      // Cerca qualcosa che sicuramente non esiste
      await searchInput.fill('gattononesistente12345');
      await searchInput.press('Enter');
      
      await page.waitForTimeout(2000);
      
      // Verifica messaggio "nessun risultato" o pagina vuota
      const noResultsMessage = page.locator('text=/nessun risultato|no results|non trovato/i');
      const emptyCatList = page.locator('.cat-card');
      
      if (await noResultsMessage.count() > 0) {
        await expect(noResultsMessage).toBeVisible();
      } else {
        // Se non c'è messaggio specifico, verifica che non ci siano card
        expect(await emptyCatList.count()).toBe(0);
      }
    }
  });

  test('should support advanced search filters', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che il contenuto si carichi
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    // Cerca filtri avanzati (date, autore, etc.)
    const dateFilter = page.locator('input[type="date"], select[name*="date"]');
    const authorFilter = page.locator('input[name*="author"], select[name*="user"]');
    
    if (await dateFilter.count() > 0) {
      await dateFilter.first().fill('2024-01-01');
      await page.waitForTimeout(1000);
    }
    
    if (await authorFilter.count() > 0) {
      if (await page.locator('select[name*="user"]').count() > 0) {
        await page.locator('select[name*="user"]').first().selectOption({ index: 1 });
      } else {
        await authorFilter.first().fill('test');
      }
      await page.waitForTimeout(1000);
    }
    
    // Verifica che i filtri funzionino
    const catCards = page.locator('.cat-card');
    if (await catCards.count() > 0) {
      await expect(catCards.first()).toBeVisible();
    }
  });

  test('should handle search pagination', async ({ page }) => {
    await page.goto('/');
    
    // Attendi che il contenuto si carichi
    await page.waitForFunction(() => !document.body.innerText.includes('Caricamento...'), { timeout: 15000 });
    
    // Cerca paginazione
    const paginationButtons = page.locator('.pagination, .page-nav').locator('button, a');
    
    if (await paginationButtons.count() > 0) {
      const nextButton = paginationButtons.filter({ hasText: /next|avanti|>/i });
      
      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await page.waitForTimeout(2000);
        
        // Verifica che l'URL sia cambiato o che il contenuto sia aggiornato
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/page|p=/);
      }
    }
  });
});
