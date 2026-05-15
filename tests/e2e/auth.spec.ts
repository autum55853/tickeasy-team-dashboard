import { test, expect } from '@playwright/test';

const VALID_TOKEN = 'test-jwt-token';

test.describe('認證流程', () => {
  test('無 token 訪問 /dashboard → 重導向到前端登入頁', async ({ page }) => {
    const response = await page.goto('/dashboard');
    // middleware 應 redirect 到外部登入頁
    expect(page.url()).toContain('frontend-amber.onrender.com/login');
  });

  test('URL 帶 ?token= → Cookie 寫入、URL 清除、頁面可用', async ({ page }) => {
    // 模擬從前端帶 token 跳轉
    await page.goto(`/dashboard?token=${VALID_TOKEN}`);

    // URL 應被清除 token 參數
    expect(page.url()).not.toContain('token=');
    expect(page.url()).toContain('/dashboard');

    // Cookie 應已設定
    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find((c) => c.name === 'tickeasy_token');
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie?.value).toBe(VALID_TOKEN);
  });

  test('注入 Cookie 後訪問 /dashboard → 放行（不重導向）', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'tickeasy_token',
        value: VALID_TOKEN,
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');
    // 不應被導向外部
    expect(page.url()).not.toContain('frontend-amber.onrender.com');
  });
});
