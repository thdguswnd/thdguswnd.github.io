import { useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { ScrollReveal } from '../components/ScrollReveal';

/** FR-10: 웨딩 갤러리. 2열 그리드로 표시, '더보기'로 나머지 사진 확장. */
export function GallerySection() {
  const { gallery } = useContent();
  const images = gallery.images ?? [];
  const initial = gallery.initialCount ?? 6;
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? images : images.slice(0, initial);
  const hasMore = images.length > initial;

  return (
    <ScrollReveal id="gallery">
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ letterSpacing: '0.25em', fontSize: '0.72rem', color: 'var(--color-accent)' }}>GALLERY</div>
        <h2 style={{ color: 'var(--color-accent)', fontWeight: 500, marginTop: 8 }}>웨딩 갤러리</h2>
      </div>

      {/* 2열 그리드 (초기 2x3 = 6장) */}
      <div
        data-testid="gallery-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}
      >
        {visible.map((img, i) => {
          const el = (
            <img
              src={img.src}
              alt={`웨딩 갤러리 ${i + 1}`}
              loading="lazy"
              style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 8, display: 'block' }}
            />
          );
          return img.link ? (
            <a key={i} href={img.link} target="_blank" rel="noopener noreferrer">
              {el}
            </a>
          ) : (
            <div key={i}>{el}</div>
          );
        })}
      </div>

      {/* 더보기 (남은 사진이 있을 때만) */}
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
