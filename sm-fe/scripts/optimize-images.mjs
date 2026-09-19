// 로컬 이미지 최적화 스크립트 (sharp).
// 청첩장 및 게임 자산의 jpg/jpeg/png를 webp로 변환하고 원본은 제거한다.
// gallery 내 고용량 webp도 자동으로 1400px 폭, quality 80으로 경량화한다.
import sharp from 'sharp';
import { readdirSync, unlinkSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

const roots = ['src/assets', 'public/game/assets'];
const photoWidths = new Map([
  ['wed-hall', 1600],
  ['loftgarden344', 1600],
]);

function imageFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return imageFiles(path);
    return ['.jpg', '.jpeg', '.png'].includes(extname(entry.name).toLowerCase()) ? [path] : [];
  });
}

for (const root of roots) {
  for (const src of imageFiles(root)) {
    const name = basename(src, extname(src));
    const out = join(src, '..', `${name}.webp`);
    const width = photoWidths.get(name);
    let image = sharp(src).rotate();
    if (width) image = image.resize({ width, withoutEnlargement: true });
    // 손글씨·아이콘·캐릭터는 투명도와 선명도를 유지하고, 사진은 용량을 줄인다.
    const options = width ? { quality: 82, alphaQuality: 100 } : { lossless: true };
    // eslint-disable-next-line no-await-in-loop
    await image.webp(options).toFile(out);
    unlinkSync(src);
    console.log(`optimized: ${src} -> ${out}`);
  }
}

// 갤러리 webp 최적화 (300KB 초과 또는 너비 1400px 초과 시)
const galleryDir = 'src/assets/gallery';
try {
  const galleryFiles = readdirSync(galleryDir).filter((f) => f.endsWith('.webp'));
  for (const file of galleryFiles) {
    const filePath = join(galleryDir, file);
    const buf = readFileSync(filePath);
    const meta = await sharp(buf).metadata();
    if (buf.length > 300 * 1024 || (meta.width && meta.width > 1400)) {
      const opt = await sharp(buf)
        .rotate()
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      writeFileSync(filePath, opt);
      console.log(`optimized gallery webp: ${file}`);
    }
  }
} catch {}

console.log('done.');
