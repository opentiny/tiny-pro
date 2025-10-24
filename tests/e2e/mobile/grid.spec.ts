import { test, expect } from '@playwright/test';

test('移动端表格横向滚动', async ({ page }) => {
  await page.goto('http://localhost:3031/vue-pro/login');
  await page.getByRole('button', { name: '登录' }).click();
  await page.locator('.tiny-tree-menu__toggle-button').click();
  await page.getByTitle('List').click();
  await page.getByTitle('Table').click();
  await page.locator('.tiny-tree-menu__toggle-button').click();
  await expect(page.locator('.tiny-grid__body-wrapper .tiny-grid__body').first()).toBeVisible();

  const bodyWrapper = page.locator('.tiny-grid__body-wrapper').first();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  const initialScrollLeft = await bodyWrapper.evaluate(el => el.scrollLeft)
  await bodyWrapper.evaluate(el => { el.scrollLeft += 700 })
  await page.waitForTimeout(300)
  const afterScrollLeft = await bodyWrapper.evaluate(el => el.scrollLeft)
  expect(afterScrollLeft).toBeGreaterThan(initialScrollLeft)
  await expect(page.getByText('操作')).toBeVisible();
});

test('移动端mini表格', async ({ page }) => {
  await page.goto('http://localhost:3031/vue-pro/login');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page.locator('canvas').nth(2)).toBeVisible();
  const wrappers = page.locator('div.tiny-grid__wrapper');
  const count = await wrappers.count();
  for (let i = 0; i < count; i++) {
    await expect(wrappers.nth(i)).toHaveClass(/size__mini/);
  }
});