import { useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { SectionContainer } from '../components/SectionContainer';
import { ContactModal } from '../components/ContactModal';

/** 신랑/신부 소개 자리 → '연락하기' 버튼 + 오버레이(전화/문자 연결). */
export function ContactSection() {
  const { contacts } = useContent();
  const [open, setOpen] = useState(false);

  return (
    <SectionContainer id="contact">
      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          data-testid="contact-open"
          onClick={() => setOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            borderRadius: 24,
            border: '1px solid var(--color-accent)',
            background: '#fff',
            color: 'var(--color-accent)',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1l-2.2 2.3z" />
          </svg>
          연락하기
        </button>
      </div>

      {open && (
        <ContactModal groom={contacts.groom} bride={contacts.bride} onClose={() => setOpen(false)} />
      )}
    </SectionContainer>
  );
}
