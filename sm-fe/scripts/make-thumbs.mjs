// 갤러리 그리드용 썸네일 생성 스크립트.
//
// 왜 필요한가:
//   그리드에 보이는 사진은 약 236x295 px 인데 원본은 1200x1800~1400x2100 이다.
//   브라우저는 원본 픽셀 전체를 디코딩한 뒤 축소하므로, 파일 용량이 작아도
//   픽셀 수만큼 CPU/메모리를 쓴다(24장 = 약 209MB). '더보기'로 6장이 한꺼번에
//   추가되면 디코딩이 한 프레임에 몰려 화면이 버벅인다.
//
// 해결:
//   그리드 전용 축소본(폭 480px, DPR 2 대응)을 assets/gallery-thumb/ 에 만든다.
//   확대 팝업(라이트박스)은 계속 원본(assets/gallery/)을 사용한다.
//
// 사용법: node scripts/make-thumbs.mjs
import sharp from 'sharp';
import { readdirSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC = 'src/assets/gallery';
const OUT = 'src/assets/gallery-thumb';
const WIDTH = 480; // 표시 폭 236px × DPR 2
const QUALITY = 72;

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC)
  .filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

let srcTotal = 0;
let outTotal = 0;
let srcPx = 0;
let outPx = 0;

for (const f of files) {
  const src = join(SRC, f);
  const out = join(OUT, f.replace(/\.(jpe?g|png)$/i, '.webp'));
  // eslint-disable-next-line no-await-in-loop
  const meta = await sharp(src).metadata();
  // eslint-disable-next-line no-await-in-loop
  const info = await sharp(src).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out);
  const sKb = statSync(src).size / 1024;
  const oKb = statSync(out).size / 1024;
  srcTotal += sKb;
  outTotal += oKb;
  srcPx += meta.width * meta.height;
  outPx += info.width * info.height;
  console.log(
    `${f.padEnd(10)} ${(meta.width + 'x' + meta.height).padEnd(11)} ${String(Math.round(sKb)).padStart(4)}KB  ->  ${(info.width + 'x' + info.height).padEnd(9)} ${String(Math.round(oKb)).padStart(3)}KB`,
  );
}

console.log('---');
console.log(`썸네일 ${files.length}장 생성: ${OUT}`);
console.log(`용량   ${(srcTotal / 1024).toFixed(1)}MB -> ${(outTotal / 1024).toFixed(1)}MB`);
console.log(
  `디코딩 RAM  ${((srcPx * 4) / 1024 / 1024).toFixed(0)}MB -> ${((outPx * 4) / 1024 / 1024).toFixed(0)}MB`,
);
