import { useEffect, useState, type CSSProperties } from 'react';
import { useContent } from '../content/ContentProvider';
import { extractPalette, applyPalette } from '../lib/theme';
import { currentSet, mainImages } from '../lib/imageSets';

const SHADOW = '0 1px 8px rgba(0, 0, 0, 0.5)';

/** 배경 사진 위 절대위치 레이어 공통 스타일. */
function layer(extra: CSSProperties): CSSProperties {
  return {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#fff',
    textShadow: SHADOW,
    whiteSpace: 'nowrap',
    ...extra,
  };
}

/** FR-01: 메인(포스터형). 배경 사진 위에 환영 메시지·신랑/신부·날짜를 포스터처럼 배치. 이미지 key color 로 테마 설정. */
export function HeroSection() {
  const { main, greeting, calendar } = useContent();
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

  const dateStr = calendar.weddingDate.replace(/-/g, '.'); // 2026.11.15

  return (
    <section
      className="section is-visible hero-full"
      data-testid="hero-section"
      style={{
        position: 'relative',
        padding: 0,
        color: '#fff',
        backgroundImage: `url(${heroSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 상단 1/3: 환영 메시지(크게) */}
      <div style={layer({ top: '24%', left: '50%', width: '88%', whiteSpace: 'normal' })}>
        <div style={{ fontWeight: 400, letterSpacing: '0.05em', lineHeight: 1.35 }}>
          <div style={{ fontSize: '2.4rem' }}>{main.title}</div>
          {main.titleSecondary && <div style={{ fontSize: '1.8rem' }}>{main.titleSecondary}</div>}
        </div>
      </div>

      {/* 세로 2/3: 신랑(가로 1/3) · 신부(가로 2/3) */}
      <div style={layer({ top: '66%', left: '33%', fontSize: '1.4rem', letterSpacing: '0.12em' })}>
        {greeting.groom.name}
      </div>
      <div style={layer({ top: '66%', left: '66%', fontSize: '1.4rem', letterSpacing: '0.12em' })}>
        {greeting.bride.name}
      </div>

      {/* 세로 4/5, 가로 1/2: 날짜 */}
      <div style={layer({ top: '80%', left: '50%', fontSize: '1.25rem', letterSpacing: '0.18em' })}>
        {dateStr}
      </div>
    </section>
  );
}
