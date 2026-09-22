import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GallerySection } from '../GallerySection';
import { GALLERY_ROW_KEYS, galleryRows } from '../../lib/images';

/** 각 행의 가운데 카드를 눌러 확대 보기를 연다. */
async function openRow(rowKey: string) {
  const user = userEvent.setup();
  render(<GallerySection />);
  const row = screen.getByTestId(`gallery-row-${rowKey}`);
  const cards = row.querySelectorAll('[data-testid="gallery-card"]');
  await user.click(cards[0]); // startIndex 0 = 가운데 카드
  return user;
}

it('A/B/C 3개 행이 각각 렌더된다', () => {
  render(<GallerySection />);
  for (const key of GALLERY_ROW_KEYS) {
    expect(screen.getByTestId(`gallery-row-${key}`)).toBeInTheDocument();
    expect(galleryRows[key].length).toBeGreaterThan(0);
  }
});

it('행마다 카드 수가 해당 행 이미지 수와 같다', () => {
  render(<GallerySection />);
  for (const key of GALLERY_ROW_KEYS) {
    const row = screen.getByTestId(`gallery-row-${key}`);
    expect(row.querySelectorAll('[data-testid="gallery-card"]').length).toBe(galleryRows[key].length);
  }
});

it('카드를 누르면 확대 보기가 열린다', async () => {
  await openRow('A');
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();
  expect(screen.getByTestId('lightbox-counter')).toHaveTextContent(`1 / ${galleryRows.A.length}`);
});

it('확대 보기는 해당 행의 장수만 순환한다 (다른 행으로 넘어가지 않음)', async () => {
  const user = await openRow('B');
  const total = galleryRows.B.length;
  expect(screen.getByTestId('lightbox-counter')).toHaveTextContent(`1 / ${total}`);
  // 첫 장에서 이전 → 그 행의 마지막 장
  await user.click(screen.getByTestId('lightbox-prev'));
  expect(screen.getByTestId('lightbox-counter')).toHaveTextContent(`${total} / ${total}`);
  // 마지막에서 다음 → 첫 장
  await user.click(screen.getByTestId('lightbox-next'));
  expect(screen.getByTestId('lightbox-counter')).toHaveTextContent(`1 / ${total}`);
});

it('다음을 누르면 두 번째 사진으로 이동한다', async () => {
  const user = await openRow('A');
  await user.click(screen.getByTestId('lightbox-next'));
  expect(screen.getByTestId('lightbox-counter')).toHaveTextContent(`2 / ${galleryRows.A.length}`);
});

it('빈 영역을 누르면 조작 UI 가 숨고, 다시 누르면 나타난다', async () => {
  const user = await openRow('A');
  const close = screen.getByTestId('lightbox-close');
  const counter = screen.getByTestId('lightbox-counter');
  expect(close).toHaveStyle({ opacity: '1' });

  await user.click(screen.getByTestId('lightbox-backdrop'));
  expect(close).toHaveStyle({ opacity: '0' });
  expect(counter).toHaveStyle({ opacity: '0' });
  // 숨은 상태에서도 팝업은 닫히지 않는다
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();

  await user.click(screen.getByTestId('lightbox-backdrop'));
  expect(close).toHaveStyle({ opacity: '1' });
});

it('X 를 누르면 확대 보기가 닫힌다', async () => {
  const user = await openRow('A');
  await user.click(screen.getByTestId('lightbox-close'));
  expect(screen.queryByTestId('lightbox-image')).not.toBeInTheDocument();
});

it('빈 영역을 눌러도 확대 보기가 닫히지 않는다', async () => {
  const user = await openRow('C');
  await user.click(screen.getByTestId('lightbox-backdrop'));
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();
});

// 회귀 방지: history 처리 effect 가 onClose 를 의존성으로 가지면
// 사진을 넘길 때마다 cleanup 이 돌며 history.back() -> popstate -> 팝업이 닫혔다.
it('< > 로 여러 번 넘겨도 팝업이 닫히지 않는다', async () => {
  const user = await openRow('A');
  const total = galleryRows.A.length;

  await user.click(screen.getByTestId('lightbox-next'));
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();
  await user.click(screen.getByTestId('lightbox-next'));
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();
  await user.click(screen.getByTestId('lightbox-prev'));
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();

  // 세 번 이동 후에도 열려 있고 위치도 맞다 (1 -> 2 -> 3 -> 2)
  expect(screen.getByTestId('lightbox-counter')).toHaveTextContent(`2 / ${total}`);
});

it('사진을 넘길 때 history 항목이 늘어나지 않는다', async () => {
  const before = window.history.length;
  const user = await openRow('B');
  await user.click(screen.getByTestId('lightbox-next'));
  await user.click(screen.getByTestId('lightbox-next'));
  // 팝업이 열려 있는 동안 push 는 최초 1회뿐이어야 한다
  expect(window.history.length).toBeLessThanOrEqual(before + 1);
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();
});
