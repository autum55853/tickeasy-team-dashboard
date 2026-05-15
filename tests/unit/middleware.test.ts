import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

const makeRequest = (url: string, cookieToken?: string) => {
  const req = new NextRequest(url);
  if (cookieToken) {
    req.cookies.set('tickeasy_token', cookieToken);
  }
  return req;
};

describe('middleware', () => {
  it('Cookie 存在，訪問 /dashboard → 放行（status 200）', async () => {
    const req = makeRequest('http://localhost/dashboard', 'valid-jwt');
    const res = await middleware(req);

    // NextResponse.next() 不設定 Location，status 為 200
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('URL 帶 ?token=，無 Cookie → Set-Cookie + 302 到乾淨 URL', async () => {
    const req = makeRequest('http://localhost/dashboard?token=jwt-from-url&userInfo=xyz');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/dashboard');
    expect(location).not.toContain('token=');

    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('tickeasy_token=jwt-from-url');
  });

  it('無 Cookie、無 token → 302 到前端登入頁', async () => {
    const req = makeRequest('http://localhost/dashboard');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('frontend-amber.onrender.com/login');
    expect(location).toContain('next=');
  });

  it('非 /dashboard 路徑（/auth/login）→ 放行', async () => {
    const req = makeRequest('http://localhost/auth/login');
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
