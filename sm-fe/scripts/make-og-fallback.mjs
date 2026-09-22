// 링크 미리보기(OG) 폴백 이미지 생성.
//
// 카카오톡 등 일부 크롤러/구형 웹뷰는 webp 를 미리보기로 렌더하지 못한다.
// 그래서 og:image 의 기본값은 JPEG 로 두고, webp 는 보조로만 노출한다.
//
//  입력: src/assets/start.webp (1600x2400 세로)
//  출력: public/thumbnail.jpg  (1200x630, 아래쪽 기준 크롭)
//
// 크기 1200x630(1.91:1) 근거: 카카오톡은 URL 을 붙여넣으면 자체 가로형 배너로
// 미리보기를 그린다. 세로 이미지를 주면 작은 썸네일로 축소될 수 있다.
// 크롭을 position 'bottom' 으로 두는 이유: 원본 위쪽은 하늘이라 인물이 잘린다.
//
// 사용법: node scripts/make-og-fallback.mjs
import sharp from 'sharp';
import { statSync } from 'fs';

const SRC = 'src/assets/start.webp';
const OUT = 'public/thumbnail.jpg';
const W = 1200;
const H = 630;

const info = await sharp(SRC)
  .rotate()
  .resize(W, H, { fit: 'cover', position: 'bottom' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT);

console.log(`${OUT}  ${info.width}x${info.height}  ${Math.round(statSync(OUT).size / 1024)}KB  <-  ${SRC}`);
