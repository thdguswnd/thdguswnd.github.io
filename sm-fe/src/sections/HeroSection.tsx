import { useEffect, useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { extractPalette, applyPalette } from '../lib/theme';
import { currentSet, mainImages } from '../lib/imageSets';

/** FR-01: 메인 사진(현재 세트에서 랜덤) 배경 + 제목 오버레이. 이미지 key color 로 전체 테마 설정. */
export function HeroSection() {
  const { main } = useContent();
  const [heroSrc] = useState(() => {
    const urls = mainImages(currentSet());
    return urls.length ? urls[Math.floor(Math.random() * urls.length)] : main.heroImage;
  });

  useEffect(() => {
    let cancelled = false;
    extractPalette(heroSrc).then((p) => {
      if (!cancelled && p) applyPalette(p);
    });
    return () => {
      cancelled = true;
    };
  }, [heroSrc]);

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
        backgroundImage: `url(${heroSrc})`,
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
