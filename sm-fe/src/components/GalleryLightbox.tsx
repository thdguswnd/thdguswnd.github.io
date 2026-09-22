import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * 갤러리 확대 보기(라이트박스).
 *
 * - 전달받은 images 안에서만 순환한다. 갤러리에서 행 단위로 넘겨주므로
 *   A행을 보다가 B/C행으로 넘어가지 않는다.
 * - 카드 넘김: [이전 · 현재 · 다음] 3장을 한 트랙에 두고 좌우로 쓸면 이웃이 따라 움직인다.
 *   임계값을 넘기면 넘어가고, 모자라면 제자리로 돌아온다. 양 끝에서는 순환한다.
 * - 핀치 줌: 두 손가락으로 확대되고 누른 채 움직이면 확대 부분이 따라 이동한다.
 *   손을 떼면 원래 크기·위치로 돌아온다.
 * - 조작 UI 토글: 버튼이 아닌 빈 영역을 탭하면 ×, ‹, ›, 카운터가 함께 숨고 다시 탭하면 나타난다.
 *   닫기는 × 버튼(또는 ESC)으로만 한다.
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
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const pendingDelta = useRef(0);

  // 핀치 줌/이동 상태
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState('50% 50%');
  const [zoomAnimating, setZoomAnimating] = useState(false);

  // 조작 UI 표시 여부
  const [controlsVisible, setControlsVisible] = useState(true);

  const startX = useRef(0);
  const startY = useRef(0);
  const pinchStartDist = useRef(0);
  const pinchStartMid = useRef({ x: 0, y: 0 });
  const mode = useRef<'none' | 'swipe' | 'pinch'>('none');
  // 터치로 이미 처리한 탭이 click 으로 한 번 더 들어와 토글이 두 번 되는 것을 막는다
  const touchHandledAt = useRef(0);

  const wrap = useCallback((i: number) => ((i % total) + total) % total, [total]);

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

  const toggleControls = useCallback(() => setControlsVisible((v) => !v), []);

  /**
   * 휴대폰 뒤로가기(하드웨어/제스처)로 청첩장을 벗어나지 않게 한다.
   *
   * 열릴 때 더미 history 항목을 push 해두고, popstate(뒤로가기) 가 오면
   * 그 항목이 소비된 것이므로 팝업만 닫는다.
   * X·ESC 로 직접 닫은 경우에는 push 해둔 항목이 남아 있으므로
   * history.back() 으로 되돌려 쓸데없는 항목이 쌓이지 않게 정리한다.
   */
  const pushedRef = useRef(false); // 더미 항목을 push 한 상태인지
  const closedByPopRef = useRef(false); // popstate 로 닫히는 중인지

  // onClose 는 부모에서 매 렌더 새로 만들어지는 함수다. 아래 effect 의 의존성으로 두면
  // 사진을 넘길 때마다(부모 리렌더) cleanup 이 돌아 history.back() 이 호출되고,
  // 그 popstate 가 팝업을 닫아버린다. 그래서 최신 값을 ref 로만 참조한다.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 이 effect 는 열릴 때 1회, 닫힐 때 1회만 실행되어야 한다(의존성 배열 비움).
  useEffect(() => {
    window.history.pushState({ lightboxOpen: true }, '');
    pushedRef.current = true;

    const onPopState = () => {
      // 뒤로가기로 더미 항목이 이미 사라졌다 → 추가 정리 없이 닫기만 한다
      pushedRef.current = false;
      closedByPopRef.current = true;
      onCloseRef.current();
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
      // X·ESC 로 닫은 경우: 남아 있는 더미 항목 제거
      if (pushedRef.current && !closedByPopRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, []);

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

  // 앞뒤 2장 선로딩 (연속 스와이프 시 빈 화면 방지)
  useEffect(() => {
    if (!total) return;
    for (const d of [1, -1, 2, -2]) {
      const img = new Image();
      img.decoding = 'async';
      img.src = images[wrap(index + d)];
    }
  }, [index, images, total, wrap]);

  if (!total) return null;

  const dist = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const mid = (t: React.TouchList) => ({
    x: (t[0].clientX + t[1].clientX) / 2,
    y: (t[0].clientY + t[1].clientY) / 2,
  });

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length >= 2) {
      mode.current = 'pinch';
      setDragX(0);
      setAnimating(false);
      setZoomAnimating(false);
      pinchStartDist.current = dist(e.touches);
      const m = mid(e.touches);
      pinchStartMid.current = m;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = ((m.x - rect.left) / rect.width) * 100;
      const py = ((m.y - rect.top) / rect.height) * 100;
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
        setScale(Math.max(1, Math.min(factor, 4)));
        const m = mid(e.touches);
        setPan({ x: m.x - pinchStartMid.current.x, y: m.y - pinchStartMid.current.y });
      }
      return;
    }
    if (mode.current === 'swipe' && e.touches.length === 1) {
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;
      if (Math.abs(dx) > Math.abs(dy)) setDragX(dx);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (mode.current === 'pinch') {
      if (e.touches.length >= 2) return;
      mode.current = 'none';
      pinchStartDist.current = 0;
      setZoomAnimating(true);
      setScale(1);
      setPan({ x: 0, y: 0 });
      touchHandledAt.current = Date.now();
      return;
    }
    if (mode.current === 'swipe') {
      mode.current = 'none';
      const w = window.innerWidth || 1;
      const threshold = Math.min(70, w * 0.15);
      const TAP_SLOP = 10; // 이 정도 움직임은 '탭'으로 본다

      if (Math.abs(dragX) < TAP_SLOP) {
        // 움직임이 거의 없으면 탭 → 조작 UI 토글
        touchHandledAt.current = Date.now();
        setDragX(0);
        toggleControls();
        return;
      }

      setAnimating(true);
      touchHandledAt.current = Date.now();
      if (dragX <= -threshold) {
        pendingDelta.current = 1;
        setDragX(-w);
      } else if (dragX >= threshold) {
        pendingDelta.current = -1;
        setDragX(w);
      } else {
        pendingDelta.current = 0;
        setDragX(0);
      }
    }
  }

  function handleTrackTransitionEnd() {
    if (!animating) return;
    setAnimating(false);
    const delta = pendingDelta.current;
    pendingDelta.current = 0;
    setDragX(0);
    if (delta !== 0) onIndexChange(wrap(index + delta));
  }

  /** 마우스 클릭(데스크톱)으로도 토글. 터치에서 이미 처리했으면 무시. */
  function handleSurfaceClick() {
    if (Date.now() - touchHandledAt.current < 600) return;
    toggleControls();
  }

  const slides = [wrap(index - 1), index, wrap(index + 1)];

  // 숨김 상태에서는 클릭도 받지 않아야 한다(투명 버튼이 탭을 가로채지 않도록)
  const controlStyle = {
    opacity: controlsVisible ? 1 : 0,
    pointerEvents: controlsVisible ? ('auto' as const) : ('none' as const),
    transition: 'opacity 0.22s ease',
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
    ...controlStyle,
  };

  return createPortal(
    // 배경. 여기 탭으로는 닫지 않고 조작 UI 만 토글한다(닫기는 × 또는 ESC).
    <div
      data-testid="lightbox-backdrop"
      onClick={handleSurfaceClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        overflow: 'hidden',
        zIndex: 1100,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* 카드 트랙: [이전 · 현재 · 다음] */}
      <div
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
          const zoomed = isCurrent && (scale !== 1 || pan.x !== 0 || pan.y !== 0);
          return (
            <div
              key={`${slideIdx}-${pos}`}
              style={{
                flex: '0 0 100vw',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: zoomed ? `translate(${pan.x}px, ${pan.y}px) scale(${scale})` : undefined,
                transformOrigin: origin,
                transition: isCurrent && zoomAnimating ? 'transform 0.25s ease-out' : 'none',
                willChange: isCurrent ? 'transform' : undefined,
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

      {/* 닫기 (오른쪽 위) — 유일한 닫기 수단 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="닫기"
        aria-hidden={!controlsVisible}
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
          ...controlStyle,
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
        aria-hidden={!controlsVisible}
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
        aria-hidden={!controlsVisible}
        data-testid="lightbox-next"
        style={{ ...navButton, right: 8 }}
      >
        ›
      </button>

      {/* 현재 위치 표시 */}
      <div
        data-testid="lightbox-counter"
        style={{
          position: 'absolute',
          bottom: 'max(14px, env(safe-area-inset-bottom))',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.85rem',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          zIndex: 3,
          ...controlStyle,
          pointerEvents: 'none', // 카운터는 항상 탭을 통과시킨다
        }}
      >
        {index + 1} / {total}
      </div>
    </div>,
    document.body,
  );
}
