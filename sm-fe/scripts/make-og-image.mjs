// 카카오톡/SNS 링크 공유 미리보기용 OG 이미지 생성.
//
// 원본 JIN01598.jpg → public/thumbnail.webp (+ thumbnail.jpg 폴백)
// OG 권장 비율 1.91:1 (1200x630). 인물이 위쪽에 오도록 상단 기준으로 크롭한다.
//
// 사용법: node scripts/make-og-image.mjs [원본경로]
import sharp from 'sharp';
import { existsSync, statSync, mkdirSync } from 'fs';

const SRC = process.argv[2] ?? 'C:/AIDLC_WS_GREEN/JIN01598.jpg';
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

// 세로 사진에서 1.91:1 배너를 뽑을 때 위쪽 기준으로 자르면 하늘만 잡힌다.
// 폭 1200 으로 줄인 뒤(1200x1800) 인물 얼굴이 들어오는 구간을 직접 잘라낸다.
const CROP_TOP = 620; // 1200x1800 기준. 얼굴이 세로 48~60% 지점에 위치
const resized = await sharp(SRC).rotate().resize({ width: W }).toBuffer();
const rMeta = await sharp(resized).metadata();
const top = Math.max(0, Math.min(CROP_TOP, rMeta.height - H));

for (const [file, format, quality] of [
  ['thumbnail.webp', 'webp', 82],
  ['thumbnail.jpg', 'jpeg', 82],
]) {
  const out = `${OUT_DIR}/${file}`;
  const pipeline = sharp(resized).extract({ left: 0, top, width: W, height: H });
  if (format === 'webp') await pipeline.webp({ quality }).toFile(out);
  else await pipeline.jpeg({ quality, mozjpeg: true }).toFile(out);
  console.log(`${file.padEnd(16)} ${W}x${H}  ${Math.round(statSync(out).size / 1024)}KB`);
}
console.log('done.');
