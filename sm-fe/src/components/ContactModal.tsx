import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ContactPerson } from '../content/types';

const LINE = '#e5ddd4';

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1l-2.2 2.3z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 6h16c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1zm.7 2L12 12.9 19.3 8H4.7zM20 9.3l-8 5.3-8-5.3V16h16V9.3z" />
    </svg>
  );
}

const circleBtn = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  border: `1px solid ${LINE}`,
  background: '#fff',
  color: '#555',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
} as const;

function ContactRow({ person }: { person: ContactPerson }) {
  const digits = person.phone.replace(/[^0-9+]/g, '');
  return (
    <div
      data-testid="contact-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 0',
        borderBottom: `1px solid #f0ebe4`,
      }}
    >
      <span style={{ width: 44, color: 'var(--color-muted)', fontSize: '0.82rem' }}>{person.role}</span>
      <span style={{ flex: 1, minWidth: 0 }}>{person.name}</span>
      <a href={`tel:${digits}`} aria-label={`${person.name} 전화하기`} data-testid="contact-call" style={circleBtn}>
        <PhoneIcon />
      </a>
      <a href={`sms:${digits}`} aria-label={`${person.name} 문자보내기`} data-testid="contact-sms" style={circleBtn}>
        <MessageIcon />
      </a>
    </div>
  );
}

/** 연락하기 오버레이(팝업). 반투명 배경을 덮고, x 또는 배경 클릭 시 닫힘. */
export function ContactModal({
  groom,
  bride,
  onClose,
}: {
  groom: ContactPerson[];
  bride: ContactPerson[];
  onClose: () => void;
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

  // 반투명 오버레이는 뷰포트 기준으로 덮여야 하므로 Portal 로 body 에 렌더한다.
  // (조상에 transform 이 있으면 position:fixed 기준이 뒤틀리는 문제 방지)
  return createPortal(
    <div
      data-testid="contact-modal"
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
          maxWidth: 400,
          maxHeight: '85vh',
          overflowY: 'auto',
          background: '#fdfbf7',
          borderRadius: 12,
          padding: '18px 20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
          border: `1px solid ${LINE}`,
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 8 }}>
          <h3 style={{ fontWeight: 600 }}>연락하기</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            data-testid="contact-close"
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

        {/* 신랑측 */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)', borderBottom: `1px solid ${LINE}`, paddingBottom: 6 }}>
            신랑측
          </div>
          {groom.map((p, i) => (
            <ContactRow key={i} person={p} />
          ))}
        </div>

        {/* 신부측 */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)', borderBottom: `1px solid ${LINE}`, paddingBottom: 6 }}>
            신부측
          </div>
          {bride.map((p, i) => (
            <ContactRow key={i} person={p} />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
