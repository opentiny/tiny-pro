import { test, expect } from '@playwright/test';

test('移动端模态框宽度100%', async ({ page }) => {
  await page.goto('http://localhost:3031/vue-pro/login');
  await page.getByRole('button', { name: '登录' }).click();
  await page.locator('.tiny-tree-menu__toggle-button').click();
  await page.getByTitle('SystemManager').click();
  await page.getByTitle('AllMenu').click();
  await page.locator('.tiny-tree-menu__toggle-button').click();
  await page.locator("div[class='menu-add-btn'] button[type='button']").click();
  await expect(page.locator("(//div[@class='tiny-modal__box'])[1]")).toBeVisible();

  const modal = page.locator("(//div[@class='tiny-modal__box'])[1]");
  await expect(modal).toHaveAttribute('style', /width:\s*100%/);
});