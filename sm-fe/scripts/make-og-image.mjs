// 카카오톡/SNS 링크 공유 미리보기용 OG 이미지 생성.
//
// 원본 start.jpg → public/thumbnail.webp (+ thumbnail.jpg 폴백)
//
// 크기: 1200x630 (1.91:1)
//   카카오톡은 URL 을 붙여넣으면 자체 가로형 레이아웃으로 미리보기를 그린다.
//   1.91:1 이 가장 확실하게 '큰 배너' 형태로 노출되는 비율이다.
//   (정사각/세로 이미지를 주면 작은 썸네일 레이아웃으로 바뀌어 오히려 작아질 수 있다)
//
// 크롭: position 'bottom'
//   원본이 세로로 길어 위아래를 다 담을 수 없다. 위쪽 하늘을 버리고
//   아래쪽(인물)을 살린다.
//
// 사용법: node scripts/make-og-image.mjs [원본경로]
import sharp from 'sharp';
import { existsSync, statSync, mkdirSync } from 'fs';

const SRC = process.argv[2] ?? 'C:/AIDLC_WS_GREEN/start.jpg';
const OUT_DIR = 'public';
const W = 1200;
const H = 630;

if (!existsSync(SRC)) {
  console.error(`원본을 찾을 수 없습니다: ${SRC}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const meta = await sharp(SRC).metadata();
console.log(`원본: ${meta.width}x${meta.height}, ${(statSync(SRC).size / 1024 / 1024).toFixed(2)}MB`);

for (const [file, format, quality] of [
  ['thumbnail.webp', 'webp', 82],
  ['thumbnail.jpg', 'jpeg', 82],
]) {
  const out = `${OUT_DIR}/${file}`;
  // fit: cover + position: bottom → 위쪽을 잘라내고 아래쪽을 남긴다
  const pipeline = sharp(SRC).rotate().resize(W, H, { fit: 'cover', position: 'bottom' });
  if (format === 'webp') await pipeline.webp({ quality }).toFile(out);
  else await pipeline.jpeg({ quality, mozjpeg: true }).toFile(out);
  console.log(`${file.padEnd(16)} ${W}x${H}  ${Math.round(statSync(out).size / 1024)}KB`);
}
console.log('done.');
