import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConcertReviewActions from '@/components/concerts/concert-review-actions';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/auth-utils', () => ({
  getAuthToken: vi.fn(() => 'fake-token'),
}));

// mock shadcn/ui Dialog — 直接渲染 children 避免 Radix portal 問題
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConcertReviewActions', () => {
  it('點擊「通過」→ 開啟確認 Dialog', async () => {
    render(<ConcertReviewActions concertId="c1" onReviewComplete={vi.fn()} />);

    fireEvent.click(screen.getByText('通過'));
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText(/確定要『通過』/)).toBeInTheDocument();
  });

  it('點擊「拒絕」→ 開啟確認 Dialog 並顯示拒絕文字', async () => {
    render(<ConcertReviewActions concertId="c1" onReviewComplete={vi.fn()} />);

    fireEvent.click(screen.getByText('拒絕'));
    await waitFor(() => {
      expect(screen.getByText(/確定要『拒絕』/)).toBeInTheDocument();
    });
  });

  it('備註為空，點擊確認 → toast.error，不送出 fetch', async () => {
    const { toast } = await import('sonner');
    vi.stubGlobal('fetch', vi.fn());

    render(<ConcertReviewActions concertId="c1" onReviewComplete={vi.fn()} />);

    fireEvent.click(screen.getByText('通過'));
    await waitFor(() => expect(screen.getByTestId('dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByText('確認'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('請輸入審核意見');
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('備註有值 + API 成功 → onReviewComplete 被呼叫', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }));

    const onReviewComplete = vi.fn();
    render(<ConcertReviewActions concertId="c1" onReviewComplete={onReviewComplete} />);

    const textarea = screen.getByPlaceholderText('請輸入審核備註（選填）');
    fireEvent.change(textarea, { target: { value: '內容良好，審核通過' } });

    fireEvent.click(screen.getByText('通過'));
    await waitFor(() => expect(screen.getByTestId('dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByText('確認'));
    await waitFor(() => {
      expect(onReviewComplete).toHaveBeenCalledWith('approved');
    });
  });

  it('API 失敗 → toast.error，onReviewComplete 不被呼叫', async () => {
    const { toast } = await import('sonner');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: '審核失敗原因' }),
    }));

    const onReviewComplete = vi.fn();
    render(<ConcertReviewActions concertId="c1" onReviewComplete={onReviewComplete} />);

    const textarea = screen.getByPlaceholderText('請輸入審核備註（選填）');
    fireEvent.change(textarea, { target: { value: '某些備註' } });

    fireEvent.click(screen.getByText('拒絕'));
    await waitFor(() => expect(screen.getByTestId('dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByText('確認'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('審核失敗原因');
    });
    expect(onReviewComplete).not.toHaveBeenCalled();
  });
});
