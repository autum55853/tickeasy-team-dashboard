import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';

const mocks = vi.hoisted(() => {
  const mockClearAuthData = vi.fn();
  const mockGetCurrentUser = vi.fn();
  const mockEnsureLogoutChannel = vi.fn();
  return { mockClearAuthData, mockGetCurrentUser, mockEnsureLogoutChannel };
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
  ensureLogoutChannel: mocks.mockEnsureLogoutChannel,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe('DashboardLayout - Realtime 登出訂閱', () => {
  it('user 有 email 時呼叫 ensureLogoutChannel', () => {
    mocks.mockGetCurrentUser.mockReturnValue({ email: 'admin@test.com', id: 'user-1' });

    render(<DashboardLayout>content</DashboardLayout>);

    expect(mocks.mockEnsureLogoutChannel).toHaveBeenCalledWith(
      'admin@test.com',
      mocks.mockClearAuthData
    );
  });

  it('getCurrentUser() 回傳 null 時不呼叫 ensureLogoutChannel', () => {
    mocks.mockGetCurrentUser.mockReturnValue(null);

    render(<DashboardLayout>content</DashboardLayout>);

    expect(mocks.mockEnsureLogoutChannel).not.toHaveBeenCalled();
  });

  it('getCurrentUser() 回傳無 email 時不呼叫 ensureLogoutChannel', () => {
    mocks.mockGetCurrentUser.mockReturnValue({ id: 'user-1' });

    render(<DashboardLayout>content</DashboardLayout>);

    expect(mocks.mockEnsureLogoutChannel).not.toHaveBeenCalled();
  });
});
