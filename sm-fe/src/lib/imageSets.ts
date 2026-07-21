// URL 경로별 이미지 세트. src/assets/sets/<세트명>/{main,gallery}/ 구조.
// 예: thdguswnd.github.io/ → 'default' 세트, thdguswnd.github.io/paints → 'paints' 세트.

const mainMods = import.meta.glob('../assets/sets/*/main/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const galleryMods = import.meta.glob('../assets/sets/*/gallery/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const timelineMods = import.meta.glob('../assets/sets/*/timeline/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** glob 키(경로)에서 세트명 추출: .../sets/<name>/... */
function setOf(key: string): string {
  const m = key.match(/\/sets\/([^/]+)\//);
  return m ? m[1] : 'default';
}

/** {세트명: [url, ...]} 로 그룹화(파일명 순 정렬). */
function group(mods: Record<string, string>): Record<string, string[]> {
  const out: Record<string, [string, string][]> = {};
  for (const [key, url] of Object.entries(mods)) {
    const s = setOf(key);
    (out[s] ||= []).push([key, url]);
  }
  const result: Record<string, string[]> = {};
  for (const s of Object.keys(out)) {
    result[s] = out[s].sort((a, b) => a[0].localeCompare(b[0])).map(([, url]) => url);
  }
  return result;
}

/**
 * 타임라인용: 파일명 숫자(01,02,03…)를 엔트리 순서로 사용해 인덱스 정렬.
 * {세트명: [n1 url, n2 url, …]} (없는 번호는 undefined). 예: 02(첫여행) 파일이 없으면 index 1 은 비어 있음.
 */
function groupIndexed(mods: Record<string, string>): Record<string, string[]> {
  const bySet: Record<string, Record<number, string>> = {};
  for (const [key, url] of Object.entries(mods)) {
    const s = setOf(key);
    const file = key.split('/').pop() ?? '';
    const num = parseInt(file.match(/(\d+)/)?.[1] ?? '0', 10);
    if (!num) continue;
    (bySet[s] ||= {})[num] = url;
  }
  const result: Record<string, string[]> = {};
  for (const s of Object.keys(bySet)) {
    const map = bySet[s];
    const max = Math.max(...Object.keys(map).map(Number));
    result[s] = Array.from({ length: max }, (_, i) => map[i + 1]);
  }
  return result;
}

const mainBySet = group(mainMods);
const galleryBySet = group(galleryMods);
const timelineBySet = groupIndexed(timelineMods);

/** 현재 URL 경로에서 세트명 결정. 알 수 없으면 'default'. */
export function currentSet(): string {
  const base = import.meta.env.BASE_URL || '/';
  let path = window.location.pathname;
  if (path.startsWith(base)) path = path.slice(base.length);
  const seg = path.replace(/^\/+|\/+$/g, '').split('/')[0];
  return seg && (mainBySet[seg] || galleryBySet[seg]) ? seg : 'default';
}

/** 해당 세트의 메인 이미지 URL 배열(없으면 default). */
export function mainImages(set: string): string[] {
  return mainBySet[set] ?? mainBySet.default ?? [];
}

/** 해당 세트의 갤러리 이미지 URL 배열(없으면 default). */
export function galleryImages(set: string): string[] {
  return galleryBySet[set] ?? galleryBySet.default ?? [];
}

/** 해당 세트의 타임라인 이미지 URL 배열(엔트리 순서 = 파일 번호, 없으면 default). */
export function timelineImages(set: string): string[] {
  return timelineBySet[set] ?? timelineBySet.default ?? [];
}
