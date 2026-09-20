import { useState } from 'react';
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

/** FR-10: 웨딩 갤러리. 한 줄(사진 2장)씩 스크롤 리빌, '더보기' 시 6장씩 추가 표시. */
export function GallerySection() {
  const [visibleRowsCount, setVisibleRowsCount] = useState(ROWS_PER_PAGE);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null); // 확대 보기 중인 사진 index
  const rows = chunkPairs(galleryUrls);
  const visibleRows = rows.slice(0, visibleRowsCount);
  const hasMore = visibleRowsCount < rows.length;

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
                    height={720}
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
                      // 합성 레이어로 올려 리빌 애니메이션 중 리페인트 비용 절감
                      backgroundColor: '#efe9e2',
                    }}
                  />
                );
              })}
            </div>
          </RevealDiv>
        ))}
      </div>

      {/* 더보기 (사진이 더 있을 때 6장(3줄)씩 추가) */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            data-testid="gallery-more"
            onClick={() => setVisibleRowsCount((prev) => prev + ROWS_PER_PAGE)}
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

      {/* 확대 보기. 전체 사진(더보기 이전 포함) 기준으로 순환 이동 */}
      {zoomIndex !== null && (
        <GalleryLightbox
          images={galleryUrls}
          index={zoomIndex}
          onIndexChange={setZoomIndex}
          onClose={() => setZoomIndex(null)}
        />
      )}
    </ScrollReveal>
  );
}
