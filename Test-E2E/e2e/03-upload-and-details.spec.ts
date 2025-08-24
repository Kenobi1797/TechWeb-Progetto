import { test, expect } from '@playwright/test';

test.describe('Upload and Details Tests', () => {
  // Setup utente autenticato
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Login se necessario
    try {
      await page.getByRole('link', { name: /accedi/i }).first().click({ timeout: 5000 });
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.getByRole('button', { name: /accedi/i }).click();
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    } catch {
      // Già loggato o login non necessario
    }
  });

  test('Upload new cat sighting with all required fields', async ({ page }) => {
    // Naviga alla pagina di upload  
    const uploadLink = page.getByRole('link', { name: /carica|upload|nuovo/i });
    await uploadLink.click();
    await expect(page).toHaveURL(/.*\/upload/);

    // Compila il form
    await page.fill('input[name="title"]', 'Gatto Tigrato Bellissimo');
    await page.fill('textarea[name="description"]', 'Ho trovato questo **gatto tigrato** molto dolce vicino al parco. Sembra in buona salute e molto socievole. [Link utile](http://example.com)');
    
    // Upload immagine di test
    const filePath = './assets/test-cat.jpg';
    await page.setInputFiles('input[type="file"]', filePath);
    
    // Seleziona posizione sulla mappa (click sulla mappa)
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    await mapContainer.click({ position: { x: 200, y: 200 } });
    
    // Verifica che le coordinate siano state impostate
    await expect(page.locator('text=/Coordinate selezionate|Posizione selezionata/')).toBeVisible();
    
    // Submit del form
    await page.getByRole('button', { name: /condividi avvistamento|carica avvistamento/i }).click();
    
    // Verifica il successo (dovrebbe tornare alla homepage o mostrare messaggio di successo)
    await expect(page.locator('text=/Avvistamento caricato|Upload completato|Successo/')).toBeVisible({ timeout: 10000 });
  });

  test('Upload form validation works correctly', async ({ page }) => {
    await page.getByRole('link', { name: /carica|upload|nuovo/i }).click();
    
    // Prova a inviare form vuoto
    await page.getByRole('button', { name: /condividi avvistamento|carica avvistamento/i }).click();
    
    // Verifica messaggi di errore
    await expect(page.locator('text=/required|obbligatorio|necessario/i')).toBeVisible();
  });

  test('View cat details page shows all information correctly', async ({ page }) => {
    // Vai alla homepage e clicca su un avvistamento
    await page.goto('http://localhost:3000');
    
    // Attendi che le card si carichino
    await page.waitForSelector('[data-testid="cat-card"], .cat-card', { timeout: 10000 });
    
    // Clicca sulla prima card di gatto
    const firstCatCard = page.locator('[data-testid="cat-card"], .cat-card').first();
    await expect(firstCatCard).toBeVisible();
    await firstCatCard.click();
    
    // Verifica che siamo nella pagina di dettaglio
    await expect(page).toHaveURL(/.*\/cats\/\d+/);
    
    // Verifica che tutti gli elementi siano presenti
    await expect(page.locator('img[alt*="cat"], img[alt*="gatto"]')).toBeVisible(); // Immagine del gatto
    await expect(page.locator('h1, .cat-title')).toBeVisible(); // Titolo
    await expect(page.locator('.cat-description, [data-testid="description"]')).toBeVisible(); // Descrizione
    await expect(page.locator('.leaflet-container')).toBeVisible(); // Mappa
    await expect(page.locator('text=/Data di inserimento|Inserito il|Created/')).toBeVisible(); // Data
  });

  test('Markdown formatting in description works', async ({ page }) => {
    // Vai a una pagina di dettaglio
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="cat-card"], .cat-card', { timeout: 10000 });
    await page.locator('[data-testid="cat-card"], .cat-card').first().click();
    
    // Verifica che ci sia contenuto formattato (bold, italic, links)
    const description = page.locator('.cat-description, [data-testid="description"]');
    
    // Verifica la presenza di markdown renderizzato
    const hasFormatting = await description.locator('strong, em, a, b, i').count() > 0;
    if (hasFormatting) {
      await expect(description.locator('strong, b')).toBeVisible(); // Grassetto
    }
  });

  test('Cat location is displayed correctly on map', async ({ page }) => {
    // Vai a una pagina di dettaglio
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="cat-card"], .cat-card', { timeout: 10000 });
    await page.locator('[data-testid="cat-card"], .cat-card').first().click();
    
    // Verifica che la mappa sia visibile e abbia markers
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Verifica che ci sia almeno un marker sulla mappa
    await expect(page.locator('.leaflet-marker-icon, .marker').first()).toBeVisible({ timeout: 5000 });
  });

  test('Comments section is visible and functional', async ({ page }) => {
    // Vai a una pagina di dettaglio
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="cat-card"], .cat-card', { timeout: 10000 });
    await page.locator('[data-testid="cat-card"], .cat-card').first().click();
    
    // Verifica la sezione commenti
    await expect(page.locator('text=/Commenti|Comments/')).toBeVisible();
    
    // Se l'utente è autenticato, dovrebbe vedere il form per aggiungere commenti
    const commentForm = page.locator('textarea[name="comment"], .comment-form');
    if (await commentForm.isVisible()) {
      await commentForm.fill('Che bel gatto! Spero stia bene.');
      await page.getByRole('button', { name: /invia|aggiungi commento/i }).click();
      
      // Verifica che il commento sia stato aggiunto
      await expect(page.locator('text="Che bel gatto! Spero stia bene."')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Image preview works during upload', async ({ page }) => {
    await page.getByRole('link', { name: /carica|upload|nuovo/i }).click();
    
    // Upload immagine
    const filePath = './assets/test-cat.jpg';
    await page.setInputFiles('input[type="file"]', filePath);
    
    // Verifica che appaia l'anteprima
    await expect(page.locator('img[src*="data:"], .image-preview img')).toBeVisible({ timeout: 5000 });
  });
});
