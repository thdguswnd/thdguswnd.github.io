import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

// 손글씨 이미지(투명 배경 png/webp). 파일명 순(01~06)으로 사람 순서에 매핑.
// 아직 파일이 없으면 이름 텍스트 placeholder 로 표시된다.
const handwritingMods = import.meta.glob('../assets/handwriting/*.{png,webp,jpg,jpeg,PNG,WEBP,JPG,JPEG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const handwritingUrls = Object.entries(handwritingMods)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

// 경로(예: /신랑부)에 따른 시작 카드 인덱스. 기본은 신랑(2).
const START_KEYS: Record<string, number> = {
  신랑부: 0,
  'groom-father': 0,
  신랑모: 1,
  'groom-mother': 1,
  신랑: 2,
  groom: 2,
  신부부: 3,
  'bride-father': 3,
  신부모: 4,
  'bride-mother': 4,
  신부: 5,
  bride: 5,
};

const DEFAULT_START = 2; // 기본 도메인 첫 카드 = 신랑(송현중)

function startIndexFromPath(count: number): number {
  try {
    const base = import.meta.env.BASE_URL || '/';
    let path = decodeURIComponent(window.location.pathname);
    if (path.startsWith(base)) path = path.slice(base.length);
    const seg = path.replace(/^\/+|\/+$/g, '').split('/')[0];
    const idx = seg in START_KEYS ? START_KEYS[seg] : DEFAULT_START;
    return idx < count ? idx : 0;
  } catch {
    return 0;
  }
}

export interface CarouselPerson {
  key: string;
  name: string;
}

/** 손글씨 이미지 카드(옆으로 넘김, 무한 루프). URL 경로로 첫 카드 결정. */
export function HandwritingCarousel({ people }: { people: CarouselPerson[] }) {
  const startIndex = startIndexFromPath(people.length);
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
                display: 'flex',
                justifyContent: 'center',
                padding: '0 12px',
              }}
            >
              {/* 3:4 세로 카드 영역 (이비스 페인트 캔버스도 3:4 권장) */}
              <div style={{ width: '80%', maxWidth: 300, aspectRatio: '3 / 4' }}>
                {handwritingUrls[i] ? (
                  <img
                    src={handwritingUrls[i]}
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
