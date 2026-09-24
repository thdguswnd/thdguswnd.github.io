// 워크스페이스 루트의 신규 갤러리 원본을 webp 로 변환해 자산에 넣는다.
//
//  - src/assets/gallery/<이름>.webp        폭 1080, q80, 메타데이터 제거 (라이트박스용)
//  - src/assets/gallery-thumb/<이름>.webp  480x600(4:5) 센터 크롭, q78 (그리드용)
//
// 썸네일을 4:5 로 고정 크롭하는 이유: 그리드가 aspect-ratio 4/5 + object-fit cover 라
// 가로 사진을 가로 비율로 저장하면 브라우저가 확대해 흐려진다.
//
// 사용법: node scripts/add-gallery-images.mjs A02 B02 C02 C07 C08
import sharp from 'sharp';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC_DIR = 'C:/AIDLC_WS_GREEN';
const GALLERY = 'src/assets/gallery';
const THUMB = 'src/assets/gallery-thumb';
const GALLERY_WIDTH = 1080;
const THUMB_W = 480;
const THUMB_H = 600;

const names = process.argv.slice(2);
if (!names.length) {
  console.error('대상 이름을 넘기세요. 예: node scripts/add-gallery-images.mjs A02 B02');
  process.exit(1);
}

/** 루트에서 확장자 무관하게 원본 파일을 찾는다. */
function findSource(name) {
  const hit = readdirSync(SRC_DIR).find(
    (f) => f.replace(/\.[^.]+$/, '').toUpperCase() === name.toUpperCase() && /\.(jpe?g|png|webp)$/i.test(f),
  );
  return hit ? join(SRC_DIR, hit) : null;
}

const kb = (p) => Math.round(statSync(p).size / 1024);

for (const name of names) {
  const src = findSource(name);
  if (!src) {
    console.log(`${name}: 원본을 찾을 수 없음 → 건너뜀`);
    continue;
  }

  const meta = await sharp(src).metadata();
  const outFull = join(GALLERY, `${name}.webp`);
  const outThumb = join(THUMB, `${name}.webp`);
  const replaced = existsSync(outFull);

  const full = await sharp(src)
    .rotate() // EXIF 회전 반영 후 메타데이터는 버림
    .resize({ width: GALLERY_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outFull);

  const thumb = await sharp(src)
    .rotate()
    .resize(THUMB_W, THUMB_H, { fit: 'cover', position: 'centre' })
    .webp({ quality: 78 })
    .toFile(outThumb);

  console.log(
    `${name}  원본 ${meta.width}x${meta.height} ${(statSync(src).size / 1048576).toFixed(1)}MB` +
      `  ->  gallery ${full.width}x${full.height} ${kb(outFull)}KB` +
      ` / thumb ${thumb.width}x${thumb.height} ${kb(outThumb)}KB` +
      (replaced ? '  (교체)' : '  (신규)'),
  );
}
console.log('done.');
