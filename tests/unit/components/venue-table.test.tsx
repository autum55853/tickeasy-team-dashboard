import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VenueTable } from '@/components/venues/venue-table';
import type { Venue } from '@/lib/types/concert';

vi.mock('@/components/venues/venue-form-dialog', () => ({
  VenueFormDialog: ({ venue, open, onClose, onSave }: {
    venue?: Venue;
    open: boolean;
    onClose: () => void;
    onSave?: (v: Venue) => void;
    onCreated?: (v: Venue) => void;
  }) => {
    if (!open) return null;
    if (venue) {
      return (
        <div data-testid="edit-dialog">
          <span data-testid="editing-venue">{venue.venueName}</span>
          <button onClick={onClose} data-testid="dialog-close">關閉</button>
          <button
            onClick={() => onSave?.({ ...venue, venueName: '已更新場地' })}
            data-testid="dialog-save"
          >
            儲存
          </button>
        </div>
      );
    }
    return <div data-testid="create-dialog" />;
  },
}));

const makeVenue = (overrides: Partial<Venue> = {}): Venue => ({
  venueId: 'v1',
  venueName: '台北小巨蛋',
  venueAddress: '台北市松山區南京東路四段一號',
  isAccessible: true,
  hasParking: false,
  hasTransit: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VenueTable', () => {
  it('空陣列 → 顯示「尚無場地資料」', () => {
    render(<VenueTable venues={[]} />);
    expect(screen.getByText('尚無場地資料')).toBeInTheDocument();
  });

  it('顯示場地名稱和地址', () => {
    render(<VenueTable venues={[makeVenue()]} />);
    expect(screen.getByText('台北小巨蛋')).toBeInTheDocument();
    expect(screen.getByText('台北市松山區南京東路四段一號')).toBeInTheDocument();
  });

  it('venueCapacity 有值 → 顯示格式化數字', () => {
    render(<VenueTable venues={[makeVenue({ venueCapacity: 15000 })]} />);
    expect(screen.getByText('15,000')).toBeInTheDocument();
  });

  it('venueCapacity 無值 → 顯示「-」', () => {
    render(<VenueTable venues={[makeVenue({ venueCapacity: undefined })]} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('isAccessible=true → 無障礙欄顯示「是」', () => {
    render(<VenueTable venues={[makeVenue({ isAccessible: true, hasParking: false, hasTransit: false })]} />);
    const badges = screen.getAllByText('是');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('hasParking=false → 顯示「否」badge', () => {
    render(<VenueTable venues={[makeVenue({ isAccessible: false, hasParking: false, hasTransit: false })]} />);
    const noBadges = screen.getAllByText('否');
    expect(noBadges.length).toBe(3);
  });

  it('依場地名稱搜尋 → 篩選', () => {
    const venues = [
      makeVenue({ venueId: 'v1', venueName: '台北小巨蛋', venueAddress: '台北市松山區' }),
      makeVenue({ venueId: 'v2', venueName: '高雄巨蛋', venueAddress: '高雄市左營區' }),
    ];
    render(<VenueTable venues={venues} />);

    fireEvent.change(screen.getByPlaceholderText('搜尋場地名稱或地址...'), {
      target: { value: '高雄' },
    });

    expect(screen.queryByText('台北小巨蛋')).not.toBeInTheDocument();
    expect(screen.getByText('高雄巨蛋')).toBeInTheDocument();
  });

  it('依地址搜尋 → 篩選', () => {
    const venues = [
      makeVenue({ venueId: 'v1', venueName: '台北小巨蛋', venueAddress: '台北市松山區' }),
      makeVenue({ venueId: 'v2', venueName: '高雄巨蛋', venueAddress: '高雄市左營區' }),
    ];
    render(<VenueTable venues={venues} />);

    fireEvent.change(screen.getByPlaceholderText('搜尋場地名稱或地址...'), {
      target: { value: '松山' },
    });

    expect(screen.getByText('台北小巨蛋')).toBeInTheDocument();
    expect(screen.queryByText('高雄巨蛋')).not.toBeInTheDocument();
  });

  it('搜尋無結果 → 顯示「找不到符合的場地」', () => {
    render(<VenueTable venues={[makeVenue()]} />);

    fireEvent.change(screen.getByPlaceholderText('搜尋場地名稱或地址...'), {
      target: { value: 'xxxxxx' },
    });

    expect(screen.getByText('找不到符合的場地')).toBeInTheDocument();
  });

  it('點擊編輯按鈕 → 開啟 Dialog 並顯示對應場地', () => {
    render(<VenueTable venues={[makeVenue()]} />);

    const editButtons = screen.getAllByRole('button').filter(
      (btn) => btn.querySelector('svg') !== null
    );
    fireEvent.click(editButtons[1]);

    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('editing-venue')).toHaveTextContent('台北小巨蛋');
  });

  it('Dialog 儲存後 → 表格更新場地名稱', () => {
    render(<VenueTable venues={[makeVenue()]} />);

    const editButtons = screen.getAllByRole('button').filter(
      (btn) => btn.querySelector('svg') !== null
    );
    fireEvent.click(editButtons[1]);
    fireEvent.click(screen.getByTestId('dialog-save'));

    expect(screen.getByText('已更新場地')).toBeInTheDocument();
  });

  it('Dialog 關閉後 → Dialog 不再顯示', () => {
    render(<VenueTable venues={[makeVenue()]} />);

    const editButtons = screen.getAllByRole('button').filter(
      (btn) => btn.querySelector('svg') !== null
    );
    fireEvent.click(editButtons[1]);
    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-close'));
    expect(screen.queryByTestId('edit-dialog')).not.toBeInTheDocument();
  });
});
