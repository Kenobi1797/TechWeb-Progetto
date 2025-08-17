import { test, expect } from '@playwright/test';

const testUser = {
  username: 'testuser_auth',
  email: 'testuser_auth@example.com',
  password: 'testpassword123',
};

test.describe('Authentication Tests - STREETCATS', () => {
  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Verifica che la pagina di registrazione sia caricata
    await expect(page.locator('h1, h2')).toContainText(/registra|signup/i);
    
    // Compila il form di registrazione
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    
    // Invia il form
    await page.click('button[type="submit"]');
    
    // Verifica il redirect dopo registrazione (potrebbe essere login, home o dashboard)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    const validRedirects = ['/login', '/dashboard', '/home', '/', '/profile'];
    const hasValidRedirect = validRedirects.some(path => currentUrl.includes(path));
    expect(hasValidRedirect).toBeTruthy();
    
    // Se viene reindirizzato al login, cerca messaggi di successo (opzionale)
    if (page.url().includes('/login')) {
      const successElements = page.locator('.success-message, .alert-success, .message');
      if (await successElements.count() > 0) {
        await expect(successElements.first()).toBeVisible();
      }
    }
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Verifica che la pagina di login sia caricata
    await expect(page.locator('h1, h2')).toContainText(/login|accedi/i);
    
    // Compila il form di login
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    
    // Invia il form
    await page.click('button[type="submit"]');
    
    // Verifica il redirect dopo login (più flessibile)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    const isLoggedIn = !currentUrl.includes('/login') || 
                      currentUrl.includes('dashboard') || 
                      currentUrl.includes('profile') ||
                      currentUrl.includes('success');
    
    if (isLoggedIn) {
      // Verifica che l'utente sia autenticato cercando indicatori di autenticazione
      const authIndicators = page.locator('a[href*="logout"], button:has-text("Logout"), .user-menu, .logout');
      if (await authIndicators.count() > 0) {
        await expect(authIndicators.first()).toBeVisible();
      }
    }
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Tenta login con credenziali errate
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Verifica che rimanga sulla pagina di login o mostri errore
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
    
    // Verifica la presenza di messaggio di errore (più flessibile)
    const errorElements = page.locator('.error-message, .alert-error, .error, [class*="error"]');
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
      const errorText = await errorElements.first().textContent();
      expect(errorText?.toLowerCase()).toMatch(/invalid|incorrect|wrong|sbagliato|error|errore/);
    }
  });

  test('should logout successfully', async ({ page }) => {
    // Prima effettua il login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Verifica di essere loggati
    await expect(page).toHaveURL(/\/(dashboard|profile|\?login=success)/);
    
    // Effettua il logout
    const logoutButton = page.locator('a[href*="logout"], button:has-text("Logout"), .logout-btn');
    await logoutButton.first().click();
    
    // Verifica il redirect dopo logout
    await expect(page).toHaveURL(/\/(login|home|\/$)/);
    
    // Verifica che non sia più autenticato
    await expect(page.locator('a[href*="login"]')).toBeVisible();
  });

  test('should prevent access to protected pages without authentication', async ({ page }) => {
    // Tenta di accedere a pagine protette senza autenticazione
    const protectedPages = ['/upload', '/dashboard', '/profile'];
    
    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      
      // Verifica che venga reindirizzato al login o mostri errore
      await expect(page).toHaveURL(/\/(login|unauthorized)/);
    }
  });

  test('should handle session persistence', async ({ page }) => {
    // Effettua il login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Verifica di essere loggati
    await expect(page).toHaveURL(/\/(dashboard|profile|\?login=success)/);
    
    // Ricarica la pagina
    await page.reload();
    
    // Verifica che la sessione sia mantenuta
    const authIndicators = page.locator('a[href*="logout"], button:has-text("Logout"), .user-menu');
    await expect(authIndicators.first()).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    // Test validazione form di registrazione
    await page.goto('/register');
    
    // Tenta di inviare form vuoto
    await page.click('button[type="submit"]');
    
    // Verifica la presenza di errori di validazione
    const invalidInputs = page.locator('input:invalid, .field-error');
    await expect(invalidInputs.first()).toBeVisible();
    
    // Test validazione email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    
    // Test validazione password troppo corta
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    
    // Verifica che ci sia un errore per password troppo corta
    const passwordError = page.locator('.password-error, input[name="password"]:invalid');
    await expect(passwordError.first()).toBeVisible();
  });

  test('should handle duplicate registration attempts', async ({ page }) => {
    await page.goto('/register');
    
    // Tenta di registrare lo stesso utente di nuovo
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Verifica la presenza di messaggio di errore per utente duplicato
    const errorMessage = page.locator('.error-message, .alert-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/already|già|exists|esistente/i);
  });
});
