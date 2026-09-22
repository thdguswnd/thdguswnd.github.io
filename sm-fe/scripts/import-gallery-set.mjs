// 갤러리 이미지 일괄 변환 스크립트.
//
// 워크스페이스 최상위의 A01~A10 / B01~B10 / C01~C08 (+ start, end) 원본 JPEG 를
// WebP 로 변환해 프로젝트 자산으로 넣는다.
//
//  - 갤러리 원본  : src/assets/gallery/<이름>.webp        폭 1080, q80, 메타데이터 제거
//  - 갤러리 썸네일: src/assets/gallery-thumb/<이름>.webp  480x600(4:5) 센터 크롭, q78
//  - start / end  : src/assets/<이름>.webp                폭 1600, q80
//
// 썸네일을 4:5 세로로 고정 크롭하는 이유:
//   그리드는 aspect-ratio 4/5 + object-fit cover 로 표시한다. 가로 사진 썸네일을
//   가로 비율로 저장하면 브라우저가 세로 칸에 맞추느라 확대해서 흐려진다.
//   파일 자체를 4:5 로 잘라두면 확대 없이 선명하게 표시된다.
//   (라이트박스는 gallery/ 원본을 쓰므로 가로 사진 전체가 그대로 보인다)
//
// 사용법: node scripts/import-gallery-set.mjs gallery [시작index] [개수]
//         node scripts/import-gallery-set.mjs hero
//         node scripts/import-gallery-set.mjs clean     (기존 숫자 파일 삭제)
import sharp from 'sharp';
import { readdirSync, existsSync, mkdirSync, statSync, unlinkSync } from 'fs';
import { join, basename, extname } from 'path';

const SRC = 'C:/AIDLC_WS_GREEN';
const GALLERY = 'src/assets/gallery';
const THUMB = 'src/assets/gallery-thumb';
const ASSETS = 'src/assets';

const GALLERY_WIDTH = 1080;
const THUMB_W = 480;
const THUMB_H = 600; // 4:5 — 그리드의 aspect-ratio 와 일치
const HERO_WIDTH = 1600;

const isGallery = (f) => /^[ABC]\d{2}\.jpe?g$/i.test(f);
const isHero = (f) => /^(start|end)\.jpe?g$/i.test(f);

const kb = (p) => Math.round(statSync(p).size / 1024);

async function convertGallery(file) {
  const name = basename(file, extname(file));
  const src = join(SRC, file);

  // 원본(라이트박스용): 비율 유지 + 폭 제한
  const outFull = join(GALLERY, `${name}.webp`);
  const full = await sharp(src)
    .rotate() // EXIF 회전 반영 후 메타데이터는 버림
    .resize({ width: GALLERY_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outFull);

  // 썸네일(그리드용): 4:5 센터 크롭
  const outThumb = join(THUMB, `${name}.webp`);
  const thumb = await sharp(src)
    .rotate()
    .resize(THUMB_W, THUMB_H, { fit: 'cover', position: 'centre' })
    .webp({ quality: 78 })
    .toFile(outThumb);

  console.log(
    `${name}  원본 ${String(full.width).padStart(4)}x${String(full.height).padEnd(4)} ${String(kb(outFull)).padStart(3)}KB` +
      `  |  썸네일 ${thumb.width}x${thumb.height} ${String(kb(outThumb)).padStart(2)}KB`,
  );
}

async function convertHero(file) {
  const name = basename(file, extname(file)).toLowerCase();
  const out = join(ASSETS, `${name}.webp`);
  const info = await sharp(join(SRC, file))
    .rotate()
    .resize({ width: HERO_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out);
  console.log(`${name}.webp  ${info.width}x${info.height}  ${kb(out)}KB  <-  ${file}`);
}

const mode = process.argv[2] ?? 'gallery';

if (mode === 'clean') {
  // 기존 숫자 이름(01.webp ~) 파일만 제거. 새로 넣은 A/B/C 파일은 건드리지 않는다.
  for (const dir of [GALLERY, THUMB]) {
    if (!existsSync(dir)) continue;
    const old = readdirSync(dir).filter((f) => /^\d+\.webp$/i.test(f));
    for (const f of old) unlinkSync(join(dir, f));
    console.log(`${dir}: 기존 ${old.length}개 삭제`);
  }
} else if (mode === 'hero') {
  const files = readdirSync(SRC).filter(isHero).sort();
  console.log(`hero 대상 ${files.length}개`);
  for (const f of files) await convertHero(f); // eslint-disable-line no-await-in-loop
} else {
  mkdirSync(GALLERY, { recursive: true });
  mkdirSync(THUMB, { recursive: true });
  const files = readdirSync(SRC).filter(isGallery).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const from = parseInt(process.argv[3] ?? '0', 10);
  const count = parseInt(process.argv[4] ?? String(files.length), 10);
  const batch = files.slice(from, from + count);
  console.log(`갤러리 전체 ${files.length}장 / 이번 배치 ${batch.length}장 [${from}..${from + batch.length - 1}]`);
  for (const f of batch) await convertGallery(f); // eslint-disable-line no-await-in-loop
}
console.log('done.');
