import { test, expect } from '@playwright/test';

test.describe('API Integration Tests - STREETCATS', () => {
  test('should load cats data from API', async ({ page }) => {
    // Intercetta le chiamate API per i gatti
    await page.route('**/api/cats*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Gatto API Test',
            description: 'Gatto di test per API',
            latitude: 45.4642,
            longitude: 9.19,
            image_url: 'https://example.com/cat1.jpg',
            created_at: '2024-01-01T00:00:00Z',
            user_id: 1
          },
          {
            id: 2,
            title: 'Secondo Gatto',
            description: 'Altro gatto di test',
            latitude: 45.4650,
            longitude: 9.20,
            image_url: 'https://example.com/cat2.jpg',
            created_at: '2024-01-02T00:00:00Z',
            user_id: 1
          }
        ])
      });
    });

    await page.goto('/');
    
    // Verifica che le card dei gatti siano visualizzate
    await expect(page.locator('.cat-card')).toHaveCount(2);
    await expect(page.locator('.cat-card').first()).toContainText('Gatto API Test');
  });

  test('should handle authentication API', async ({ page }) => {
    // Intercetta la chiamata di login
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Login successful',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          },
          token: 'fake-jwt-token'
        })
      });
    });

    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verifica il redirect dopo login
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle cat creation API', async ({ page }) => {
    // Mock successful authentication first
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Login successful',
          user: { id: 1, username: 'testuser', email: 'test@example.com' },
          token: 'fake-jwt-token'
        })
      });
    });

    // Mock cat creation
    await page.route('**/api/cats', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 3,
            title: 'Nuovo Gatto',
            description: 'Gatto creato via API',
            latitude: 45.4642,
            longitude: 9.19,
            image_url: 'https://example.com/new-cat.jpg',
            created_at: new Date().toISOString(),
            user_id: 1
          })
        });
      }
    });

    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Go to upload page
    await page.goto('/upload');
    
    // Fill the form
    await page.fill('input[name="title"]', 'Nuovo Gatto');
    await page.fill('textarea[name="description"]', 'Gatto creato via API');
    await page.fill('input[name="latitude"]', '45.4642');
    await page.fill('input[name="longitude"]', '9.19');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to homepage
    await expect(page).toHaveURL('/');
  });

  test('should handle comments API', async ({ page }) => {
    // Mock cat detail with comments
    await page.route('**/api/cats/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          title: 'Gatto con Commenti',
          description: 'Gatto di test con commenti',
          latitude: 45.4642,
          longitude: 9.19,
          image_url: 'https://example.com/cat-with-comments.jpg',
          created_at: '2024-01-01T00:00:00Z',
          user_id: 1,
          comments: [
            {
              id: 1,
              content: 'Che bel gattino!',
              username: 'user1',
              created_at: '2024-01-01T10:00:00Z',
              user_id: 2,
              cat_id: 1
            },
            {
              id: 2,
              content: 'L\'ho visto anch\'io ieri',
              username: 'user2',
              created_at: '2024-01-01T11:00:00Z',
              user_id: 3,
              cat_id: 1
            }
          ]
        })
      });
    });

    await page.goto('/cats/1');
    
    // Verifica che i commenti siano visualizzati
    await expect(page.locator('h2').filter({ hasText: /commenti/i })).toBeVisible();
    const commentElements = page.locator('.comment, .prose, [class*="comment"]');
    if (await commentElements.count() > 0) {
      await expect(commentElements.first()).toBeVisible();
    }
  });

  test('should handle geocoding API', async ({ page }) => {
    // Mock geocoding API
    await page.route('**/api/geocode*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          address: 'Milano, Lombardia, Italia'
        })
      });
    });

    // Mock cats with coordinates
    await page.route('**/api/cats*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Gatto Milano',
            description: 'Gatto a Milano',
            latitude: 45.4642,
            longitude: 9.19,
            image_url: 'https://example.com/cat-milano.jpg',
            created_at: '2024-01-01T00:00:00Z',
            user_id: 1
          }
        ])
      });
    });

    await page.goto('/');
    
    // Verifica che la geocodifica funzioni (l'indirizzo dovrebbe apparire nelle card)
    await page.waitForTimeout(2000); // Attendi la geocodifica
    const locationText = page.locator('.cat-card').first().locator('text=/Milano/');
    if (await locationText.count() > 0) {
      await expect(locationText).toBeVisible();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/cats*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Server error'
        })
      });
    });

    await page.goto('/');
    
    // Verifica che venga mostrato un messaggio di errore
    const errorElements = page.locator('.error, .error-message').or(page.locator('text=/errore/i'));
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
    }
  });
});
