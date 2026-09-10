import { test, expect } from '@playwright/test';

test('generate a URL QR, add a logo, save, reload, still in history', async ({ page }) => {
  await page.goto('/#/');
  await page.getByLabel(/text or url/i).fill('https://example.com');

  // Pick a Simple Icons logo.
  await page.getByLabel(/search icons/i).fill('github');
  await page.getByRole('button', { name: 'GitHub' }).first().click();

  await expect(page.locator('.preview svg').first()).toBeVisible();

  await page.getByRole('button', { name: /save to history/i }).click();
  // Wait until IndexedDB actually has the entry before navigating; the onclick
  // handler is async so a bare goto would race the write.
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const req = indexedDB.open('qrcode-history');
        req.onsuccess = () => {
          const tx = req.result.transaction('history', 'readonly');
          const count = tx.objectStore('history').count();
          count.onsuccess = () => resolve((count.result as number) > 0);
          count.onerror = () => resolve(false);
        };
        req.onerror = () => resolve(false);
      }),
    undefined,
    { timeout: 10_000 }
  );

  await page.goto('/#/history');
  // The HistoryList renders <strong>{entry.kind}</strong> for each saved entry.
  await expect(page.locator('strong').filter({ hasText: 'url' })).toBeVisible({ timeout: 10_000 });

  await page.reload();
  await expect(page.locator('strong').filter({ hasText: 'url' })).toBeVisible({ timeout: 10_000 });
});
