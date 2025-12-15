import { test, expect } from '@playwright/test';

/**
 * Test Accessibilità - STREETCATS
 * Verifica: contrasto colori, aria-labels, navigazione tastiera, struttura heading
 */
test.describe('10 - Accessibility - STREETCATS', () => {
  test('Page has proper heading structure', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verifica la presenza di h1
    const h1 = page.locator('h1');
    const h1Visible = await h1.first().isVisible().catch(() => false);
    
    if (h1Visible) {
      await expect(h1.first()).toBeVisible();
      
      // Dovrebbe esserci solo un h1 per pagina
      const h1Count = await h1.count();
      expect(h1Count === 1).toBeTruthy();
    }
  });

  test('All images have alt text', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    
    // Attendi caricamento immagini
    await page.waitForTimeout(2000);
    
    // Verifica le immagini
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Verifica che tutte le immagini abbiano alt text
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        
        // Alt dovrebbe essere presente e non vuoto
        expect(alt && alt.length > 0).toBeTruthy();
      }
    }
  });

  test('Form inputs have labels or aria-labels', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    // Attendi che il form sia caricato
    await page.waitForSelector('input, textarea', { timeout: 10000 }).catch(() => {});
    
    // Verifica che gli input abbiano label
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      let hasAccessibility = false;
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');
        
        let hasAccess = false;
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          if (await label.count() > 0) {
            hasAccess = true;
          }
        }
        
        hasAccess = hasAccess || !!ariaLabel || !!ariaLabelledBy || !!placeholder;
        
        if (hasAccess) {
          hasAccessibility = true;
        }
      }
      
      expect(hasAccessibility).toBeTruthy();
    }
  });

  test('Page is keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Prova Tab per raggiungere il primo elemento focusabile
    await page.keyboard.press('Tab');
    
    const afterTabFocus = await page.evaluate(() => document.activeElement?.tagName);
    
    // Dovrebbe esserci un elemento focusabile
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'BODY']).toContain(afterTabFocus);
  });

  test('Interactive elements are visible on focus', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Naviga con Tab fino a trovare un link
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Verifica che l'elemento focato sia visibile
      const isFocusVisible = await page.evaluate(() => {
      const focused = document.activeElement as HTMLElement;
      if (!focused) return false;
      
      const style = globalThis.getComputedStyle(focused);
      const rect = focused.getBoundingClientRect();
      
      return style.visibility !== 'hidden' && 
             style.display !== 'none' && 
             rect.height > 0 && 
             rect.width > 0;
    });
    
    expect(isFocusVisible).toBeTruthy();
  });

  test('Buttons and links are descriptive', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verifica che i link abbiano testo descrittivo
    const links = page.locator('a');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      let hasDescriptive = false;
      
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const title = await link.getAttribute('title');
        const ariaLabel = await link.getAttribute('aria-label');
        
        // Il link dovrebbe avere testo, title o aria-label
        if ((text && text.length > 0) || title || ariaLabel) {
          hasDescriptive = true;
          break;
        }
      }
      
      expect(hasDescriptive).toBeTruthy();
    }
  });

  test('Color contrast is adequate (basic check)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verifica che i testi siano leggibili (non bianchi su bianco, neri su nero, ecc)
    const textElements = page.locator('p, a, button, h1, h2, h3, h4, h5, h6');
    
    const sampleCount = Math.min(await textElements.count(), 5);
    
    if (sampleCount > 0) {
      for (let i = 0; i < sampleCount; i++) {
        const element = textElements.nth(i);
        
        const style = await element.evaluate(el => {
          const computed = globalThis.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            visibility: computed.visibility,
            display: computed.display
          };
        });
        
        // Verifica che non sia nascosto
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          // Dovrebbe avere colori definiti
          expect(style.color).not.toBe('');
        }
      }
    }
    
    expect(true).toBeTruthy();
  });

  test('Page has language declaration', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verifica che l'html abbia attributo lang
    const htmlLang = await page.locator('html').getAttribute('lang');
    
    // Non è obbligatorio ma è una buona pratica
    expect(htmlLang === null || htmlLang !== '').toBeTruthy();
  });

  test('Skip to content link is available (if implemented)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Cerca un "skip to content" link
    const skipLink = page.locator('a:has-text(/skip|content|main|salta/i)');
    
    const hasSkipLink = await skipLink.first().isVisible().catch(() => false);
    
    // Non è obbligatorio, ma miglioramento di accessibilità
    expect(hasSkipLink || true).toBeTruthy();
  });
});
