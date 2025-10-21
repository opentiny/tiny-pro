import { test, expect } from '@playwright/test';

test('移动端默认收起菜单', async ({ page }) => {
  await page.goto('http://localhost:3031/vue-pro/login');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page.locator("div[role='tree']")).toBeHidden(); 

  await page.locator('.tiny-tree-menu__toggle-button').click();
  await expect(page.locator("div[role='tree']")).toBeVisible();
});