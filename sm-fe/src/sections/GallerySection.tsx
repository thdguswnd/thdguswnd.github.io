import { useState } from 'react';
import { ScrollReveal } from '../components/ScrollReveal';
import { LabelDivider } from '../components/LabelDivider';
import { GalleryRow } from '../components/GalleryRow';
import { GalleryLightbox } from '../components/GalleryLightbox';
import { GALLERY_ROW_KEYS, galleryRows, galleryThumbRows, type GalleryRowKey } from '../lib/images';

/** 확대 보기 대상: 어느 행의 몇 번째 사진인지. 순환은 그 행 안에서만 일어난다. */
type Zoom = { row: GalleryRowKey; index: number };

/**
 * FR-10: 웨딩 갤러리.
 *
 * A/B/C 3개 행을 각각 독립된 중앙 포커스 카드 슬라이더로 보여준다.
 * 파일명 접두어가 행을 결정한다(A01… = Row A).
 * 카드를 누르면 확대 보기가 열리고, 그 안에서의 이전/다음은 해당 행 안에서만 순환한다.
 */
export function GallerySection() {
  const [zoom, setZoom] = useState<Zoom | null>(null);

  return (
    <ScrollReveal id="gallery">
      {/* 헤더 */}
      <LabelDivider text="Gallery" />
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ color: 'var(--color-accent)', fontWeight: 500 }}>웨딩 갤러리</h2>
      </div>

      <div data-testid="gallery-grid">
        {GALLERY_ROW_KEYS.map((row) => (
          <GalleryRow
            key={row}
            rowKey={row}
            thumbs={galleryThumbRows[row]}
            onOpen={(index) => setZoom({ row, index })}
          />
        ))}
      </div>

      {/* 확대 보기. 해당 행의 사진만 순환한다 */}
      {zoom && (
        <GalleryLightbox
          images={galleryRows[zoom.row]}
          index={zoom.index}
          onIndexChange={(index) => setZoom({ row: zoom.row, index })}
          onClose={() => setZoom(null)}
        />
      )}
    </ScrollReveal>
  );
}
