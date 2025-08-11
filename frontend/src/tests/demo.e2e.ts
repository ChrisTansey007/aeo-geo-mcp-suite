import { test, expect } from '@playwright/test';

test('demo endpoint shows results', async ({ page }) => {
  await page.route('**/api/demo', (route) => {
    route.fulfill({ json: { result: 'ok' } });
  });
  await page.goto('/');
  await page.evaluate(async () => {
    const res = await fetch('/api/demo');
    const data = await res.json();
    const div = document.createElement('div');
    div.id = 'demo-result';
    div.textContent = data.result;
    document.body.appendChild(div);
  });
  await expect(page.locator('#demo-result')).toHaveText('ok');
});
