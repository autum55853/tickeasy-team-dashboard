import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';

// vi.hoisted 確保 mock 變數在 vi.mock 工廠執行前已初始化
const mocks = vi.hoisted(() => {
  const mockClearAuthData = vi.fn();
  const mockGetCurrentUser = vi.fn();
  const mockChannel = {
    on: vi.fn(),
    subscribe: vi.fn(),
  };
  mockChannel.on.mockReturnValue(mockChannel);
  mockChannel.subscribe.mockReturnValue(mockChannel);
  const mockRemoveChannel = vi.fn();
  const mockCreateClient = vi.fn(() => ({
    channel: vi.fn(() => mockChannel),
    removeChannel: mockRemoveChannel,
  }));
  return { mockClearAuthData, mockGetCurrentUser, mockChannel, mockRemoveChannel, mockCreateClient };
});

vi.mock('@/lib/auth-utils', () => ({
  handleCrossDomainAuth: vi.fn(() => false),
  hasValidToken: vi.fn(() => true),
  clearAuthData: mocks.mockClearAuthData,
  getCurrentUser: mocks.mockGetCurrentUser,
}));

vi.mock('@/components/dashboard/navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: mocks.mockCreateClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.mockChannel.on.mockReturnValue(mocks.mockChannel);
  mocks.mockChannel.subscribe.mockReturnValue(mocks.mockChannel);
});

afterEach(() => {
  localStorage.clear();
});

describe('DashboardLayout - Realtime 登出訂閱', () => {
  it('user 有 email 時訂閱 tickeasy-session-{email} channel', () => {
    mocks.mockGetCurrentUser.mockReturnValue({ email: 'admin@test.com', id: 'user-1' });

    render(<DashboardLayout>content</DashboardLayout>);

    const supabase = mocks.mockCreateClient.mock.results[0].value;
    expect(supabase.channel).toHaveBeenCalledWith('tickeasy-session-admin@test.com');
    expect(mocks.mockChannel.on).toHaveBeenCalledWith(
      'presence',
      { event: 'join' },
      expect.any(Function)
    );
    expect(mocks.mockChannel.subscribe).toHaveBeenCalled();
  });

  it('收到 presence join 且 event=LOGOUT 時呼叫 clearAuthData()', () => {
    mocks.mockGetCurrentUser.mockReturnValue({ email: 'admin@test.com', id: 'user-1' });

    render(<DashboardLayout>content</DashboardLayout>);

    const handler = mocks.mockChannel.on.mock.calls[0][2] as (msg: { newPresences: Array<Record<string, unknown>> }) => void;
    handler({ newPresences: [{ event: 'LOGOUT', timestamp: Date.now() }] });

    expect(mocks.mockClearAuthData).toHaveBeenCalledOnce();
  });

  it('收到 presence join 但 event 非 LOGOUT 時不呼叫 clearAuthData()', () => {
    mocks.mockGetCurrentUser.mockReturnValue({ email: 'admin@test.com', id: 'user-1' });

    render(<DashboardLayout>content</DashboardLayout>);

    const handler = mocks.mockChannel.on.mock.calls[0][2] as (msg: { newPresences: Array<Record<string, unknown>> }) => void;
    handler({ newPresences: [{ event: 'OTHER', timestamp: Date.now() }] });

    expect(mocks.mockClearAuthData).not.toHaveBeenCalled();
  });

  it('收到 presence join 但 newPresences 為空時不呼叫 clearAuthData()', () => {
    mocks.mockGetCurrentUser.mockReturnValue({ email: 'admin@test.com', id: 'user-1' });

    render(<DashboardLayout>content</DashboardLayout>);

    const handler = mocks.mockChannel.on.mock.calls[0][2] as (msg: { newPresences: Array<Record<string, unknown>> }) => void;
    handler({ newPresences: [] });

    expect(mocks.mockClearAuthData).not.toHaveBeenCalled();
  });

  it('unmount 時呼叫 removeChannel（cleanup）', () => {
    mocks.mockGetCurrentUser.mockReturnValue({ email: 'admin@test.com', id: 'user-1' });

    const { unmount } = render(<DashboardLayout>content</DashboardLayout>);
    const supabase = mocks.mockCreateClient.mock.results[0].value;
    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mocks.mockChannel);
  });

  it('getCurrentUser() 回傳 null 時不訂閱', () => {
    mocks.mockGetCurrentUser.mockReturnValue(null);

    render(<DashboardLayout>content</DashboardLayout>);

    const calls = mocks.mockCreateClient.mock.results;
    const anyChannelCalled = calls.some(
      (r: { value: { channel: { mock: { calls: unknown[] } } } }) =>
        r.value.channel.mock?.calls?.length > 0
    );
    expect(anyChannelCalled).toBe(false);
  });

  it('getCurrentUser() 回傳無 email 時不訂閱', () => {
    mocks.mockGetCurrentUser.mockReturnValue({ id: 'user-1' });

    render(<DashboardLayout>content</DashboardLayout>);

    const calls = mocks.mockCreateClient.mock.results;
    const anyChannelCalled = calls.some(
      (r: { value: { channel: { mock: { calls: unknown[] } } } }) =>
        r.value.channel.mock?.calls?.length > 0
    );
    expect(anyChannelCalled).toBe(false);
  });
});
