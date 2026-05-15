import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/(dashboard)/dashboard/users/update-role/route';

const makeRequest = (body: unknown, authHeader?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['authorization'] = authHeader;
  return new NextRequest('http://localhost/dashboard/users/update-role', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('POST /dashboard/users/update-role', () => {
  it('無 Authorization header → 401', async () => {
    const req = makeRequest({ userId: 'u1', newRole: 'admin' });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('缺少 userId → 400', async () => {
    const req = makeRequest({ newRole: 'admin' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('缺少 newRole → 400', async () => {
    const req = makeRequest({ userId: 'u1' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('後端成功 → 200 { success: true }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: '角色已更新' }),
    }));

    const req = makeRequest({ userId: 'u1', newRole: 'admin' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('後端回錯誤 → 對應 status + { success: false }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: '權限不足' }),
    }));

    const req = makeRequest({ userId: 'u1', newRole: 'superuser' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('fetch 拋出例外 → 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));

    const req = makeRequest({ userId: 'u1', newRole: 'admin' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
