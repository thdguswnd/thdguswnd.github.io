import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * 갤러리 확대 보기(라이트박스).
 *
 * - 카드 넘김: [이전 · 현재 · 다음] 3장을 한 트랙에 두고 좌우로 쓸면 이웃 사진이 따라 움직인다.
 *   임계값을 넘기면 그 방향으로 넘어가고, 모자라면 제자리로 되돌아온다. 양 끝에서는 순환한다.
 * - 좌/우 화살표 버튼, 키보드 좌우 화살표로도 이동.
 * - 핀치 줌: 두 손가락으로 확대되며 손가락 중심을 기준으로 커진다.
 *   손을 떼면 원본 크기로 되돌아온다(인스타그램 방식, 확대 상태로 고정되지 않음).
 * - 닫기: 오른쪽 위 ×, 사진 바깥(배경) 터치, ESC.
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

  // 카드 넘김 상태
  const [dragX, setDragX] = useState(0); // 트랙의 현재 가로 오프셋(px)
  const [animating, setAnimating] = useState(false); // 스냅 애니메이션 중 여부
  const pendingDelta = useRef(0); // 애니메이션 종료 후 반영할 이동량(-1/0/+1)

  // 핀치 줌 상태
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState('50% 50%');
  const [zoomAnimating, setZoomAnimating] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const pinchStartDist = useRef(0);
  const mode = useRef<'none' | 'swipe' | 'pinch'>('none');

  const wrap = useCallback((i: number) => ((i % total) + total) % total, [total]);

  /** 버튼·키보드용 즉시 이동. */
  const jump = useCallback(
    (delta: number) => {
      if (!total) return;
      setAnimating(false);
      setDragX(0);
      pendingDelta.current = 0;
      onIndexChange(wrap(index + delta));
    },
    [index, total, onIndexChange, wrap],
  );

  // 배경 스크롤 잠금 + 키보드 조작
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') jump(-1);
      else if (e.key === 'ArrowRight') jump(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, jump]);

  if (!total) return null;

  const dist = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length >= 2) {
      // 두 손가락 → 핀치 줌. 진행 중이던 스와이프는 취소.
      mode.current = 'pinch';
      setDragX(0);
      setAnimating(false);
      pinchStartDist.current = dist(e.touches);
      // 확대 기준점 = 두 손가락 중간 지점(컨테이너 기준 %)
      const rect = e.currentTarget.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const px = ((midX - rect.left) / rect.width) * 100;
      const py = ((midY - rect.top) / rect.height) * 100;
      setZoomAnimating(false);
      setOrigin(`${Math.max(0, Math.min(100, px))}% ${Math.max(0, Math.min(100, py))}%`);
    } else if (e.touches.length === 1 && scale === 1) {
      mode.current = 'swipe';
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      setAnimating(false);
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (mode.current === 'pinch' && e.touches.length >= 2) {
      if (pinchStartDist.current > 0) {
        const factor = dist(e.touches) / pinchStartDist.current;
        setScale(Math.max(1, Math.min(factor, 4))); // 1~4배
      }
      return;
    }
    if (mode.current === 'swipe' && e.touches.length === 1) {
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;
      // 가로 이동이 세로보다 뚜렷할 때만 카드를 끌어당긴다(세로 스크롤 오인 방지)
      if (Math.abs(dx) > Math.abs(dy)) setDragX(dx);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (mode.current === 'pinch') {
      // 남은 손가락이 있으면 아직 제스처 중
      if (e.touches.length >= 2) return;
      mode.current = 'none';
      pinchStartDist.current = 0;
      setZoomAnimating(true); // 원본 크기로 부드럽게 복귀
      setScale(1);
      return;
    }
    if (mode.current === 'swipe') {
      mode.current = 'none';
      const w = window.innerWidth || 1;
      const threshold = Math.min(70, w * 0.15);
      setAnimating(true);
      if (dragX <= -threshold) {
        pendingDelta.current = 1; // 왼쪽으로 쓸기 → 다음
        setDragX(-w);
      } else if (dragX >= threshold) {
        pendingDelta.current = -1; // 오른쪽으로 쓸기 → 이전
        setDragX(w);
      } else {
        pendingDelta.current = 0; // 부족 → 제자리 복귀
        setDragX(0);
      }
    }
  }

  /** 스냅 애니메이션이 끝난 시점에 실제 index 를 넘기고 트랙을 원위치로. */
  function handleTrackTransitionEnd() {
    if (!animating) return;
    setAnimating(false);
    const delta = pendingDelta.current;
    pendingDelta.current = 0;
    setDragX(0);
    if (delta !== 0) onIndexChange(wrap(index + delta));
  }

  const slides = [wrap(index - 1), index, wrap(index + 1)];

  const navButton = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0, 0, 0, 0.3)',
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
    // 배경(사진 바깥). 클릭하면 닫힘. 어둡기 완화: 0.6 → 0.45
    <div
      data-testid="lightbox-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        zIndex: 1100,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* 카드 트랙: [이전 · 현재 · 다음]. 기본 위치는 -100vw(가운데 = 현재 사진) */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onTransitionEnd={handleTrackTransitionEnd}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          width: '300vw',
          transform: `translateX(calc(-100vw + ${dragX}px))`,
          transition: animating ? 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
          willChange: 'transform',
        }}
      >
        {slides.map((slideIdx, pos) => {
          const isCurrent = pos === 1;
          return (
            <div
              key={`${slideIdx}-${pos}`}
              style={{
                flex: '0 0 100vw',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // 확대는 현재 사진에만 적용, 손가락 중심 기준
                transform: isCurrent && scale !== 1 ? `scale(${scale})` : undefined,
                transformOrigin: origin,
                transition: isCurrent && zoomAnimating ? 'transform 0.25s ease-out' : 'none',
              }}
            >
              <img
                src={images[slideIdx]}
                alt={`웨딩 갤러리 확대 ${slideIdx + 1}`}
                data-testid={isCurrent ? 'lightbox-image' : undefined}
                draggable={false}
                decoding="async"
                style={{
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
          );
        })}
      </div>

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
          background: 'rgba(0, 0, 0, 0.3)',
          color: '#fff',
          fontSize: '1.5rem',
          lineHeight: 1,
          cursor: 'pointer',
          zIndex: 3,
        }}
      >
        ×
      </button>

      {/* 이전 / 다음 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          jump(-1);
        }}
        aria-label="이전 사진"
        data-testid="lightbox-prev"
        style={{ ...navButton, left: 8 }}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          jump(1);
        }}
        aria-label="다음 사진"
        data-testid="lightbox-next"
        style={{ ...navButton, right: 8 }}
      >
        ›
      </button>

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
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          zIndex: 3,
        }}
      >
        {index + 1} / {total}
      </div>
    </div>,
    document.body,
  );
}
