import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

/**
 * 중앙 포커스 카드 슬라이더(coverflow) 한 줄.
 *
 * - 가운데 카드가 활성. 시작은 항상 첫 장(01).
 * - 좌우 무한 순환: 첫 장에서 왼쪽으로 넘기면 그 행의 마지막 장으로 간다.
 * - 양옆 카드는 살짝 작아지고 어두워지며, 가운데로 오면서 부드럽게 원래 상태로 돌아온다.
 * - 카드를 누르면 onOpen(index) 으로 확대 보기를 띄운다.
 */
export function GalleryRow({
  rowKey,
  thumbs,
  onOpen,
}: {
  rowKey: string;
  thumbs: string[];
  onOpen: (index: number) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true, // 양 끝에서 순환
    align: 'center', // 활성 카드를 가운데 정렬
    startIndex: 0, // 01 부터 시작
    containScroll: false, // 첫/마지막 장도 가운데 올 수 있게
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const handleCardClick = useCallback(
    (i: number) => {
      // 가운데가 아닌 카드를 누르면 먼저 가운데로 옮기고, 가운데 카드는 바로 확대
      if (emblaApi && i !== selected) {
        emblaApi.scrollTo(i);
        return;
      }
      onOpen(i);
    },
    [emblaApi, selected, onOpen],
  );

  if (!thumbs.length) return null;

  return (
    <div style={{ margin: '0 0 18px' }} data-testid={`gallery-row-${rowKey}`}>
      {/* 카드가 축소될 때 잘리지 않도록 좌우 여백 확보 */}
      <div ref={emblaRef} style={{ overflow: 'hidden', padding: '10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {thumbs.map((src, i) => {
            const active = i === selected;
            return (
              <div
                key={i}
                style={{
                  // 70% 폭 → 양옆 카드가 살짝 보인다(coverflow)
                  flex: '0 0 70%',
                  minWidth: 0,
                  padding: '0 4px',
                  // 비활성 카드는 축소 + 어둡게. 가운데로 오며 부드럽게 복원
                  transform: active ? 'scale(1)' : 'scale(0.88)',
                  filter: active ? 'brightness(1)' : 'brightness(0.6)',
                  opacity: active ? 1 : 0.85,
                  transition: 'transform 0.35s ease, filter 0.35s ease, opacity 0.35s ease',
                  zIndex: active ? 2 : 1,
                  willChange: 'transform, filter',
                }}
              >
                <img
                  src={src}
                  alt={`웨딩 갤러리 ${rowKey}${String(i + 1).padStart(2, '0')}`}
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={600}
                  onClick={() => handleCardClick(i)}
                  data-testid="gallery-card"
                  style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '4 / 5',
                    objectFit: 'cover',
                    borderRadius: 10,
                    display: 'block',
                    cursor: 'zoom-in',
                    backgroundColor: '#e7e4dd',
                    boxShadow: active ? '0 6px 18px rgba(0,0,0,0.18)' : 'none',
                    transition: 'box-shadow 0.35s ease',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 행 내 위치 표시 */}
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 2 }}>
        {thumbs.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${rowKey}${String(i + 1).padStart(2, '0')} 보기`}
            onClick={() => emblaApi?.scrollTo(i)}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: i === selected ? 'var(--color-accent)' : '#d5d2ca',
              transition: 'background 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
