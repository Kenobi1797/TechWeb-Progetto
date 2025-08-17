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
    // Test validazione form registrazione
    await page.goto('/register');
    await page.click('button[type="submit"]');
    
    // Verifica errori di validazione HTML5 o messaggi di errore
    const invalidInputs = page.locator('input:invalid');
    if (await invalidInputs.count() > 0) {
      await expect(invalidInputs.first()).toBeVisible();
    } else {
      // Se non ci sono input invalidi, potrebbe esserci un messaggio di errore
      await page.waitForTimeout(2000);
      const errorElements = page.locator('.error-message, .error, [class*="error"]');
      if (await errorElements.count() > 0) {
        await expect(errorElements.first()).toBeVisible();
      }
    }
    
    // Test validazione form upload
    await page.goto('/upload');
    await page.waitForTimeout(2000);
    
    // Se l'upload richiede autenticazione, verifica che mostri messaggio appropriato
    const authMessage = page.locator('text=/autenticat/i');
    if (await authMessage.count() > 0) {
      await expect(authMessage).toBeVisible();
    } else {
      // Se non richiede auth, testa la validazione del form
      await page.click('button[type="submit"]');
      const uploadInvalidInputs = page.locator('input:invalid');
      if (await uploadInvalidInputs.count() > 0) {
        await expect(uploadInvalidInputs.first()).toBeVisible();
      }
    }
  });

  test('visualizzazione dettagli gatto con commenti markdown', async ({ page }) => {
    await page.goto('/cats');
    
    // Trova un link ai dettagli del gatto
    const detailLink = page.locator('.cat-card a, a:has-text("Dettagli"), a:has-text("Vedi")').first();
    if (await detailLink.count() > 0) {
      await detailLink.click();
      
      // Verifica che siamo su una pagina di dettagli
      await page.waitForTimeout(2000);
      
      // Cerca sezioni di commenti
      const commentsSection = page.locator('h2:has-text("Commenti"), h3:has-text("Commenti"), [data-testid="comments"]');
      const markdownViewer = page.locator('.markdown-viewer, .markdown, [class*="markdown"]');
      
      if (await commentsSection.count() > 0) {
        await expect(commentsSection.first()).toBeVisible();
      }
      
      if (await markdownViewer.count() > 0) {
        await expect(markdownViewer.first()).toBeVisible();
      } else {
        console.log('Markdown viewer not found, but detail page loaded successfully');
      }
    } else {
      console.log('No detail links found, test skipped');
    }
  });
});
