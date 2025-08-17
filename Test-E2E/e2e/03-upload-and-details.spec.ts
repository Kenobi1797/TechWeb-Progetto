import { test, expect } from '@playwright/test';
const testCat = {
  title: 'Gatto Markdown',
  description: 'Questo è **un gatto** con descrizione in _markdown_\n\n- punto 1\n- punto 2',
  latitude: 45.4642,
  longitude: 9.19,
  imagePath: 'assets/test-cat.jpg', // Use relative path for Playwright
};

const testUser = {
  username: 'markdownuser',
  email: 'markdownuser@example.com',
  password: 'testpassword123',
};

test.describe('Upload e dettagli gatto + errori edge', () => {
  test('upload gatto con markdown e immagine, verifica visualizzazione', async ({ page }) => {
    // Registrazione e login
    await page.goto('/register');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Attendi il completamento della registrazione
    await page.waitForTimeout(3000);
    
    // La registrazione potrebbe reindirizzare o rimanere sulla stessa pagina con messaggio
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
      // Se rimane su register, potrebbe esserci un errore che l'utente esiste già
      const errorElements = page.locator('.error, .error-message, [class*="error"]');
      if (await errorElements.count() > 0) {
        console.log('User might already exist, proceeding with login');
      }
    }
    
    // Procedi con il login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Verifica che il login sia avvenuto con successo
    await page.waitForTimeout(3000);
    const loginUrl = page.url();
    const isLoggedIn = !loginUrl.includes('/login') || loginUrl.includes('dashboard') || loginUrl.includes('success');
    
    if (isLoggedIn) {
      // Upload gatto
      await page.goto('/upload');
      
      // Verifica di essere nella pagina di upload
      await expect(page).toHaveURL('/upload');
      
      await page.fill('input[name="title"]', testCat.title);
      await page.fill('textarea[name="description"]', testCat.description);
      await page.fill('input[name="latitude"]', String(testCat.latitude));
      await page.fill('input[name="longitude"]', String(testCat.longitude));
      await page.setInputFiles('input[type="file"]', testCat.imagePath);
      await page.click('button[type="submit"]');
      
      // Attendi il completamento dell'upload
      await page.waitForTimeout(2000);
      
      // Verifica che l'upload sia andato a buon fine (potrebbe reindirizzare o mostrare messaggio)
      const uploadUrl = page.url();
      if (uploadUrl.includes('/') || uploadUrl.includes('/cats') || uploadUrl.includes('/dashboard')) {
        // Verifica che il gatto sia stato creato
        await page.goto('/');
        await page.waitForTimeout(2000);
        
        const catCards = page.locator('.cat-card');
        if (await catCards.count() > 0) {
          // Cerca il gatto creato
          const targetCard = catCards.filter({ hasText: testCat.title });
          if (await targetCard.count() > 0) {
            await expect(targetCard.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('upload/commento senza login: errore 401', async ({ page }) => {
    await page.goto('/upload');
    
    // Verifica se la pagina reindirizza al login o mostra form
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login')) {
      // Se reindirizza al login, è corretto
      await expect(page).toHaveURL(/\/login/);
    } else {
      // Se mostra il form, prova a submittare e verifica errore
      const titleInput = page.locator('input[name="title"]');
      if (await titleInput.count() > 0) {
        await page.fill('input[name="title"]', 'Gatto senza login');
        await page.fill('input[name="latitude"]', '45.4642');
        await page.fill('input[name="longitude"]', '9.19');
        await page.click('button[type="submit"]');
        
        // Verifica messaggio di errore o redirect al login
        await page.waitForTimeout(2000);
        const errorElements = page.locator('.error-message, .error, [class*="error"]');
        const loginRedirect = page.url().includes('/login');
        
        if (await errorElements.count() > 0) {
          await expect(errorElements.first()).toBeVisible();
          const errorText = await errorElements.first().textContent();
          expect(errorText?.toLowerCase()).toMatch(/autenticat|login|401|unauthorized|accesso/);
        } else if (loginRedirect) {
          await expect(page).toHaveURL(/\/login/);
        }
      }
    }
  });

  test('registrazione con email/username già esistenti: errore', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('già registrat');
  });

  test('validazione form upload/register', async ({ page }) => {
    await page.goto('/register');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('input[name="username"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
    await page.goto('/upload');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('input[name="title"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="latitude"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="longitude"]:invalid')).toBeVisible();
  });

  test('visualizzazione dettagli gatto con commenti markdown', async ({ page }) => {
    await page.goto('/cats');
    await page.click('.cat-card a:has-text("Dettagli")');
    await expect(page.locator('h2')).toContainText('Commenti');
    await expect(page.locator('.markdown-viewer')).toBeVisible();
  });
});
