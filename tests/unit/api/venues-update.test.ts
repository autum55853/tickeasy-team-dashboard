import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH, DELETE } from '@/app/(dashboard)/dashboard/venues/[venueId]/route';
import { POST } from '@/app/(dashboard)/dashboard/venues/create/route';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const makeRequest = (method: string, body: unknown, authHeader?: string, url = 'http://localhost') => {
  const headers: Record<string, string> = {};
  if (body !== null) headers['Content-Type'] = 'application/json';
  if (authHeader) headers['authorization'] = authHeader;
  return new NextRequest(url, {
    method,
    headers,
    body: body !== null ? JSON.stringify(body) : undefined,
  });
};

const venueParams = (venueId: string) => ({ params: { venueId } });

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('PATCH /dashboard/venues/[venueId]', () => {
  it('無 Authorization header → 401', async () => {
    const req = makeRequest('PATCH', { venueName: '台北小巨蛋' });
    const res = await PATCH(req, venueParams('v1'));

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('缺少授權資訊');
  });

  it('後端成功 → 200 { success: true }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    }));

    const req = makeRequest('PATCH', { venueName: '台北小巨蛋', venueAddress: '台北市' }, 'Bearer jwt-abc');
    const res = await PATCH(req, venueParams('v1'));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('後端回錯誤 → 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => '場地不存在',
    }));

    const req = makeRequest('PATCH', { venueName: 'X' }, 'Bearer jwt-abc');
    const res = await PATCH(req, venueParams('v1'));

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('場地不存在');
  });

  it('fetch 拋出例外 → 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));

    const req = makeRequest('PATCH', { venueName: 'X' }, 'Bearer jwt-abc');
    const res = await PATCH(req, venueParams('v1'));

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('正確轉發 Authorization header 與 PATCH 至後端', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' });
    vi.stubGlobal('fetch', fetchMock);

    const req = makeRequest('PATCH', { venueName: '台北小巨蛋', venueCapacity: 15000 }, 'Bearer test-token');
    await PATCH(req, venueParams('v1'));

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
  });
});

describe('DELETE /dashboard/venues/[venueId]', () => {
  it('無 Authorization header → 401', async () => {
    const req = makeRequest('DELETE', null);
    const res = await DELETE(req, venueParams('v1'));

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('後端成功 → 200 { success: true }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const req = makeRequest('DELETE', null, 'Bearer jwt-abc');
    const res = await DELETE(req, venueParams('v1'));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('後端回錯誤 → 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => '場地有關聯演唱會',
    }));

    const req = makeRequest('DELETE', null, 'Bearer jwt-abc');
    const res = await DELETE(req, venueParams('v1'));

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});

const fullVenueBody = {
  venueName: '台北小巨蛋',
  venueAddress: '台北市松山區南京東路四段2號',
  venueDescription: '多功能室內體育館',
  venueCapacity: 15000,
  venueImageUrl: 'https://example.com/arena.jpg',
  googleMapUrl: 'https://maps.google.com/?q=taipei+arena',
  isAccessible: true,
  hasParking: true,
  hasTransit: true,
};

describe('POST /dashboard/venues/create', () => {
  it('無 Authorization header → 401', async () => {
    const req = makeRequest('POST', fullVenueBody);
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('缺少必填欄位（venueDescription 空）→ 400', async () => {
    const req = makeRequest('POST', { ...fullVenueBody, venueDescription: '' }, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('缺少必填欄位（venueCapacity 空）→ 400', async () => {
    const { venueCapacity: _, ...noCapacity } = fullVenueBody;
    const req = makeRequest('POST', noCapacity, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('後端成功 → 200 { success: true, data }', async () => {
    const mockVenue = { venueId: 'new-id', ...fullVenueBody };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockVenue,
    }));

    const req = makeRequest('POST', fullVenueBody, 'Bearer jwt-abc');
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockVenue);
  });
});
