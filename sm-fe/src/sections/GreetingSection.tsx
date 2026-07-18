import { useContent } from '../content/ContentProvider';
import { ScrollReveal } from '../components/ScrollReveal';

/** FR-03: 인사말 (INVITATION 헤더 + 시 인용 + 초대 문구 + 양가 부모님/신랑·신부). */
export function GreetingSection() {
  const { greeting } = useContent();
  const { groom, bride } = greeting;

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
          {groom.parents.father} · {groom.parents.mother}의 아들 <strong>{groom.name}</strong>
        </p>
        <p>
          {bride.parents.father} · {bride.parents.mother}의 딸 <strong>{bride.name}</strong>
        </p>
      </div>
    </ScrollReveal>
  );
}
