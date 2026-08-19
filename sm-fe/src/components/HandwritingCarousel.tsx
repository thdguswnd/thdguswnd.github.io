import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

// 손글씨 이미지(투명 배경 png/webp). 파일명 앞 번호(01~06)로 사람 순서에 매핑.
// 번호가 없는 자리는 이름 텍스트 placeholder 로 표시된다.
const handwritingMods = import.meta.glob('../assets/handwriting/*.{png,webp,jpg,jpeg,PNG,WEBP,JPG,JPEG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function fileNumber(key: string): number {
  const f = key.split('/').pop() ?? '';
  return parseInt(f.match(/(\d+)/)?.[1] ?? '0', 10);
}

// 인덱스(0~5) = 파일번호-1. 누락 번호는 undefined.
const handwritingByIndex: (string | undefined)[] = [];
for (const [key, url] of Object.entries(handwritingMods)) {
  const n = fileNumber(key);
  if (n >= 1) handwritingByIndex[n - 1] = url;
}

// 경로(예: /신랑부)에 따른 시작 카드 인덱스.
const START_KEYS: Record<string, number> = {
  신랑부: 0,
  'groom-father': 0,
  신랑모: 1,
  'groom-mother': 1,
  신부부: 2,
  'bride-father': 2,
  신부모: 3,
  'bride-mother': 3,
  신랑: 4,
  groom: 4,
  신부: 5,
  bride: 5,
};

const DEFAULT_START = 0; // 기본 도메인 첫 카드 = 01(송창용) — RANDOM_DEFAULT=false 일 때만 사용
const RANDOM_DEFAULT = true; // 기본 접속 시 (업로드된 카드 중) 매번 랜덤

// URL 경로가 사람 키와 매칭되면 그 인덱스, 아니면 -1.
function pathKeyIndex(): number {
  try {
    const base = import.meta.env.BASE_URL || '/';
    let path = decodeURIComponent(window.location.pathname);
    if (path.startsWith(base)) path = path.slice(base.length);
    const seg = path.replace(/^\/+|\/+$/g, '').split('/')[0];
    return seg in START_KEYS ? START_KEYS[seg] : -1;
  } catch {
    return -1;
  }
}

export interface CarouselPerson {
  key: string;
  name: string;
}

/** 손글씨 이미지 카드(옆으로 넘김, 무한 루프). URL 경로로 첫 카드 결정, 기본은 01(또는 랜덤). */
export function HandwritingCarousel({ people }: { people: CarouselPerson[] }) {
  const [startIndex] = useState(() => {
    const fromPath = pathKeyIndex();
    if (fromPath >= 0 && fromPath < people.length) return fromPath;
    if (RANDOM_DEFAULT) {
      const pool = people.map((_, i) => i).filter((i) => handwritingByIndex[i] !== undefined);
      const arr = pool.length ? pool : [0];
      return arr[Math.floor(Math.random() * arr.length)];
    }
    return DEFAULT_START < people.length ? DEFAULT_START : 0;
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex, align: 'center' });
  const [selected, setSelected] = useState(startIndex);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(startIndex, true); // 초기 위치 강제(즉시 이동)
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, startIndex]);

  return (
    <div style={{ margin: '24px 0' }}>
      <div ref={emblaRef} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          {people.map((p, i) => (
            <div
              key={p.key}
              style={{
                flex: '0 0 100%',
                minWidth: 0,
                padding: '0 4px',
              }}
            >
              {/* 가로 꽉 채우는 3:4 세로 카드 (이비스 페인트 캔버스도 3:4 권장) */}
              <div style={{ width: '100%', aspectRatio: '3 / 4' }}>
                {handwritingByIndex[i] ? (
                  <img
                    src={handwritingByIndex[i]}
                    alt={`${p.name} 손글씨`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      border: '1px dashed var(--color-accent)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', color: 'var(--color-text)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>손글씨 이미지 예정</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 위치 표시 점 */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
        {people.map((p, i) => (
          <button
            key={p.key}
            type="button"
            aria-label={`${p.name} 카드`}
            onClick={() => emblaApi?.scrollTo(i)}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: i === selected ? 'var(--color-accent)' : '#d8d0c8',
            }}
          />
        ))}
      </div>
    </div>
  );
}
