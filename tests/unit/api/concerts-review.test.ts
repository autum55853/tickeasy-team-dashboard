import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/(dashboard)/dashboard/concerts/review/route';

// mock next/cache revalidatePath
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const makeRequest = (body: unknown, authHeader?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['authorization'] = authHeader;
  return new NextRequest('http://localhost/dashboard/concerts/review', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('POST /dashboard/concerts/review', () => {
  it('無 Authorization header → 401', async () => {
    const req = makeRequest({ concertId: 'c1', reviewStatus: 'approved' });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('缺少授權資訊');
  });

  it('後端成功 → 200 { success: true }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => '',
    }));

    const req = makeRequest(
      { concertId: 'c1', reviewStatus: 'approved', reviewerNote: '通過' },
      'Bearer jwt-abc'
    );
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('後端回 4xx → 500 { success: false }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => '後端錯誤訊息',
    }));

    const req = makeRequest({ concertId: 'c1', reviewStatus: 'rejected' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBeTruthy();
  });

  it('fetch 拋出例外 → 500 伺服器錯誤', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    const req = makeRequest({ concertId: 'c1', reviewStatus: 'approved' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});
