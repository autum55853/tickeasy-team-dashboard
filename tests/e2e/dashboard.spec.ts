import { test, expect } from '@playwright/test';

const VALID_TOKEN = 'test-jwt-token';

// 每個 test 前注入 Cookie 繞過 middleware 認證
test.beforeEach(async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'tickeasy_token',
      value: VALID_TOKEN,
      domain: 'localhost',
      path: '/',
    },
  ]);
});

test.describe('儀表板主要頁面', () => {
  test('/dashboard → 顯示四個統計卡片', async ({ page }) => {
    await page.goto('/dashboard');

    // 等待頁面渲染完成
    await page.waitForLoadState('networkidle');

    // 統計卡片應存在（StatsCard 標題）
    await expect(page.locator('text=總用戶數')).toBeVisible();
    await expect(page.locator('text=總演唱會數')).toBeVisible();
    await expect(page.locator('text=總訂單數')).toBeVisible();
    await expect(page.locator('text=待審核')).toBeVisible();
  });

  test('/dashboard/users → 用戶表格顯示', async ({ page }) => {
    await page.goto('/dashboard/users');
    await page.waitForLoadState('networkidle');

    // 頁面標題或表格 header
    await expect(page.locator('text=用戶管理')).toBeVisible();
  });

  test('/dashboard/concerts → 演唱會表格顯示', async ({ page }) => {
    await page.goto('/dashboard/concerts');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=演唱會管理')).toBeVisible();
  });

  test('/dashboard/orders → 訂單表格顯示', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=訂單管理')).toBeVisible();
  });
});
