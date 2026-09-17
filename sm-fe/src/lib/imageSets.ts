// 이미지 자산 로더. 단일 세트 구조: src/assets/sets/default/{main,gallery,timeline}/
// (이전에는 URL 경로별로 여러 세트를 두었으나 default 하나로 통합됨)

const mainMods = import.meta.glob('../assets/sets/default/main/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const galleryMods = import.meta.glob('../assets/sets/default/gallery/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const timelineMods = import.meta.glob('../assets/sets/default/timeline/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** glob 결과를 파일명 순으로 정렬한 URL 배열로 변환. */
function sortedUrls(mods: Record<string, string>): string[] {
  return Object.entries(mods)
    .sort(([a], [b]) => a.localeCompare(b))
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

/** 메인(히어로) 이미지 URL 배열(파일명 순). */
export const mainImages = sortedUrls(mainMods);

/** 갤러리 이미지 URL 배열(파일명 순). */
export const galleryImages = sortedUrls(galleryMods);

/** 타임라인 이미지 URL 배열(인덱스 = 파일명 번호 - 1). */
export const timelineImages = indexedUrls(timelineMods);
