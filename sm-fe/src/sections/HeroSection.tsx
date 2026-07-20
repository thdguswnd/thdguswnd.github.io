import { useEffect, useState } from 'react';
import { useContent } from '../content/ContentProvider';
import { extractPalette, applyPalette } from '../lib/theme';

// src/assets/main/ 내 이미지 수집 → 접속 시 랜덤 1장 사용.
// webp 는 `yarn optimize:images` 로 미리 최적화된 파일. 없으면 콘텐츠 heroImage 로 폴백.
const mainImages = import.meta.glob('../assets/main/*.{webp,jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const heroUrls = Object.values(mainImages);

/** FR-01: 메인 사진(랜덤) 배경 + 제목 오버레이. 이미지 key color 로 전체 테마 설정. */
export function HeroSection() {
  const { main } = useContent();
  const [heroSrc] = useState(() =>
    heroUrls.length ? heroUrls[Math.floor(Math.random() * heroUrls.length)] : main.heroImage,
  );

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
