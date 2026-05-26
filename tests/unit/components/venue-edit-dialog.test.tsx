import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VenueFormDialog } from '@/components/venues/venue-form-dialog';
import type { Venue } from '@/lib/types/concert';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/auth-utils', () => ({
  getAuthToken: vi.fn(() => 'fake-token'),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'submit' | 'button' | 'reset';
  }) => (
    <button onClick={onClick} disabled={disabled} type={type ?? 'button'}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ id, checked, onCheckedChange }: {
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

const makeVenue = (overrides: Partial<Venue> = {}): Venue => ({
  venueId: 'v1',
  venueName: '台北小巨蛋',
  venueAddress: '台北市松山區南京東路四段一號',
  venueDescription: '多功能室內體育館',
  venueCapacity: 15000,
  venueImageUrl: 'https://example.com/arena.jpg',
  googleMapUrl: 'https://maps.google.com/?q=taipei+arena',
  isAccessible: false,
  hasParking: false,
  hasTransit: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VenueFormDialog（edit mode）', () => {
  it('open=false → 不渲染內容', () => {
    render(
      <VenueFormDialog venue={makeVenue()} open={false} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('open=true → 渲染表單並預填場地資料', () => {
    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByDisplayValue('台北小巨蛋')).toBeInTheDocument();
    expect(screen.getByDisplayValue('台北市松山區南京東路四段一號')).toBeInTheDocument();
  });

  it('所有欄位有值 → 儲存按鈕啟用', () => {
    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: '儲存' })).not.toBeDisabled();
  });

  it('清空 venueName → 儲存按鈕 disabled', () => {
    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    fireEvent.change(screen.getByDisplayValue('台北小巨蛋'), { target: { value: '' } });
    expect(screen.getByRole('button', { name: '儲存' })).toBeDisabled();
  });

  it('清空 venueDescription → 儲存按鈕 disabled', () => {
    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    fireEvent.change(screen.getByDisplayValue('多功能室內體育館'), { target: { value: '' } });
    expect(screen.getByRole('button', { name: '儲存' })).toBeDisabled();
  });

  it('送出表單 → fetch 帶正確 URL（PATCH /dashboard/venues/v1）和 Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={vi.fn()} onSave={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: '儲存' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/dashboard/venues/v1',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token',
          }),
        })
      );
    });

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(callBody.venueName).toBe('台北小巨蛋');
    expect(callBody).not.toHaveProperty('venueId');
  });

  it('API 成功 → toast.success + onSave + onClose 被呼叫', async () => {
    const { toast } = await import('sonner');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }));

    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={onClose} onSave={onSave} />
    );

    fireEvent.click(screen.getByRole('button', { name: '儲存' }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('場地更新成功');
    });
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ venueId: 'v1' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('API 回 { success: false } → toast.error，onSave 不被呼叫', async () => {
    const { toast } = await import('sonner');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: '更新失敗' }),
    }));

    const onSave = vi.fn();
    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={vi.fn()} onSave={onSave} />
    );

    fireEvent.click(screen.getByRole('button', { name: '儲存' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('更新失敗');
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('網路錯誤 → toast.error「網路錯誤，請稍後再試」', async () => {
    const { toast } = await import('sonner');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={vi.fn()} onSave={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: '儲存' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('網路錯誤，請稍後再試');
    });
  });

  it('取消按鈕 → onClose 被呼叫', () => {
    const onClose = vi.fn();
    render(
      <VenueFormDialog venue={makeVenue()} open={true} onClose={onClose} onSave={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('isAccessible checkbox 可切換狀態', () => {
    render(
      <VenueFormDialog
        venue={makeVenue({ isAccessible: false })}
        open={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /無障礙/ });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
