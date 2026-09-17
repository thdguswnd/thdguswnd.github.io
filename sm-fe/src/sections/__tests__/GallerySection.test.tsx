import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GallerySection } from '../GallerySection';
import { galleryImages } from '../../lib/imageSets';

const total = galleryImages.length;

/** 썸네일을 눌러 확대 보기를 열고, 현재 위치 표시 문자열을 반환. */
async function openLightbox(nth = 0) {
  const user = userEvent.setup();
  render(<GallerySection />);
  const thumbs = screen.getAllByTestId('gallery-thumb');
  await user.click(thumbs[nth]);
  return user;
}

it('갤러리에 사진이 있고 썸네일이 렌더된다', () => {
  render(<GallerySection />);
  expect(total).toBeGreaterThan(0);
  expect(screen.getAllByTestId('gallery-thumb').length).toBeGreaterThan(0);
});

it('썸네일을 터치하면 확대 보기가 열린다', async () => {
  await openLightbox(0);
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();
  expect(screen.getByText(`1 / ${total}`)).toBeInTheDocument();
});

it('첫 사진에서 이전을 누르면 마지막 사진으로 순환한다', async () => {
  const user = await openLightbox(0);
  await user.click(screen.getByTestId('lightbox-prev'));
  expect(screen.getByText(`${total} / ${total}`)).toBeInTheDocument();
});

it('마지막 사진에서 다음을 누르면 첫 사진으로 순환한다', async () => {
  const user = await openLightbox(0);
  await user.click(screen.getByTestId('lightbox-prev')); // → 마지막
  await user.click(screen.getByTestId('lightbox-next')); // → 첫 장
  expect(screen.getByText(`1 / ${total}`)).toBeInTheDocument();
});

it('다음을 누르면 두 번째 사진으로 이동한다', async () => {
  const user = await openLightbox(0);
  await user.click(screen.getByTestId('lightbox-next'));
  expect(screen.getByText(`2 / ${total}`)).toBeInTheDocument();
});

it('X 를 누르면 확대 보기가 닫힌다', async () => {
  const user = await openLightbox(0);
  await user.click(screen.getByTestId('lightbox-close'));
  expect(screen.queryByTestId('lightbox-image')).not.toBeInTheDocument();
});

it('사진 바깥(배경)을 누르면 확대 보기가 닫힌다', async () => {
  const user = await openLightbox(0);
  await user.click(screen.getByTestId('lightbox-backdrop'));
  expect(screen.queryByTestId('lightbox-image')).not.toBeInTheDocument();
});

it('사진 자체를 누르면 닫히지 않는다', async () => {
  const user = await openLightbox(0);
  await user.click(screen.getByTestId('lightbox-image'));
  expect(screen.getByTestId('lightbox-image')).toBeInTheDocument();
});
