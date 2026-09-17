import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * 갤러리 확대 보기(라이트박스).
 * - 사진을 화면에 가깝게 꽉 채워 표시(비율 유지, 확대 제스처는 지원하지 않음)
 * - 좌/우 화살표로 이전·다음 이동, 양 끝에서 순환(첫 장 ← 마지막 장)
 * - 오른쪽 위 X, 사진 바깥(배경) 터치, ESC 로 닫기
 */
export function GalleryLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const total = images.length;

  // 순환 이동: 첫 장에서 이전 → 마지막 장, 마지막 장에서 다음 → 첫 장
  const move = useCallback(
    (delta: number) => {
      if (!total) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  // 배경 스크롤 잠금 + 키보드 조작(ESC 닫기, 좌우 화살표 이동)
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, move]);

  if (!total) return null;

  const navButton = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0, 0, 0, 0.38)',
    color: '#fff',
    fontSize: '1.4rem',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
  };

  return createPortal(
    // 배경(사진 바깥). 클릭하면 닫힘.
    <div
      data-testid="lightbox-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
    >
      {/* 닫기 (오른쪽 위) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        data-testid="lightbox-close"
        style={{
          position: 'absolute',
          top: 'max(12px, env(safe-area-inset-top))',
          right: 12,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0, 0, 0, 0.38)',
          color: '#fff',
          fontSize: '1.5rem',
          lineHeight: 1,
          cursor: 'pointer',
          zIndex: 3,
        }}
      >
        ×
      </button>

      {/* 이전 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          move(-1);
        }}
        aria-label="이전 사진"
        data-testid="lightbox-prev"
        style={{ ...navButton, left: 8 }}
      >
        ‹
      </button>

      {/* 다음 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          move(1);
        }}
        aria-label="다음 사진"
        data-testid="lightbox-next"
        style={{ ...navButton, right: 8 }}
      >
        ›
      </button>

      {/* 사진. 클릭이 배경으로 전파되지 않도록 차단(사진 자체 터치로는 닫히지 않음) */}
      <img
        src={images[index]}
        alt={`웨딩 갤러리 확대 ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        data-testid="lightbox-image"
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
        }}
      />

      {/* 현재 위치 표시 */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(14px, env(safe-area-inset-bottom))',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: '0.85rem',
          pointerEvents: 'none',
        }}
      >
        {index + 1} / {total}
      </div>
    </div>,
    document.body,
  );
}
