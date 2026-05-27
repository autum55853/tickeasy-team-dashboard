import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleCrossDomainAuth,
  getAuthToken,
  getCurrentUser,
  clearAuthData,
} from '@/lib/auth-utils';

// 每次測試前重置 cookie、localStorage 與 URL
beforeEach(() => {
  document.cookie = 'tickeasy_token=; path=/; max-age=0';
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});

// ─── handleCrossDomainAuth ───────────────────────────────────────────────────

describe('handleCrossDomainAuth', () => {
  it('URL 有 token + userInfo → 寫入 cookie、localStorage，清除 URL params', () => {
    const user = { userId: 'u1', name: 'Alice', role: 'admin' };
    const encoded = encodeURIComponent(JSON.stringify(user));
    window.history.replaceState({}, '', `/?token=jwt-abc&userInfo=${encoded}`);

    const result = handleCrossDomainAuth();

    expect(result).toBe(true);
    expect(document.cookie).toContain('tickeasy_token=jwt-abc');
    expect(localStorage.getItem('tickeasy_user')).toBe(JSON.stringify(user));
    expect(window.location.search).toBe('');
  });

  it('URL 無參數 → 不寫入任何 storage，回傳 false', () => {
    window.history.replaceState({}, '', '/dashboard');

    const result = handleCrossDomainAuth();

    expect(result).toBe(false);
    expect(document.cookie).not.toContain('tickeasy_token=');
    expect(localStorage.getItem('tickeasy_user')).toBeNull();
  });

  it('URL 只有 token 無 userInfo → 不寫入，回傳 false', () => {
    window.history.replaceState({}, '', '/?token=jwt-abc');

    const result = handleCrossDomainAuth();

    expect(result).toBe(false);
  });

  it('userInfo 為損毀 JSON → 不拋錯，回傳 false', () => {
    window.history.replaceState({}, '', '/?token=jwt-abc&userInfo=not-valid-json');

    expect(() => handleCrossDomainAuth()).not.toThrow();
    const result = handleCrossDomainAuth();
    expect(result).toBe(false);
  });
});

// ─── getAuthToken ────────────────────────────────────────────────────────────

describe('getAuthToken', () => {
  it('Cookie 存在 → 回傳正確 token', () => {
    document.cookie = 'tickeasy_token=my-token; path=/';

    expect(getAuthToken()).toBe('my-token');
  });

  it('Cookie 不存在 → 回傳 null', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('token 值含特殊字元（URL encoded）→ 正確 decode', () => {
    const raw = 'a b+c';
    document.cookie = `tickeasy_token=${encodeURIComponent(raw)}; path=/`;

    expect(getAuthToken()).toBe(raw);
  });
});

// ─── getCurrentUser ──────────────────────────────────────────────────────────

describe('getCurrentUser', () => {
  it('localStorage 有合法 JSON → 回傳解析後物件', () => {
    const user = { userId: 'u1', name: 'Alice' };
    localStorage.setItem('tickeasy_user', JSON.stringify(user));

    expect(getCurrentUser()).toEqual(user);
  });

  it('localStorage 無資料 → 回傳 null', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('localStorage 有損毀 JSON → 不拋錯，回傳 null', () => {
    localStorage.setItem('tickeasy_user', '{broken json');

    expect(() => getCurrentUser()).not.toThrow();
    expect(getCurrentUser()).toBeNull();
  });
});

// ─── clearAuthData ───────────────────────────────────────────────────────────

describe('clearAuthData', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('立即清除 localStorage / Cookie 並導向前台 logout-broadcast', () => {
    document.cookie = 'tickeasy_token=jwt-abc; path=/';
    localStorage.setItem('tickeasy_user', '{"userId":"u1"}');
    localStorage.setItem('tickeasy_token', 'jwt-abc');

    clearAuthData();

    expect(localStorage.getItem('tickeasy_user')).toBeNull();
    expect(localStorage.getItem('tickeasy_token')).toBeNull();
    expect(document.cookie).not.toContain('tickeasy_token=jwt-abc');
    expect(window.location.href).toBe('https://frontend-amber.onrender.com/auth/logout-broadcast');
  });

  it('尊重 NEXT_PUBLIC_FRONTEND_URL 環境變數', () => {
    vi.stubEnv('NEXT_PUBLIC_FRONTEND_URL', 'https://custom-frontend.example.com');

    clearAuthData();

    expect(window.location.href).toBe('https://custom-frontend.example.com/auth/logout-broadcast');
    vi.unstubAllEnvs();
  });
});
