// 로컬 이미지 최적화 스크립트 (sharp).
// src/assets/sets/default/{main,gallery,timeline} 의 jpg/jpeg/png 를
// 리사이즈 + webp 로 변환하고 원본(대용량)은 제거한다.
// 사진을 새로 넣은 뒤 `yarn optimize:images` 로 실행하면 배포용 경량 webp 가 만들어진다.
import sharp from 'sharp';
import { readdirSync, unlinkSync } from 'fs';
import { join, extname, basename } from 'path';

// 단일 세트(default) 기준. 값은 리사이즈 기준 폭(px).
const setRoot = 'src/assets/sets/default';
const targets = [
  { dir: join(setRoot, 'main'), width: 1600 },
  { dir: join(setRoot, 'gallery'), width: 1200 },
  { dir: join(setRoot, 'timeline'), width: 1200 },
];

for (const { dir, width } of targets) {
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    continue;
  }
  for (const f of files) {
    const ext = extname(f).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    const src = join(dir, f);
    const out = join(dir, basename(f, extname(f)) + '.webp');
    // eslint-disable-next-line no-await-in-loop
    await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    unlinkSync(src);
    console.log(`optimized: ${src} -> ${out}`);
  }
}
console.log('done.');
