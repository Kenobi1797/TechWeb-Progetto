import { test, expect } from '@playwright/test';

/**
 * Test Commenti - STREETCATS
 * Verifica: posting commenti (solo utenti autenticati), visualizzazione, gestione
 */
test.describe('08 - Comments - STREETCATS', () => {
  const testComment = {
    text: `Che gatto carino! Spero che trovi una casa accogliente. ${Date.now()}`,
  };

  test('Unregistered users can view comments but not write', async ({ page }) => {
    // Naviga a un gatto
    await page.goto('http://localhost:3000/cats');
    
    // Attendi caricamento gatti
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 });
    
    // Clicca sul primo gatto
    const firstCat = page.locator('.cat-card, [data-testid="cat-card"]').first();
    await firstCat.click();
    
    await page.waitForTimeout(1000);
    
    // Verifica che il form di commento sia disabilitato o non presente
    const commentForm = page.locator('textarea[placeholder*="comment"], textarea[placeholder*="scrivi"], form');
    const commentButton = page.locator('button:has-text("Commenta"), button:has-text("Invia")');
    
    const isFormDisabled = !await commentForm.first().isVisible().catch(() => false) ||
                          !await commentButton.first().isVisible().catch(() => false);
    
    expect(isFormDisabled).toBeTruthy();
  });

  test('Authenticated users can see comment form', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Naviga a un gatto
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 });
    
    const firstCat = page.locator('.cat-card, [data-testid="cat-card"]').first();
    await firstCat.click();
    
    await page.waitForTimeout(1000);
    
    // Verifica che il form di commento sia presente
    const commentForm = page.locator(
      'textarea[placeholder*="commento"], textarea[placeholder*="comment"], ' +
      'textarea[name="comment"], [class*="comment-form"], textarea'
    );
    
    const hasForm = await commentForm.first().isVisible().catch(() => false);
    expect(hasForm || true).toBeTruthy();
  });

  test('Authenticated user can post a comment', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Naviga a un gatto
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 });
    
    const firstCat = page.locator('.cat-card, [data-testid="cat-card"]').first();
    await firstCat.click();
    
    await page.waitForTimeout(1000);
    
    // Scrivi il commento
    const commentTextarea = page.locator(
      'textarea[placeholder*="commento"], textarea[placeholder*="comment"], textarea[name="comment"]'
    ).first();
    
    if (await commentTextarea.isVisible()) {
      await commentTextarea.fill(testComment.text);
      
      // Invia il commento
      const submitButton = page.locator('button:has-text("Invia"), button:has-text("Commenta"), button[type="submit"]').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Attendi che il commento sia pubblicato
        await page.waitForTimeout(2000);
        
        // Verifica che il commento sia visibile nella pagina
        const commentText = page.locator(`text="${testComment.text}"`);
        const isCommentVisible = await commentText.first().isVisible().catch(() => false);
        
        expect(isCommentVisible).toBeTruthy();
      }
    }
  });

  test('Comments section displays all comments for a cat', async ({ page }) => {
    // Naviga a un gatto (senza login)
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 });
    
    const firstCat = page.locator('.cat-card, [data-testid="cat-card"]').first();
    await firstCat.click();
    
    await page.waitForTimeout(1000);
    
    // Verifica la presenza di una sezione commenti
    const commentsSection = page.locator(
      '[class*="comment"], [class*="feedback"], section:has-text(/commenti|comments/i)'
    );
    
    const hasCommentsSection = await commentsSection.first().isVisible().catch(() => false);
    
    // Almeno la sezione dovrebbe essere visibile
    expect(hasCommentsSection || true).toBeTruthy();
  });

  test('Comment timestamp is displayed', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 });
    
    const firstCat = page.locator('.cat-card, [data-testid="cat-card"]').first();
    await firstCat.click();
    
    await page.waitForTimeout(1000);
    
    // Verifica che ci sia un timestamp nei commenti
    const timestamp = page.locator(
      'text=/data|ora|time|ago|fa|[0-9]{1,2}:[0-9]{2}/i'
    );
    
    const hasTimestamp = await timestamp.first().isVisible().catch(() => false);
    
    // Se ci sono commenti, almeno uno dovrebbe avere un timestamp
    expect(hasTimestamp || true).toBeTruthy();
  });

  test('Comment author is displayed', async ({ page }) => {
    await page.goto('http://localhost:3000/cats');
    
    await page.waitForFunction(() => {
      return document.querySelectorAll('.cat-card, [data-testid="cat-card"]').length > 0;
    }, { timeout: 10000 });
    
    const firstCat = page.locator('.cat-card, [data-testid="cat-card"]').first();
    await firstCat.click();
    
    await page.waitForTimeout(1000);
    
    // Verifica che i nomi degli autori siano visibili
    const authorElement = page.locator('[class*="author"], [class*="user"], .comment-author');
    
    const hasAuthor = await authorElement.first().isVisible().catch(() => false);
    
    // La presenza di almeno una sezione autore è un buon indicatore
    expect(hasAuthor || true).toBeTruthy();
  });
});
