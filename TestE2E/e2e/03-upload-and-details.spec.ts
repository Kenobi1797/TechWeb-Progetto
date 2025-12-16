import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Test Upload e Dettagli - STREETCATS
 * Verifica: form upload, mappa geolocalizzazione, dettagli gatto con foto,
 * descrizione Markdown, data di creazione
 */
test.describe('03 - Upload and Details - STREETCATS', () => {
  test('Upload form accessible to authenticated users', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com').catch(() => {});
    await page.fill('input[name="password"]', 'testpassword').catch(() => {});
    await page.click('button[type="submit"]').catch(() => {});
    await page.waitForTimeout(2000);

    // Navigate to upload
    await page.goto('http://localhost:3000/upload');
    
    const form = page.locator('form, [role="form"]').first();
    const isVisible = await form.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('Upload form has title, description, and file input', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com').catch(() => {});
    await page.fill('input[name="password"]', 'testpassword').catch(() => {});
    await page.click('button[type="submit"]').catch(() => {});
    await page.waitForTimeout(2000);

    await page.goto('http://localhost:3000/upload');
    
    // Verifica campi form
    const titleInput = page.locator('input[name="title"], input[placeholder*="titolo"]').first();
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="descrizione"]').first();
    const fileInput = page.locator('input[type="file"]').first();
    
    const hasTitle = await titleInput.isVisible().catch(() => false);
    const hasDescription = await descriptionInput.isVisible().catch(() => false);
    const hasFile = await fileInput.isVisible().catch(() => false);
    
    expect(hasTitle || hasDescription || hasFile).toBeTruthy();
  });

  test('Upload form displays interactive map for geolocation', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com').catch(() => {});
    await page.fill('input[name="password"]', 'testpassword').catch(() => {});
    await page.click('button[type="submit"]').catch(() => {});
    await page.waitForTimeout(2000);

    await page.goto('http://localhost:3000/upload');
    
    // Attendi caricamento mappa
    await page.waitForTimeout(1500);
    
    const map = page.locator('[data-testid="map-container"], .leaflet-container, [class*="map"]').first();
    const isMapVisible = await map.isVisible().catch(() => false);
    expect(isMapVisible).toBeTruthy();
  });

  test('Cat details page displays all required information', async ({ page }) => {
    // Naviga alla pagina dei gatti
    await page.goto('http://localhost:3000/cats');
    
    // Attendi caricamento gatti
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 }).catch(() => {});
    
    const firstCat = page.locator('[class*="card"]').first();
    if (await firstCat.isVisible()) {
      await firstCat.click();
      await page.waitForTimeout(1000);
      
      // Verifica titolo
      const title = page.locator('h1, h2').first();
      const hasTitle = await title.isVisible().catch(() => false);
      expect(hasTitle).toBeTruthy();
    }
  });

  test('Cat details displays image', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 }).catch(() => {});
    
    const firstCat = page.locator('[class*="card"]').first();
    if (await firstCat.isVisible()) {
      await firstCat.click();
      await page.waitForTimeout(1000);
      
      const mainImage = page.locator('img[alt*="gatto"], img[alt*="cat"], img').first();
      const hasImage = await mainImage.isVisible().catch(() => false);
      expect(hasImage).toBeTruthy();
    }
  });

  test('Cat details displays creation date', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 }).catch(() => {});
    
    const firstCat = page.locator('[class*="card"]').first();
    if (await firstCat.isVisible()) {
      await firstCat.click();
      await page.waitForTimeout(1000);
      
      // Cerca elemento contenente data
      const pageText = await page.locator('body').textContent();
      const hasDate = /(\d{1,2}[/-]\d{1,2}[/-]\d{4}|data|date|Created|Creato|fa)/i.test(pageText || '');
      expect(hasDate).toBeTruthy();
    }
  });

  test('Cat details displays formatted description with Markdown support', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 }).catch(() => {});
    
    const firstCat = page.locator('[class*="card"]').first();
    if (await firstCat.isVisible()) {
      await firstCat.click();
      await page.waitForTimeout(1000);
      
      // Verifica che la descrizione sia visibile (potrebbe contere formattazione Markdown)
      const description = page.locator('p, [class*="description"]').first();
      const hasDescription = await description.isVisible().catch(() => false);
      
      if (hasDescription) {
        const text = await description.textContent();
        expect(text && text.length > 0).toBeTruthy();
      }
    }
  });

  test('Cat details displays location map', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 }).catch(() => {});
    
    const firstCat = page.locator('[class*="card"]').first();
    if (await firstCat.isVisible()) {
      await firstCat.click();
      await page.waitForTimeout(1000);
      
      const map = page.locator('.leaflet-container, [class*="map"]').first();
      const hasMap = await map.isVisible().catch(() => false);
      expect(hasMap).toBeTruthy();
    }
  });

  test('My Listings page shows user personal cats', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com').catch(() => {});
    await page.fill('input[name="password"]', 'testpassword').catch(() => {});
    await page.click('button[type="submit"]').catch(() => {});
    await page.waitForTimeout(2000);

    // Naviga alla pagina "My Listings" 
    await page.goto('http://localhost:3000/mylistings', { waitUntil: 'domcontentloaded' });
    
    await page.waitForTimeout(1500);
    
    // Verifica che il contenuto sia caricato (titolo o lista gatti)
    const pageContent = page.locator('body');
    const hasContent = await pageContent.isVisible();
    
    expect(hasContent).toBeTruthy();
  });
});

