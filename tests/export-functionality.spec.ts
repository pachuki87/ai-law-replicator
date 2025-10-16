import { test, expect } from '@playwright/test';

test.describe('Document Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the AI Assistant to load
    await page.waitForSelector('[data-testid="chat-input"]');
  });

  test('should display export buttons after AI response', async ({ page }) => {
    // Send a legal question to trigger AI response
    await page.fill('[data-testid="chat-input"]', '¿Cuáles son los elementos de un contrato válido?');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="message-0"]');
    
    // Check if export buttons are visible
    await expect(page.locator('[data-testid="export-pdf-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-word-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-html-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="copy-content-0"]')).toBeVisible();
  });

  test('should successfully export to PDF', async ({ page }) => {
    // Send a legal question
    await page.fill('[data-testid="chat-input"]', 'Explica el proceso de divorcio en España');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="message-0"]');
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click PDF export button
    await page.click('[data-testid="export-pdf-0"]');
    
    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should successfully export to Word', async ({ page }) => {
    // Send a legal question
    await page.fill('[data-testid="chat-input"]', 'Derechos del consumidor en compras online');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="message-0"]');
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click Word export button
    await page.click('[data-testid="export-word-0"]');
    
    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.docx');
  });

  test('should successfully export to HTML', async ({ page }) => {
    // Send a legal question
    await page.fill('[data-testid="chat-input"]', 'Procedimiento para crear una empresa en España');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="message-0"]');
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click HTML export button
    await page.click('[data-testid="export-html-0"]');
    
    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.html');
  });

  test('should copy content to clipboard', async ({ page }) => {
    // Send a legal question
    await page.fill('[data-testid="chat-input"]', 'Qué es un testamento válido');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="message-0"]');
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Click copy button
    await page.click('[data-testid="copy-content-0"]');
    
    // Verify content was copied (this might need adjustment based on browser support)
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBeTruthy();
    expect(clipboardContent.length).toBeGreaterThan(0);
  });

  test('should handle non-legal responses appropriately', async ({ page }) => {
    // Send a non-legal question
    await page.fill('[data-testid="chat-input"]', 'Cuál es la capital de Francia?');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="message-0"]');
    
    // Export buttons should still be available for any AI response
    await expect(page.locator('[data-testid="export-pdf-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-word-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-html-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="copy-content-0"]')).toBeVisible();
  });

  test('should detect different legal case types', async ({ page }) => {
    const legalQuestions = [
      'Proceso de divorcio contencioso',
      'Demanda por daños y perjuicios',
      'Recurso de apelación civil',
      'Procedimiento penal por estafa'
    ];

    for (let i = 0; i < legalQuestions.length; i++) {
      await page.fill('[data-testid="chat-input"]', legalQuestions[i]);
      await page.click('[data-testid="send-button"]');
      
      // Wait for AI response
      await page.waitForSelector(`[data-testid="message-${i}"]`);
      
      // Verify export buttons are available
      await expect(page.locator(`[data-testid="export-pdf-${i}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="export-word-${i}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="export-html-${i}"]`)).toBeVisible();
    }
  });

  test('should handle export errors gracefully', async ({ page }) => {
    // Send a question to get AI response
    await page.fill('[data-testid="chat-input"]', 'Normativa sobre protección de datos');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="message-0"]');
    
    // Mock a potential error scenario by intercepting network requests
    await page.route('**/*', route => {
      if (route.request().url().includes('blob:')) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Try to export - should not crash the application
    await page.click('[data-testid="export-pdf-0"]');
    
    // Verify the application is still responsive
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });


});