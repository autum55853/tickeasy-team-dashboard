import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConcertReviewPanel from '@/components/concerts/concert-review-panel';

// mock 子元件避免複雜外部依賴（fetch、token）
vi.mock('@/components/concerts/concert-review-history', () => ({
  default: ({ concertId }: { concertId: string }) => (
    <div data-testid="review-history">history-{concertId}</div>
  ),
}));

vi.mock('@/components/concerts/concert-review-actions', () => ({
  default: ({ concertId }: { concertId: string; onReviewComplete: () => void }) => (
    <div data-testid="review-actions">actions-{concertId}</div>
  ),
}));

describe('ConcertReviewPanel', () => {
  it('reviewStatus=pending → 顯示 ConcertReviewActions', () => {
    render(<ConcertReviewPanel concertId="c1" reviewStatus="pending" />);

    expect(screen.getByTestId('review-history')).toBeInTheDocument();
    expect(screen.getByTestId('review-actions')).toBeInTheDocument();
  });

  it('reviewStatus=approved → 不顯示 ConcertReviewActions', () => {
    render(<ConcertReviewPanel concertId="c1" reviewStatus="approved" />);

    expect(screen.getByTestId('review-history')).toBeInTheDocument();
    expect(screen.queryByTestId('review-actions')).toBeNull();
  });

  it('reviewStatus=rejected → 不顯示 ConcertReviewActions', () => {
    render(<ConcertReviewPanel concertId="c1" reviewStatus="rejected" />);

    expect(screen.queryByTestId('review-actions')).toBeNull();
  });

  it('reviewStatus 未傳 → 不顯示 ConcertReviewActions', () => {
    render(<ConcertReviewPanel concertId="c1" />);

    expect(screen.queryByTestId('review-actions')).toBeNull();
  });
});
