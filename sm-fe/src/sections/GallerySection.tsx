import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { LabelDivider } from '../components/LabelDivider';
import { RevealDiv } from '../components/RevealDiv';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { galleryImages, galleryThumbs } from '../lib/images';

// 그리드는 축소본(gallery-thumb), 확대 보기는 원본(gallery) 사용.
// 원본을 그리드에 그대로 쓰면 디코딩 비용이 커서 '더보기' 시 버벅인다.
const galleryUrls = galleryImages;
const thumbUrls = galleryThumbs;

const ROWS_PER_PAGE = 3; // 한 번에 3줄(사진 6장)씩 표시

/** 배열을 2개씩 묶어 행(row)으로. */
function chunkPairs<T>(arr: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) rows.push(arr.slice(i, i + 2));
  return rows;
}

const rows = chunkPairs(galleryUrls);

/**
 * FR-10: 웨딩 갤러리.
 * 처음 6장을 보여주고, '더보기'를 한 번 누르면 이후에는 스크롤만 내려도
 * 6장씩 자동으로 이어 붙는다(무한 스크롤). 확대 보기에서 아직 안 불러온
 * 사진까지 넘어간 경우에도 자동 로드가 켜진다.
 */
export function GallerySection() {
  const [visibleRowsCount, setVisibleRowsCount] = useState(ROWS_PER_PAGE);
  const [autoLoad, setAutoLoad] = useState(false); // '더보기' 한 번 누른 뒤부터 스크롤 자동 로드
  const [zoomIndex, setZoomIndex] = useState<number | null>(null); // 확대 보기 중인 사진 index
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visibleRowsRef = useRef(ROWS_PER_PAGE); // 콜백에서 최신값을 읽기 위한 사본

  const visibleRows = rows.slice(0, visibleRowsCount);
  const hasMore = visibleRowsCount < rows.length;

  useEffect(() => {
    visibleRowsRef.current = visibleRowsCount;
  }, [visibleRowsCount]);

  /** 자동 로드가 켜진 뒤에는 목록 끝이 보이면 다음 6장을 붙인다. */
  useEffect(() => {
    if (!autoLoad || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleRowsCount((prev) => Math.min(prev + ROWS_PER_PAGE, rows.length));
        }
      },
      { rootMargin: '300px' }, // 바닥에 닿기 전에 미리 불러와 끊김 방지
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoLoad, hasMore, visibleRowsCount]);

  /** '더보기' 클릭: 6장 추가 + 이후 자동 로드 활성화. */
  function showMore() {
    setAutoLoad(true);
    setVisibleRowsCount((prev) => Math.min(prev + ROWS_PER_PAGE, rows.length));
  }

  /**
   * 확대 보기에서 사진을 넘길 때, 아직 그리드에 없는 사진까지 갔다면
   * '더보기'를 누른 것과 동일하게 처리한다(자동 로드 on + 해당 사진까지 노출).
   */
  const handleZoomIndexChange = useCallback((next: number) => {
    setZoomIndex(next);
    const neededRows = Math.floor(next / 2) + 1;
    if (neededRows > visibleRowsRef.current) {
      setAutoLoad(true);
      setVisibleRowsCount(
        Math.min(Math.max(neededRows, visibleRowsRef.current + ROWS_PER_PAGE), rows.length),
      );
    }
  }, []);

  return (
    <ScrollReveal id="gallery">
      {/* 헤더 */}
      <LabelDivider text="Gallery" />
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--color-accent)', fontWeight: 500 }}>웨딩 갤러리</h2>
      </div>

      {/* 한 줄(2장)씩 개별 리빌 */}
      <div data-testid="gallery-grid" style={{ display: 'grid', gap: 8 }}>
        {visibleRows.map((row, ri) => (
          <RevealDiv key={ri}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {row.map((_full, ci) => {
                const idx = ri * 2 + ci; // 전체 배열 기준 index (확대 보기 시작 위치)
                const src = thumbUrls[idx]; // 그리드는 축소본 사용
                return (
                  <img
                    key={ci}
                    src={src}
                    alt={`웨딩 갤러리 ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={600}
                    onClick={() => setZoomIndex(idx)}
                    data-testid="gallery-thumb"
                    style={{
                      width: '100%',
                      height: 'auto',
                      aspectRatio: '4 / 5',
                      objectFit: 'cover',
                      borderRadius: 8,
                      display: 'block',
                      cursor: 'zoom-in',
                      backgroundColor: '#efe9e2', // 로딩 중 빈칸 대신 배경색
                    }}
                  />
                );
              })}
            </div>
          </RevealDiv>
        ))}
      </div>

      {/* 자동 로드 감지용 지점 (목록 맨 아래) */}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />

      {/* 더보기: 자동 로드가 켜지기 전 최초 1회만 노출 */}
      {hasMore && !autoLoad && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            data-testid="gallery-more"
            onClick={showMore}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            더보기 ⌄
          </button>
        </div>
      )}

      {/* 확대 보기. 전체 사진(아직 그리드에 없는 것 포함) 기준으로 순환 이동 */}
      {zoomIndex !== null && (
        <GalleryLightbox
          images={galleryUrls}
          index={zoomIndex}
          onIndexChange={handleZoomIndexChange}
          onClose={() => setZoomIndex(null)}
        />
      )}
    </ScrollReveal>
  );
}
