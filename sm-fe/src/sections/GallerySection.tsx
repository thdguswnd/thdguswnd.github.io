import { useState } from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { LabelDivider } from '../components/LabelDivider';
import { RevealDiv } from '../components/RevealDiv';

// src/assets/gallery/ 의 모든 이미지 수집 (파일명 순). 폴더에 추가하면 자동 포함.
// 빌드 시 imagetools 가 리사이즈(w=1200)+webp 로 최적화(원본 파일은 그대로).
const galleryModules = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: { w: 1200, format: 'webp', quality: 80 },
  import: 'default',
}) as Record<string, string>;
const galleryUrls = Object.entries(galleryModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const INITIAL_ROWS = 3; // 초기 3줄(사진 6장) 표시 후 '더보기'

/** 배열을 2개씩 묶어 행(row)으로. */
function chunkPairs<T>(arr: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) rows.push(arr.slice(i, i + 2));
  return rows;
}

/** FR-10: 웨딩 갤러리. 한 줄(사진 2장)씩 스크롤 리빌, '더보기'로 디렉토리 내 전체 표시. */
export function GallerySection() {
  const [expanded, setExpanded] = useState(false);
  const rows = chunkPairs(galleryUrls);
  const visibleRows = expanded ? rows : rows.slice(0, INITIAL_ROWS);
  const hasMore = rows.length > INITIAL_ROWS;

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
              {row.map((src, ci) => (
                <img
                  key={ci}
                  src={src}
                  alt={`웨딩 갤러리 ${ri * 2 + ci + 1}`}
                  loading="lazy"
                  style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 8, display: 'block' }}
                />
              ))}
            </div>
          </RevealDiv>
        ))}
      </div>

      {/* 더보기 (초기 표시분보다 더 있을 때만) */}
      {hasMore && !expanded && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            data-testid="gallery-more"
            onClick={() => setExpanded(true)}
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
    </ScrollReveal>
  );
}
