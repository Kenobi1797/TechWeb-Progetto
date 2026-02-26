import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

// ====== UTILITIES ======

async function navigateTo(page: Page, path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
}

async function register(page: Page, email: string, password: string) {
  await navigateTo(page, '/register');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').click();
  // Attendi redirect o messaggio di successo
  await expect(page).not.toHaveURL(`${BASE_URL}/register`, { timeout: 10000 });
}

async function login(page: Page, email: string, password: string) {
  await navigateTo(page, '/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  // Attendi redirect alla home o dashboard
  await expect(page).not.toHaveURL(`${BASE_URL}/login`, { timeout: 10000 });
}

async function logout(page: Page) {
  const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').first();
  await logoutBtn.click();
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}(/login|/)?`), { timeout: 10000 });
}

async function registerAndLogin(page: Page, email: string, password: string) {
  await register(page, email, password);
  await login(page, email, password);
}

// ====== 1. HOMEPAGE ======

test.describe('1 - Homepage & Navigation', () => {
  test('Homepage carica correttamente con header e contenuto', async ({ page }) => {
    await navigateTo(page, '/');
    await expect(page.locator('header, nav').first()).toBeVisible();
    await expect(page).toHaveTitle(/.+/); // Il titolo non è vuoto
  });

  test('La navigazione contiene i link principali', async ({ page }) => {
    await navigateTo(page, '/');
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
    // Almeno un link di navigazione deve esistere
    const links = nav.locator('a');
    await expect(links.first()).toBeVisible();
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Link di navigazione portano a pagine valide', async ({ page }) => {
    await navigateTo(page, '/');
    const catsLink = page.locator('a[href*="cat"], a[href*="gatt"]').first();
    await catsLink.click();
    await expect(page).not.toHaveURL(`${BASE_URL}/`);
    await expect(page.locator('body')).toBeVisible();
  });
});

// ====== 2. AUTHENTICATION ======

test.describe('2 - Authentication', () => {
  test('La pagina di login mostra form con email e password', async ({ page }) => {
    await navigateTo(page, '/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('La pagina di registrazione mostra form completo', async ({ page }) => {
    await navigateTo(page, '/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Login con credenziali errate mostra errore', async ({ page }) => {
    await navigateTo(page, '/login');
    await page.locator('input[type="email"]').fill('nonesiste@fake.com');
    await page.locator('input[type="password"]').fill('WrongPass999!');
    await page.locator('button[type="submit"]').click();
    // Deve restare sulla pagina di login o mostrare errore
    const errorVisible = await page.locator('[class*="error"], [role="alert"], .alert').first().isVisible({ timeout: 5000 }).catch(() => false);
    const staysOnLogin = page.url().includes('/login');
    expect(errorVisible || staysOnLogin).toBeTruthy();
  });

  test('Registrazione nuovo utente funziona correttamente', async ({ page }) => {
    const email = `register-${Date.now()}@example.com`;
    await register(page, email, TEST_PASSWORD);
    // Dopo la registrazione non siamo più su /register
    expect(page.url()).not.toContain('/register');
  });

  test('Login con credenziali valide redirige', async ({ page }) => {
    const email = `login-${Date.now()}@example.com`;
    await register(page, email, TEST_PASSWORD);
    await login(page, email, TEST_PASSWORD);
    expect(page.url()).not.toContain('/login');
  });

  test('Logout funziona e redirige alla pagina pubblica', async ({ page }) => {
    const email = `logout-${Date.now()}@example.com`;
    await registerAndLogin(page, email, TEST_PASSWORD);
    await logout(page);
    // Dopo logout, la pagina protetta deve essere inaccessibile
    await navigateTo(page, '/upload');
    expect(page.url()).toContain('/login');
  });

  test('Pagine protette richiedono autenticazione', async ({ page }) => {
    await navigateTo(page, '/upload');
    // Deve redirigere al login se non autenticato
    await expect(page).toHaveURL(new RegExp('/login'), { timeout: 10000 });
  });
});

// ====== 3. CATS BROWSING ======

test.describe('3 - Cats Browsing', () => {
  test('La pagina /cats carica e mostra contenuto', async ({ page }) => {
    await navigateTo(page, '/cats');
    // Deve esserci almeno un elemento "card" o simile
    const cards = page.locator('[class*="card"], [class*="cat"], article').first();
    await expect(cards).toBeVisible({ timeout: 10000 });
  });

  test('I gatti mostrano informazioni base (nome o immagine)', async ({ page }) => {
    await navigateTo(page, '/cats');
    const image = page.locator('img').first();
    await expect(image).toBeVisible({ timeout: 10000 });
  });

  test('La ricerca filtra i risultati', async ({ page }) => {
    await navigateTo(page, '/cats');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="cerca" i], input[placeholder*="ricerca" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Conta elementi prima della ricerca
    const beforeCount = await page.locator('[class*="card"], article').count();

    await searchInput.fill('zzzznonesisteqqq');
    await page.waitForTimeout(1000); // debounce

    const afterCount = await page.locator('[class*="card"], article').count();
    // O risultati diminuiscono, o compare messaggio "nessun risultato"
    const noResultMsg = await page.locator('text=/nessun|no result|not found/i').isVisible().catch(() => false);
    expect(afterCount < beforeCount || noResultMsg).toBeTruthy();
  });

  test('Click su un gatto apre il dettaglio', async ({ page }) => {
    await navigateTo(page, '/cats');
    const firstCard = page.locator('[class*="card"], article').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();
    // L'URL deve cambiare verso una pagina dettaglio
    await expect(page).not.toHaveURL(`${BASE_URL}/cats`, { timeout: 10000 });
  });
});

// ====== 4. CAT UPLOAD ======

test.describe('4 - Cat Upload', () => {
  test('La pagina upload mostra il form completo', async ({ page }) => {
    const email = `upload-form-${Date.now()}@example.com`;
    await registerAndLogin(page, email, TEST_PASSWORD);
    await navigateTo(page, '/upload');

    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Submit senza campi obbligatori mostra errore di validazione', async ({ page }) => {
    const email = `upload-validation-${Date.now()}@example.com`;
    await registerAndLogin(page, email, TEST_PASSWORD);
    await navigateTo(page, '/upload');

    // Click submit senza compilare nulla
    await page.locator('button[type="submit"]').click();

    // Deve mostrare errore di validazione HTML5 o custom
    const hasError = await page.locator('[class*="error"], [role="alert"], :invalid').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasError).toBeTruthy();
  });
});

// ====== 5. COMMENTS ======

test.describe('5 - Comments', () => {
  test('Il dettaglio gatto mostra la sezione commenti', async ({ page }) => {
    await navigateTo(page, '/cats');
    const firstCard = page.locator('[class*="card"], article').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    const commentsSection = page.locator('[class*="comment"], #comments, [data-testid="comments"]').first();
    await expect(commentsSection).toBeVisible({ timeout: 10000 });
  });

  test('Utente autenticato può scrivere un commento', async ({ page }) => {
    const email = `comment-${Date.now()}@example.com`;
    await registerAndLogin(page, email, TEST_PASSWORD);
    await navigateTo(page, '/cats');

    const firstCard = page.locator('[class*="card"], article').first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    const commentInput = page.locator('textarea, input[placeholder*="comment" i], input[placeholder*="commento" i]').first();
    await expect(commentInput).toBeVisible({ timeout: 10000 });

    const commentText = `Test commento ${Date.now()}`;
    await commentInput.fill(commentText);
    await page.locator('button[type="submit"]').last().click();

    // Il commento deve comparire nella lista
    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 10000 });
  });

  test('Utente non autenticato non può commentare', async ({ page }) => {
    await navigateTo(page, '/cats');
    const firstCard = page.locator('[class*="card"], article').first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    // O il form di commento è assente, o c'è un messaggio di login richiesto
    const commentForm = page.locator('textarea, input[placeholder*="comment" i]').first();
    const loginPrompt = page.locator('text=/login|accedi/i').first();
    const formVisible = await commentForm.isVisible({ timeout: 5000 }).catch(() => false);
    const loginVisible = await loginPrompt.isVisible({ timeout: 5000 }).catch(() => false);
    expect(!formVisible || loginVisible).toBeTruthy();
  });
});

// ====== 6. MAP ======

test.describe('6 - Map', () => {
  test('La pagina mappa carica il container Leaflet', async ({ page }) => {
    await navigateTo(page, '/map');
    await page.waitForTimeout(2000); // Leaflet ha bisogno di tempo
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 });
  });

  test('La mappa mostra almeno un marker', async ({ page }) => {
    await navigateTo(page, '/map');
    await page.waitForTimeout(3000);
    const markers = page.locator('.leaflet-marker-icon');
    const count = await markers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Click su un marker apre il popup', async ({ page }) => {
    await navigateTo(page, '/map');
    await page.waitForTimeout(3000);
    const marker = page.locator('.leaflet-marker-icon').first();
    await marker.click();
    await expect(page.locator('.leaflet-popup')).toBeVisible({ timeout: 5000 });
  });
});

// ====== 7. API INTEGRATION ======

test.describe('7 - API Integration', () => {
  test('GET /api/cats risponde con 200', async ({ page, request }) => {
    const response = await request.get(`${BASE_URL}/api/cats`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/cats ritorna un array JSON', async ({ page, request }) => {
    const response = await request.get(`${BASE_URL}/api/cats`);
    const body = await response.json();
    expect(Array.isArray(body) || Array.isArray(body.data)).toBeTruthy();
  });

  test('POST /api/auth/login con credenziali errate risponde con 401', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'fake@fake.com', password: 'wrong' }
    });
    expect(response.status()).toBe(401);
  });

  test('Endpoint protetto senza token risponde con 401', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/cats`, {
      data: { name: 'TestCat' }
    });
    expect([401, 403]).toContain(response.status());
  });
});

// ====== 8. RESPONSIVE DESIGN ======

test.describe('8 - Responsive Design', () => {
  const viewports = [
    { name: 'Mobile S', width: 320, height: 568 },
    { name: 'Mobile M', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`Pagina principale renderizza su ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await navigateTo(page, '/');
      await expect(page.locator('header, nav').first()).toBeVisible();
      // Nessun overflow orizzontale
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 20); // tolleranza 20px
    });
  }

  test('Il menu hamburger appare su mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateTo(page, '/');
    const hamburger = page.locator('[class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu" i]').first();
    const isVisible = await hamburger.isVisible({ timeout: 5000 }).catch(() => false);
    // Se non c'è hamburger, la nav deve comunque essere accessibile
    const navVisible = await page.locator('nav').first().isVisible().catch(() => false);
    expect(isVisible || navVisible).toBeTruthy();
  });
});