import { useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { ScrollReveal } from '../components/ScrollReveal';
import { ContactModal } from '../components/ContactModal';

/** FR-03: 인사말 (INVITATION 헤더 + 시 인용 + 초대 문구 + 양가 부모님/신랑·신부 + 연락하기). */
export function GreetingSection() {
  const { greeting, contacts } = useContent();
  const { groom, bride } = greeting;
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <ScrollReveal id="greeting">
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        {greeting.label && (
          <div style={{ letterSpacing: '0.25em', fontSize: '0.72rem', color: 'var(--color-accent)' }}>
            {greeting.label}
          </div>
        )}
        {greeting.title && (
          <h2 style={{ color: 'var(--color-accent)', fontWeight: 500, marginTop: 8 }}>{greeting.title}</h2>
        )}
      </div>

      {/* 시 인용 */}
      {greeting.poem && (
        <p
          data-testid="greeting-poem"
          style={{ textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.9, color: 'var(--color-text)' }}
        >
          {greeting.poem}
        </p>
      )}
      {greeting.poemSource && (
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem', marginTop: 18 }}>
          {greeting.poemSource}
        </p>
      )}

      {/* 초대 문구 */}
      <p
        data-testid="greeting-message"
        style={{ textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.9, marginTop: 28 }}
      >
        {greeting.message}
      </p>

      {/* 구분선 */}
      <div style={{ width: 40, height: 1, background: '#d8d0c8', margin: '28px auto' }} />

      {/* 양가 부모님 · 신랑/신부 */}
      <div style={{ textAlign: 'center', lineHeight: 2.2 }}>
        <p>
          {groom.parents.father} · {groom.parents.mother}의 장남 <strong>{groom.name}</strong>
        </p>
        <p>
          {bride.parents.father} · {bride.parents.mother}의 차녀 <strong>{bride.name}</strong>
        </p>
      </div>

      {/* 연락하기 (부모님·신랑신부 정보 바로 아래) */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button
          type="button"
          data-testid="contact-open"
          onClick={() => setContactOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            borderRadius: 24,
            border: '1px solid var(--color-accent)',
            background: '#fff',
            color: 'var(--color-accent)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1l-2.2 2.3z" />
          </svg>
          연락하기
        </button>
      </div>

      {contactOpen && (
        <ContactModal groom={contacts.groom} bride={contacts.bride} onClose={() => setContactOpen(false)} />
      )}
    </ScrollReveal>
  );
}
