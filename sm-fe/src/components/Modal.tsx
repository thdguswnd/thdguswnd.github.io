import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

const LINE = '#e5ddd4';

/** 공용 오버레이 모달. 반투명(밝은 25%) + 블러 배경, Portal 로 body 에 렌더. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      data-testid="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#fdfbf7',
          borderRadius: 12,
          padding: '16px 18px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
          border: `1px solid ${LINE}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 12 }}>
          <h3 style={{ fontWeight: 600 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            data-testid="modal-close"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              border: 'none',
              background: 'transparent',
              fontSize: '1.3rem',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
