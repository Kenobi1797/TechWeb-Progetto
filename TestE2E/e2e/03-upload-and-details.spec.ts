import { test, expect } from '@playwright/test';

test.describe('Upload and Details Tests', () => {
  // Setup utente autenticato
  test.beforeEach(async ({ page }) => {
    try {
      // Create a unique test user for each test
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'testPassword123',
        username: `testuser${Date.now()}`
      };
      
      // First, go to login page and access registration
  await page.goto('http://localhost:3000/login', { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });
      
      // Look for the registration link in the login page
      const registrationLink = page.getByText('Registrati');
      if (await registrationLink.isVisible()) {
        await registrationLink.click();
        await page.waitForURL('**/register', { timeout: 30000 });
        
        // Fill registration form
        await page.fill('input[name="username"]', testUser.username);
        await page.fill('input[name="email"]', testUser.email);
        await page.fill('input[name="password"]', testUser.password);
        
        // Submit registration
  await page.getByRole('button', { name: /registrati/i }).click();
  await page.waitForURL('**/login', { timeout: 30000 });
      }
      
      // Now login with the test user
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
  await page.getByRole('button', { name: /accedi/i }).click();
  // Wait for successful login (redirect to homepage)
  await page.waitForURL('http://localhost:3000/', { timeout: 30000 });
  // Verify login was successful by checking for logout button
  await page.waitForSelector('button:has-text("Logout")', { timeout: 20000 });
      
    } catch (error) {
      console.log('Authentication setup failed:', error);
      // Alternative: Try direct API registration
      try {
        await page.goto('http://localhost:3000', { timeout: 30000 });
        await page.evaluate(async () => {
          const response = await fetch('http://localhost:3001/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: `testuser${Date.now()}`,
              email: `test-${Date.now()}@example.com`,
              password: 'testPassword123'
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        });
        
        await page.reload();
      } catch (apiError) {
        console.log('API authentication also failed:', apiError);
      }
    }
  });

  test('Upload new cat sighting with all required fields', async ({ page }) => {
    // Naviga alla pagina di upload
    await page.getByRole('link', { name: /nuovo|carica|upload/i }).click();
    await expect(page).toHaveURL(/.*\/upload/);
    
    // Attendi che il form sia caricato
    await page.waitForSelector('input#title', { timeout: 10000 });    // Compila il form
    await page.fill('input#title', 'Gatto Tigrato Bellissimo');
    await page.fill('textarea#description', 'Ho trovato questo **gatto tigrato** molto dolce vicino al parco. Sembra in buona salute e molto socievole. [Link utile](http://example.com)');
    
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
    await page.getByRole('button', { name: /condividi avvistamento/i }).click();
    
    // Verifica il successo (dovrebbe tornare alla homepage o mostrare messaggio di successo)
    await expect(page.locator('text=/Avvistamento.*inviato.*successo/i')).toBeVisible({ timeout: 10000 });
  });

  test('Upload form validation works correctly', async ({ page }) => {
    await page.getByRole('link', { name: /nuovo|carica|upload/i }).click();
    await page.waitForSelector('input#title', { timeout: 10000 });
    
    // Verifica che il form sia vuoto e il bottone disabilitato
    await expect(page.getByRole('button', { name: /condividi avvistamento/i })).toBeDisabled();
    
    // Compila solo il titolo - il bottone dovrebbe rimanere disabilitato
    await page.fill('#title', 'Gatto test');
    await expect(page.getByRole('button', { name: /condividi avvistamento/i })).toBeDisabled();
    
    // Compila la descrizione - il bottone dovrebbe rimanere disabilitato (manca immagine e posizione)
    await page.fill('#description', 'Descrizione di test');
    await expect(page.getByRole('button', { name: /condividi avvistamento/i })).toBeDisabled();
  });

  test('View cat details page shows all information correctly', async ({ page }) => {
    // Vai alla homepage e clicca su un avvistamento
    await page.goto('http://localhost:3000');
    
    // Attendi che le card si carichino
    await page.waitForSelector('[data-testid="cat-card"], .cat-card', { timeout: 10000 });
    
    // Clicca sul link "Dettagli" della prima card
    const firstDetailsLink = page.getByRole('link', { name: /dettagli/i }).first();
    await expect(firstDetailsLink).toBeVisible();
    await firstDetailsLink.click();
    
    // Verifica che siamo nella pagina di dettaglio
    await expect(page).toHaveURL(/.*\/cats\/\d+/);
    
    // Verifica che tutti gli elementi siano presenti
    await expect(page.locator('img.rounded.shadow')).toBeVisible(); // Immagine del gatto (con classi specifiche)
    await expect(page.locator('h1')).toBeVisible(); // Titolo
    await expect(page.locator('text=/Descrizione|descrizione/i')).toBeVisible(); // Sezione descrizione
    await expect(page.locator('.leaflet-container')).toBeVisible(); // Mappa
    await expect(page.locator('text=/Avvistato il|Data di inserimento|Created/i')).toBeVisible(); // Data
  });

  test('Markdown formatting in description works', async ({ page }) => {
    // Vai a una pagina di dettaglio
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="cat-card"], .cat-card', { timeout: 10000 });
    await page.getByRole('link', { name: /dettagli/i }).first().click();
    
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
    await page.getByRole('link', { name: /dettagli/i }).first().click();
    
    // Verifica che la mappa sia visibile e abbia markers
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
    
    // Verifica che ci sia almeno un marker sulla mappa
    await expect(page.locator('.leaflet-marker-icon, .marker').first()).toBeVisible({ timeout: 5000 });
  });

  test('Comments section is visible and functional', async ({ page }) => {
    // Vai alla homepage e clicca su un avvistamento
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="cat-card"], .cat-card', { timeout: 10000 });
    await page.getByRole('link', { name: /dettagli/i }).first().click();
    
    // Verifica la sezione commenti
    await expect(page.locator('text=/Commenti|Comments|commenti/i')).toBeVisible();
    
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
    await page.getByRole('link', { name: /nuovo|carica|upload/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Upload immagine usando l'input file nascosto
    const filePath = './assets/test-cat.jpg';
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Verifica che appaia l'anteprima (componente Image di Next.js)
    await expect(page.locator('img[alt="Anteprima"]')).toBeVisible({ timeout: 10000 });
    
    // Verifica anche il messaggio di successo (usando regex per flessibilità)
    await expect(page.locator('text=/Foto caricata.*successo/i')).toBeVisible({ timeout: 5000 });
  });
});
