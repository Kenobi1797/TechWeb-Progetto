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
    await expect(page).toHaveURL('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Upload gatto
    await page.goto('/upload');
    await page.fill('input[name="title"]', testCat.title);
    await page.fill('textarea[name="description"]', testCat.description);
    await page.fill('input[name="latitude"]', String(testCat.latitude));
    await page.fill('input[name="longitude"]', String(testCat.longitude));
    await page.setInputFiles('input[type="file"]', testCat.imagePath);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await page.waitForTimeout(1000);
    await page.goto('/cats');
    await expect(page.locator('.cat-card')).toContainText(testCat.title);
    await page.click(`.cat-card:has-text("${testCat.title}") a:has-text("Dettagli")`);
    await expect(page.locator('h1')).toContainText(testCat.title);
    await expect(page.locator('.prose')).toContainText('un gatto'); // markdown
    await expect(page.locator('img')).toBeVisible();
  });

  test('upload/commento senza login: errore 401', async ({ page }) => {
    await page.goto('/upload');
    await page.fill('input[name="title"]', 'Gatto senza login');
    await page.fill('input[name="latitude"]', '45.4642');
    await page.fill('input[name="longitude"]', '9.19');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('autenticato');
    // Commento senza login
    await page.goto('/cats');
    await page.click('.cat-card a:has-text("Dettagli")');
    await page.fill('textarea[name="comment"]', 'Commento senza login');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('autenticato');
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
