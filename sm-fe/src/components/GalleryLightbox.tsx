import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * 갤러리 확대 보기(라이트박스).
 * - 좌/우 화살표 클릭 또는 좌/우 터치 스와이프로 사진 넘기기
 * - 인스타그램 스타일 두 손가락 핀치 줌: 두 손가락으로 확대 시 확대되고, 손을 떼면 원본 크기로 자동 복귀(Snap-back)
 * - 배경 반투명 어둡기 완화(rgba(0, 0, 0, 0.6))
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

  // 스와이프 및 핀치 줌 상태
  const [dragX, setDragX] = useState(0);
  const [scale, setScale] = useState(1);
  const [isAnimatingBack, setIsAnimatingBack] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const initialPinchDist = useRef(0);
  const isSwiping = useRef(false);
  const isPinching = useRef(false);

  // 순환 이동: 첫 장에서 이전 → 마지막 장, 마지막 장에서 다음 → 첫 장
  const move = useCallback(
    (delta: number) => {
      if (!total) return;
      onIndexChange((index + delta + total) % total);
      setDragX(0);
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

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 두 손가락: 핀치 줌 모드 시작
      isSwiping.current = false;
      isPinching.current = true;
      setDragX(0);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      initialPinchDist.current = dist;
    } else if (e.touches.length === 1) {
      // 한 손가락: 스와이프 모드 준비
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isSwiping.current = true;
      isPinching.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinching.current && e.touches.length === 2) {
      // 두 손가락 확대 배율 계산 (최대 4배)
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (initialPinchDist.current > 0) {
        const factor = currentDist / initialPinchDist.current;
        setScale(Math.max(1, Math.min(factor, 4)));
      }
    } else if (isSwiping.current && e.touches.length === 1 && scale === 1) {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const dx = currentX - touchStartX.current;
      const dy = currentY - touchStartY.current;

      // 수평 이동이 수직 이동보다 클 때만 스와이프 피드백 반영
      if (Math.abs(dx) > Math.abs(dy)) {
        setDragX(dx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPinching.current) {
      // 핀치 줌 종료: 손을 떼면 인스타그램처럼 즉시 원본(scale: 1)으로 부드럽게 복귀
      isPinching.current = false;
      initialPinchDist.current = 0;
      setIsAnimatingBack(true);
      setScale(1);
      setTimeout(() => setIsAnimatingBack(false), 260);
    } else if (isSwiping.current) {
      isSwiping.current = false;
      const SWIPE_THRESHOLD = 45; // 45px 이상 스와이프 시 사진 전환
      if (dragX < -SWIPE_THRESHOLD) {
        move(1); // 왼쪽으로 쓸어 넘김 -> 다음 사진
      } else if (dragX > SWIPE_THRESHOLD) {
        move(-1); // 오른쪽으로 쓸어 넘김 -> 이전 사진
      }
      setDragX(0);
    }
  };

  const navButton = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0, 0, 0, 0.35)',
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
    // 배경(사진 바깥). 클릭하면 닫힘. 반투명 어둡기를 0.9에서 0.6으로 완화
    <div
      data-testid="lightbox-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        touchAction: 'none',
        userSelect: 'none',
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
          background: 'rgba(0, 0, 0, 0.35)',
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

      {/* 사진 컨테이너: 스와이프 및 핀치 줌 제스처 영역 */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: scale !== 1 ? `scale(${scale})` : `translateX(${dragX}px)`,
          transformOrigin: 'center center',
          transition: isAnimatingBack
            ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
            : dragX === 0
              ? 'transform 0.2s ease-out'
              : 'none',
          willChange: 'transform',
        }}
      >
        <img
          src={images[index]}
          alt={`웨딩 갤러리 확대 ${index + 1}`}
          data-testid="lightbox-image"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* 현재 위치 표시 */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(14px, env(safe-area-inset-bottom))',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.85rem',
          pointerEvents: 'none',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}
      >
        {index + 1} / {total}
      </div>
    </div>,
    document.body,
  );
}
