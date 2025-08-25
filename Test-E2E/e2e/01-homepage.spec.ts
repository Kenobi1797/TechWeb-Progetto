import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('STREETCATS homepage loads correctly', async ({ page }) => {
    // Verifica che il titolo della pagina sia corretto
    await expect(page).toHaveTitle(/Streetcats/);
    
    // Verifica la presenza dell'header principale
    await expect(page.locator('h1')).toContainText('Avvistamenti di gatti');
    
    // Verifica la presenza della descrizione
    await expect(page.getByText(/Esplora gli ultimi avvistamenti/)).toBeVisible();
    
    // Verifica che ci sia il navigation header
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('Search functionality moved to cats page', async ({ page }) => {
    // La barra di ricerca è stata spostata nella pagina gatti
    await page.getByRole('link', { name: /gatti|cats/i }).click();
    await expect(page).toHaveURL(/.*\/cats/);
    
    // Verifica la presenza dei filtri di ricerca
    await expect(page.getByText('🔍 Filtri di ricerca')).toBeVisible();
    
    // Verifica che ci siano i filtri dropdown
    await expect(page.getByLabel('Ordina per:')).toBeVisible();
    await expect(page.getByLabel('Periodo:')).toBeVisible();
    await expect(page.getByLabel('Stato:')).toBeVisible();
  });

  test('Map is displayed on homepage', async ({ page }) => {
    // Attendi che la mappa carichi
    await page.waitForTimeout(2000);
    
    // Verifica che il container della mappa sia presente
    const mapContainer = page.locator('[data-testid="map-container"], .leaflet-container');
    await expect(mapContainer).toBeVisible();
  });

  test('Cat grid shows loading state initially', async ({ page }) => {
    // Ricarica la pagina per catturare il loading state
    await page.reload();
    
    // Verifica la presenza del loading spinner o skeleton
    const loadingElement = page.locator('text="Caricamento avvistamenti..."').or(page.locator('[data-testid="cat-skeleton"]'));
    await expect(loadingElement).toBeVisible({ timeout: 1000 });
  });

  test('Navigation menu is present and functional', async ({ page }) => {
    // Verifica che ci siano i link di navigazione
    await expect(page.getByRole('link', { name: /mappa/i })).toBeVisible();
    
    // Il link carica potrebbe non essere visibile per utenti non autenticati
    const uploadLink = page.getByRole('link', { name: /carica|upload|nuovo/i });
    const isUploadVisible = await uploadLink.isVisible();
    
    if (isUploadVisible) {
      await expect(uploadLink).toBeVisible();
    } else {
      // Se non è visibile, verifica che ci sia almeno un link di login/registrazione
      await expect(page.getByRole('link', { name: /accedi|login|registrati/i }).first()).toBeVisible();
    }
    
    // Test mobile menu se presente
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });
});
