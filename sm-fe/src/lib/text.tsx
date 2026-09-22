import type { ReactNode } from 'react';

/**
 * 지정한 구절을 줄바꿈되지 않는 span 으로 감싸 반환한다.
 *
 * `word-break: keep-all` 만으로도 한글 단어 중간 분리는 막을 수 있지만,
 * "청학빌딩 10층" 처럼 공백이 들어간 의미 단위는 여전히 쪼개진다.
 * 그런 구절을 한 덩어리로 묶는 데 사용한다.
 *
 * 부모에 `white-space: pre-line` 이 걸려 있어도 줄바꿈(\n)은 그대로 보존된다.
 */
export function keepTogether(text: string, phrases: string[]): ReactNode[] {
  if (!phrases.length) return [text];

  // 긴 구절을 먼저 매칭해야 짧은 구절에 먹히지 않는다
  const ordered = [...phrases].sort((a, b) => b.length - a.length);
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    // 남은 문자열에서 가장 앞쪽에 등장하는 구절을 찾는다
    let hitAt = -1;
    let hit = '';
    for (const p of ordered) {
      const at = rest.indexOf(p);
      if (at !== -1 && (hitAt === -1 || at < hitAt)) {
        hitAt = at;
        hit = p;
      }
    }

    if (hitAt === -1) {
      out.push(rest);
      break;
    }

    if (hitAt > 0) out.push(rest.slice(0, hitAt));
    out.push(
      <span key={`nw-${key}`} className="nowrap">
        {hit}
      </span>,
    );
    key += 1;
    rest = rest.slice(hitAt + hit.length);
  }

  return out;
}
