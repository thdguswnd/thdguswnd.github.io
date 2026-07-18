import { useContent } from '../content/ContentProvider';

/** FR-01: 메인 사진 배경 + 제목 오버레이. */
export function HeroSection() {
  const { main } = useContent();
  return (
    <section
      className="section is-visible"
      data-testid="hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '30vh',
        color: '#fff',
        textAlign: 'center',
        backgroundImage: `url(${main.heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div style={{ textShadow: '0 1px 6px rgba(0,0,0,0.35)' }}>
        <h1 style={{ fontWeight: 400, letterSpacing: '0.1em', lineHeight: 1.4 }}>
          <span style={{ display: 'block', fontSize: '2.4rem' }}>{main.title}</span>
          {main.titleSecondary && (
            <span style={{ display: 'block', fontSize: '1.6rem' }}>{main.titleSecondary}</span>
          )}
        </h1>
        {main.subtitle && <p style={{ marginTop: 12 }}>{main.subtitle}</p>}
      </div>
    </section>
  );
}
