// 단일 청첩장 이미지 자산 로더.
import heroImage from '../assets/main.webp';

const galleryMods = import.meta.glob('../assets/gallery/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

// 그리드 표시용 축소본(폭 480px). 원본을 그대로 쓰면 디코딩 비용이 커서 '더보기' 시 버벅인다.
// 생성: yarn thumbs (scripts/make-thumbs.mjs)
const galleryThumbMods = import.meta.glob('../assets/gallery-thumb/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const timelineMods = import.meta.glob('../assets/timeline/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/**
 * glob 결과를 파일명 순으로 정렬한 URL 배열로 변환.
 *
 * 파일명 전체를 자연 정렬(numeric)한다. 앞자리 숫자만 뽑아 비교하면
 * A01/B01/C01 이 모두 1 로 묶여 A01→B01→C01→A02… 로 뒤섞이므로,
 * 접두어(A/B/C)를 먼저 보고 그 안에서 번호 순으로 정렬되게 한다.
 * (A01…A10 → B01…B10 → C01…C08)
 */
function sortedUrls(mods: Record<string, string>): string[] {
  return Object.entries(mods)
    .sort(([a], [b]) => {
      const aFile = a.split('/').pop() ?? '';
      const bFile = b.split('/').pop() ?? '';
      return aFile.localeCompare(bFile, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(([, url]) => url);
}

/**
 * 파일명 숫자(01,02,03…)를 배열 인덱스로 사용해 정렬.
 * 없는 번호는 비어 있다. 예: 02(첫여행) 파일이 없으면 index 1 은 undefined.
 */
function indexedUrls(mods: Record<string, string>): string[] {
  const byNum: Record<number, string> = {};
  for (const [key, url] of Object.entries(mods)) {
    const file = key.split('/').pop() ?? '';
    const num = parseInt(file.match(/(\d+)/)?.[1] ?? '0', 10);
    if (!num) continue;
    byNum[num] = url;
  }
  const nums = Object.keys(byNum).map(Number);
  if (!nums.length) return [];
  const max = Math.max(...nums);
  return Array.from({ length: max }, (_, i) => byNum[i + 1]);
}

/** 메인(히어로) 이미지 URL. */
export { heroImage };

/** 갤러리 원본 이미지 URL 배열(파일명 순). 확대 보기(라이트박스)에서 사용. */
export const galleryImages = sortedUrls(galleryMods);

/**
 * 갤러리 그리드용 축소본 URL 배열(파일명 순, galleryImages 와 같은 순서).
 * 썸네일이 아직 생성되지 않았으면 원본으로 폴백한다.
 */
const galleryThumbUrls = sortedUrls(galleryThumbMods);
export const galleryThumbs =
  galleryThumbUrls.length === galleryImages.length ? galleryThumbUrls : galleryImages;

/** 갤러리 행 키. 파일명 접두어(A/B/C)가 그대로 행이 된다. */
export const GALLERY_ROW_KEYS = ['A', 'B', 'C'] as const;
export type GalleryRowKey = (typeof GALLERY_ROW_KEYS)[number];

/**
 * glob 결과를 파일명 접두어(A/B/C) 기준으로 묶는다.
 * 각 행 안에서는 번호 순(A01→A02→…)으로 정렬된다.
 */
function groupByRow(mods: Record<string, string>): Record<GalleryRowKey, string[]> {
  const out: Record<GalleryRowKey, string[]> = { A: [], B: [], C: [] };
  const entries = Object.entries(mods).sort(([a], [b]) => {
    const af = a.split('/').pop() ?? '';
    const bf = b.split('/').pop() ?? '';
    return af.localeCompare(bf, undefined, { numeric: true, sensitivity: 'base' });
  });
  for (const [key, url] of entries) {
    const file = key.split('/').pop() ?? '';
    const prefix = file.charAt(0).toUpperCase() as GalleryRowKey;
    if (prefix in out) out[prefix].push(url);
  }
  return out;
}

/** 행별 원본 이미지 (라이트박스에서 해당 행 안에서만 순환) */
export const galleryRows = groupByRow(galleryMods);

/** 행별 썸네일. 썸네일이 없는 행은 원본으로 폴백한다. */
const thumbRows = groupByRow(galleryThumbMods);
export const galleryThumbRows: Record<GalleryRowKey, string[]> = {
  A: thumbRows.A.length === galleryRows.A.length ? thumbRows.A : galleryRows.A,
  B: thumbRows.B.length === galleryRows.B.length ? thumbRows.B : galleryRows.B,
  C: thumbRows.C.length === galleryRows.C.length ? thumbRows.C : galleryRows.C,
};

/** 타임라인 이미지 URL 배열(인덱스 = 파일명 번호 - 1). */
export const timelineImages = indexedUrls(timelineMods);
