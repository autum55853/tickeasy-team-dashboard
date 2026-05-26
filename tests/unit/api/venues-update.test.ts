import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/(dashboard)/dashboard/venues/update/route';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const makeRequest = (body: unknown, authHeader?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['authorization'] = authHeader;
  return new NextRequest('http://localhost/dashboard/venues/update', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('POST /dashboard/venues/update', () => {
  it('無 Authorization header → 401', async () => {
    const req = makeRequest({ venueId: 'v1', venueName: '台北小巨蛋' });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('缺少授權資訊');
  });

  it('缺少 venueId → 400', async () => {
    const req = makeRequest({ venueName: '台北小巨蛋' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('缺少 venueId');
  });

  it('後端成功 → 200 { success: true }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    }));

    const req = makeRequest(
      { venueId: 'v1', venueName: '台北小巨蛋', venueAddress: '台北市松山區南京東路四段一號' },
      'Bearer jwt-abc'
    );
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('後端回錯誤 → 500 { success: false, error 含後端訊息 }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => '場地不存在',
    }));

    const req = makeRequest({ venueId: 'v1', venueName: 'X' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('場地不存在');
  });

  it('fetch 拋出例外 → 500 伺服器錯誤', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));

    const req = makeRequest({ venueId: 'v1', venueName: 'X' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('成功時正確轉發 Authorization header 與 PATCH 至後端', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' });
    vi.stubGlobal('fetch', fetchMock);

    const req = makeRequest(
      { venueId: 'v1', venueName: '台北小巨蛋', venueCapacity: 15000 },
      'Bearer test-token'
    );
    await POST(req);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/venues/v1'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      })
    );

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(callBody.venueName).toBe('台北小巨蛋');
    expect(callBody.venueCapacity).toBe(15000);
    expect(callBody.venueId).toBeUndefined();
  });
});
