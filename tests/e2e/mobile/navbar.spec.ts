import { test, expect } from '@playwright/test';

test('测试移动端右上角折叠导航栏展开与折叠', async ({ page }) => {
  await page.goto('http://localhost:3031/vue-pro/login');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page.locator('.menu-toggle')).toBeVisible();
  
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.right-side.open')).toBeVisible();
});