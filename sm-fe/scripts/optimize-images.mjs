// 로컬 이미지 최적화 스크립트 (sharp).
// src/assets/{main,gallery} 의 jpg/jpeg/png 를 리사이즈 + webp 로 변환하고 원본(대용량)은 제거한다.
// 사진을 새로 추가한 뒤 `yarn optimize:images` 로 실행하면 배포용 경량 webp 가 만들어진다.
import sharp from 'sharp';
import { readdirSync, unlinkSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

// 세트별 폴더(src/assets/sets/<세트>/{main,gallery}) 를 모두 최적화.
const setsRoot = 'src/assets/sets';
const targets = [];
if (existsSync(setsRoot)) {
  for (const set of readdirSync(setsRoot)) {
    targets.push({ dir: join(setsRoot, set, 'main'), width: 1600 });
    targets.push({ dir: join(setsRoot, set, 'gallery'), width: 1200 });
    targets.push({ dir: join(setsRoot, set, 'timeline'), width: 1200 });
  }
}

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
