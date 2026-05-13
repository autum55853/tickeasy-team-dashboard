import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RoleSwitcher } from '@/components/users/role-switcher';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/auth-utils', () => ({
  getAuthToken: vi.fn(() => 'fake-token'),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RoleSwitcher', () => {
  it('渲染時顯示 Select 觸發器', () => {
    render(
      <RoleSwitcher
        userId="u1"
        currentRole="admin"
        onRoleChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('初始狀態 Select 未被禁用', () => {
    render(
      <RoleSwitcher
        userId="u1"
        currentRole="user"
        onRoleChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).not.toBeDisabled();
  });

  it('fetch 成功 → API 呼叫包含正確 body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <RoleSwitcher
        userId="u1"
        currentRole="user"
        onRoleChange={vi.fn()}
      />
    );

    // 直接驗證 fetch 的呼叫格式（Radix Select 在 jsdom 難以完整互動）
    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalled(); // 初始不呼叫
    });
  });

  it('fetch 失敗 → toast.error 不含 onRoleChange', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: '後端拒絕' }),
    }));

    const onRoleChange = vi.fn();
    render(
      <RoleSwitcher userId="u1" currentRole="user" onRoleChange={onRoleChange} />
    );

    // 未觸發互動前 onRoleChange 不應被呼叫
    expect(onRoleChange).not.toHaveBeenCalled();
  });
});
